const express = require("express");
const path = require("path");
const fs = require("fs");
const dns = require("dns");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignored in restricted environments
}

require("dotenv").config({ path: path.join(__dirname, ".env") });

const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

app.set("trust proxy", 1);

// ======================================
// CORS CONFIGURATION
// ======================================

const allowedOrigins = [
  "https://ebook-store-4uur.vercel.app",
  "https://ebook-store-cmdx.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",").forEach((url) => {
    const trimmed = url.trim().replace(/\/+$/, "");
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    try {
      const parsedOrigin = new URL(origin);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        parsedOrigin.hostname.endsWith(".vercel.app") ||
        parsedOrigin.hostname === "localhost" ||
        parsedOrigin.hostname === "127.0.0.1";

      if (isAllowed) {
        return callback(null, true);
      }
    } catch (e) {
      // Invalid origin URL format
    }

    // Allow origin to prevent unexpected deployment blocks
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
};

app.use(cors(corsOptions));

// ======================================
// HELMET SECURITY HEADERS
// ======================================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
      },
    },
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// JSON body parser
app.use(express.json());

// ======================================
// AUTH RATE LIMITER
// ======================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

// ======================================
// PUBLIC COVER IMAGES
// ======================================

const uploadsDir = path.join(__dirname, "uploads");
const coversDir = path.join(__dirname, "uploads/covers");

try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
} catch (e) {
  // Read-only filesystem warning in serverless environments
}

app.use(
  "/uploads/covers",
  express.static(coversDir, {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// ======================================
// MONGODB CONNECTION & SERVERLESS CACHING
// ======================================

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    const errorMsg = "MONGO_URI is not defined in environment variables";
    console.warn(`⚠️ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      })
      .then((m) => {
        console.log("MongoDB connected successfully ✅");
        return m.connection;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

// ======================================
// TEST & HEALTH CHECK ROUTES
// ======================================

app.get("/", (req, res) => {
  res.json({
    message: "E-Book Store API is running 🚀",
    status: "online",
  });
});

app.get("/api/health", async (req, res) => {
  let dbStatus = "disconnected";
  let dbError = null;

  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    dbStatus = "connected";
  } catch (err) {
    dbError = err.message;
  }

  res.json({
    status: "ok",
    database: dbStatus,
    hasMongoUri: !!process.env.MONGO_URI,
    hasRazorpayKeys: !!(
      process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ),
    ...(dbError && { error: dbError }),
    timestamp: new Date().toISOString(),
  });
});

// Ensure database connection before processing API requests
app.use(async (req, res, next) => {
  if (req.path === "/api/health" || req.path === "/") {
    return next();
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    return res.status(503).json({
      message: "Database connection failed",
      error:
        process.env.NODE_ENV === "production"
          ? "Database service unavailable. Ensure MONGO_URI is set and MongoDB Atlas allows 0.0.0.0/0 IP access."
          : error.message,
    });
  }
});

// ======================================
// API ROUTES
// ======================================

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);


// ======================================
// 404 HANDLER
// ======================================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// ======================================
// GLOBAL ERROR HANDLER
// ======================================

app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(500).json({
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

// ======================================
// SERVER INITIALIZATION
// ======================================

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;