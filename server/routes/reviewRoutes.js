const express = require("express");

const {
  addReview,
  getBookReviews,
  getBookRating,
} = require("../controllers/reviewController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Add review — Login required
router.post("/", protect, addReview);

router.get("/rating/:bookId", getBookRating);

// Get book reviews — Public
router.get("/:bookId", getBookReviews);

module.exports = router;