const Book = require("../models/Book");
const fs = require("fs");
const path = require("path");

// ======================================
// GET ALL BOOKS
// ======================================

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      books,
    });
  } catch (error) {
    console.error("Get books error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================
// GET SINGLE BOOK
// ======================================

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      book,
    });
  } catch (error) {
    console.error("Get book error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================
// CREATE BOOK
// ======================================

const createBook = async (req, res) => {
  const pdfFile = req.files?.pdf?.[0] || null;
  const coverFile = req.files?.cover?.[0] || null;

  try {
    const {
      title,
      author,
      description,
      price,
      category,
    } = req.body;

    // ==============================
    // BASIC VALIDATION
    // ==============================

    if (
      !title?.trim() ||
      !author?.trim() ||
      !description?.trim() ||
      price === undefined ||
      !pdfFile ||
      !coverFile
    ) {
      return res.status(400).json({
        message:
          "Title, author, description, price, PDF and cover image are required",
      });
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    // ==============================
    // CREATE BOOK
    // ==============================

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category?.trim() || "Other",
      coverImage: coverFile.filename,
      pdfFile: pdfFile.filename,
    });

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    console.error("Create book error:", error);

    // Cleanup uploaded PDF
    if (pdfFile) {
      const pdfPath = path.join(
        __dirname,
        "../uploads",
        pdfFile.filename
      );

      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Cleanup uploaded cover
    if (coverFile) {
      const coverPath = path.join(
        __dirname,
        "../uploads/covers",
        coverFile.filename
      );

      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================
// DELETE BOOK
// ======================================

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Delete PDF
    if (book.pdfFile) {
      const pdfPath = path.join(
        __dirname,
        "../uploads",
        book.pdfFile
      );

      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Delete cover
    if (book.coverImage) {
      const coverPath = path.join(
        __dirname,
        "../uploads/covers",
        book.coverImage
      );

      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete book error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================
// UPDATE BOOK
// ======================================

const updateBook = async (req, res) => {
  const pdfFile = req.files?.pdf?.[0] || null;
  const coverFile = req.files?.cover?.[0] || null;

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const {
      title,
      author,
      description,
      price,
      category,
    } = req.body;

    // ==============================
    // BASIC VALIDATION
    // ==============================

    if (
      !title?.trim() ||
      !author?.trim() ||
      !description?.trim() ||
      price === undefined
    ) {
      return res.status(400).json({
        message:
          "Title, author, description and price are required",
      });
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    const oldPdf = book.pdfFile;
    const oldCover = book.coverImage;

    // ==============================
    // UPDATE BOOK DATA
    // ==============================

    book.title = title.trim();
    book.author = author.trim();
    book.description = description.trim();
    book.price = numericPrice;
    book.category = category?.trim() || "Other";

    // New PDF
    if (pdfFile) {
      book.pdfFile = pdfFile.filename;
    }

    // New cover
    if (coverFile) {
      book.coverImage = coverFile.filename;
    }

    await book.save();

    // ==============================
    // DELETE OLD PDF
    // ==============================

    if (pdfFile && oldPdf) {
      const oldPdfPath = path.join(
        __dirname,
        "../uploads",
        oldPdf
      );

      if (fs.existsSync(oldPdfPath)) {
        fs.unlinkSync(oldPdfPath);
      }
    }

    // ==============================
    // DELETE OLD COVER
    // ==============================

    if (coverFile && oldCover) {
      const oldCoverPath = path.join(
        __dirname,
        "../uploads/covers",
        oldCover
      );

      if (fs.existsSync(oldCoverPath)) {
        fs.unlinkSync(oldCoverPath);
      }
    }

    res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    console.error("Update book error:", error);

    // Cleanup newly uploaded PDF
    if (pdfFile) {
      const pdfPath = path.join(
        __dirname,
        "../uploads",
        pdfFile.filename
      );

      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Cleanup newly uploaded cover
    if (coverFile) {
      const coverPath = path.join(
        __dirname,
        "../uploads/covers",
        coverFile.filename
      );

      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  deleteBook,
  updateBook,
};