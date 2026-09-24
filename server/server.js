const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// ======================================
// MIDDLEWARE
// ======================================

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: [
          "'self'",
          "data:",
          "http://localhost:5000",
        ],
      },
    },

    // Allow frontend (localhost:5173)
    // to load images from backend (localhost:5000)
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
    message:
      "Too many requests. Please try again later.",
  },
});

// ======================================
// PUBLIC COVER IMAGES
// ======================================

app.use(
  "/uploads/covers",
  express.static(
    path.join(__dirname, "uploads/covers")
  )
);

// ======================================
// API ROUTES
// ======================================

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use(
  "/api/books",
  bookRoutes
);

app.use(
  "/api/purchases",
  purchaseRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

// ======================================
// TEST ROUTE
// ======================================

app.get("/", (req, res) => {
  res.json({
    message:
      "E-Book Store API is running 🚀",
  });
});

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
  console.error(
    "Global error:",
    err
  );

  res.status(500).json({
    message:
      "Something went wrong on the server",
  });
});

// ======================================
// MONGODB CONNECTION
// ======================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully ✅"
    );

    app.listen(
      process.env.PORT,
      () => {
        console.log(
          `Server running on http://localhost:${process.env.PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
  });