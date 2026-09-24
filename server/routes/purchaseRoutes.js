const express = require("express");

const {
  getMyPurchases,
  checkBookAccess,
  downloadBook,
} = require("../controllers/purchaseController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get my purchased books
router.get(
  "/my",
  protect,
  getMyPurchases
);

// Check access to a book
router.get(
  "/access/:bookId",
  protect,
  checkBookAccess
);

// Download purchased PDF
router.get(
  "/download/:bookId",
  protect,
  downloadBook
);

module.exports = router;