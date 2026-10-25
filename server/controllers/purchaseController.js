const Purchase = require("../models/Purchase");
const Book = require("../models/Book");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { generateEbookPdf } = require("../utils/pdfGenerator");

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

    // Admin has access to all books
    if (req.user?.role === "admin") {
      return res.status(200).json({
        message: "Admin access granted",
        hasAccess: true,
      });
    }

    const purchase = await Purchase.findOne({
      user: req.user.userId,
      book: bookId,
      paymentStatus: "paid",
    });

    if (!purchase) {
      return res.status(200).json({
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

    // Non-admin users must have purchased the book
    if (req.user?.role !== "admin") {
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
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const safeTitle = (book.title || "ebook")
      .replace(/[^a-zA-Z0-9_\- ]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    const downloadFilename = `${safeTitle || "ebook"}.pdf`;

    const filePath = path.join(
      __dirname,
      "../uploads",
      book.pdfFile || ""
    );

    // 1. If file exists on server disk and is valid, download it directly
    if (book.pdfFile && fs.existsSync(filePath)) {
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile() && stat.size > 0) {
          res.setHeader(
            "Access-Control-Expose-Headers",
            "Content-Disposition, Content-Length"
          );
          return res.download(
            filePath,
            downloadFilename,
            (error) => {
              if (error && !res.headersSent) {
                console.error("PDF download error:", error);
                res.status(500).json({
                  message: "Download error",
                });
              }
            }
          );
        }
      } catch (statError) {
        console.warn("Local PDF check failed, falling back to dynamic generator:", statError);
      }
    }

    // 2. If file is not present on disk (e.g. Vercel serverless environment),
    // dynamically generate and stream a complete, beautifully designed eBook edition!
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadFilename}"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Content-Disposition, Content-Length"
      );
      return res.send(pdfBuffer);
    });

    doc.on("error", (err) => {
      console.error("PDF generation stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          message: "Failed to generate eBook PDF",
        });
      }
    });

    generateEbookPdf(doc, book);
    doc.end();

  } catch (error) {
    console.error("Download book error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Server error",
      });
    }
  }
};

module.exports = {
  createPurchase,
  getMyPurchases,
  checkBookAccess,
  downloadBook,
};