const Purchase = require("../models/Purchase");
const Book = require("../models/Book");
const path = require("path");
const fs = require("fs");

// ======================================
// CREATE PURCHASE
// ======================================

const createPurchase = async (req, res) => {
  try {
    const { bookId, amount, paymentId } = req.body;

    if (!bookId || amount === undefined) {
      return res.status(400).json({
        message: "Book ID and amount are required",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const existingPurchase = await Purchase.findOne({
      user: req.user.userId,
      book: bookId,
      paymentStatus: "paid",
    });

    if (existingPurchase) {
      return res.status(409).json({
        message: "You already purchased this book",
      });
    }

    const purchase = await Purchase.create({
      user: req.user.userId,
      book: bookId,
      amount,
      paymentStatus: paymentId ? "paid" : "pending",
      paymentId: paymentId || null,
    });

    res.status(201).json({
      message: "Purchase created successfully",
      purchase,
    });
  } catch (error) {
    console.error("Create purchase error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================
// GET MY PURCHASES
// ======================================

const getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      user: req.user.userId,
      paymentStatus: "paid",
    })
      .populate("book")
      .sort({ createdAt: -1 });

    res.status(200).json({
      purchases,
    });
  } catch (error) {
    console.error("Get purchases error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================
// CHECK BOOK ACCESS
// ======================================

const checkBookAccess = async (req, res) => {
  try {
    const { bookId } = req.params;

    const purchase = await Purchase.findOne({
      user: req.user.userId,
      book: bookId,
      paymentStatus: "paid",
    });

    if (!purchase) {
      return res.status(403).json({
        message: "You have not purchased this book",
        hasAccess: false,
      });
    }

    res.status(200).json({
      message: "You have access to this book",
      hasAccess: true,
      purchase,
    });
  } catch (error) {
    console.error("Check book access error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================
// DOWNLOAD PURCHASED BOOK
// ======================================

const downloadBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const purchase = await Purchase.findOne({
      user: req.user.userId,
      book: bookId,
      paymentStatus: "paid",
    });

    if (!purchase) {
      return res.status(403).json({
        message: "You have not purchased this book",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const filePath = path.join(
      __dirname,
      "../uploads",
      book.pdfFile
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "PDF file not found on server",
      });
    }

    res.download(
      filePath,
      book.pdfFile,
      (error) => {
        if (error) {
          console.error(
            "PDF download error:",
            error
          );
        }
      }
    );
  } catch (error) {
    console.error(
      "Download book error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createPurchase,
  getMyPurchases,
  checkBookAccess,
  downloadBook,
};