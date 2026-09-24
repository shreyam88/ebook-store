const Review = require("../models/Review");
const Purchase = require("../models/Purchase");
const Book = require("../models/Book");

// Add review
const addReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;

    if (!bookId || rating === undefined || !comment) {
      return res.status(400).json({
        message: "Book ID, rating and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Check purchase
    const purchase = await Purchase.findOne({
      user: req.user.userId,
      book: bookId,
      paymentStatus: "paid",
    });

    if (!purchase) {
      return res.status(403).json({
        message: "You can review only purchased books",
      });
    }

    // Check existing review
    const existingReview = await Review.findOne({
      user: req.user.userId,
      book: bookId,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You already reviewed this book",
      });
    }

    const review = await Review.create({
      user: req.user.userId,
      book: bookId,
      rating,
      comment,
    });

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Add review error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get reviews for a book
const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      book: req.params.bookId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getBookRating = async (req, res) => {
  try {
    const reviews = await Review.find({
      book: req.params.bookId,
    });

    if (reviews.length === 0) {
      return res.status(200).json({
        averageRating: 0,
        totalReviews: 0,
      });
    }

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating = (
      totalRating / reviews.length
    ).toFixed(1);

    res.status(200).json({
      averageRating: Number(averageRating),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error(
      "Get book rating error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addReview,
  getBookReviews,
  getBookRating,
};