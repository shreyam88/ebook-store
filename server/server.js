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
// TEST & HEALTH CHECK ROUTES
// ======================================

app.get("/", (req, res) => {
  res.json({
    message: "E-Book Store API is running 🚀",
    status: "online",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ======================================
// MONGODB CONNECTION & SERVERLESS MIDDLEWARE
// ======================================

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("⚠️ MONGO_URI is not defined in environment variables!");
    return;
  }

  try {
    const db = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully ✅");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

// Ensure database connection before processing API requests
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
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