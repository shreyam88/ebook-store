const express = require("express");

const {
  getBooks,
  getBookById,
  createBook,
  deleteBook,
  updateBook,
} = require("../controllers/bookController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ======================================
// GET ALL BOOKS
// ======================================

router.get("/", getBooks);

// ======================================
// CREATE BOOK
// Admin + PDF + Cover Upload
// ======================================

router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    {
      name: "pdf",
      maxCount: 1,
    },
    {
      name: "cover",
      maxCount: 1,
    },
  ]),
  createBook
);

// ======================================
// UPDATE BOOK
// Admin + Optional PDF + Optional Cover
// ======================================

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.fields([
    {
      name: "pdf",
      maxCount: 1,
    },
    {
      name: "cover",
      maxCount: 1,
    },
  ]),
  updateBook
);

// ======================================
// DELETE BOOK
// ======================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteBook
);

// ======================================
// GET SINGLE BOOK
// ======================================

router.get(
  "/:id",
  getBookById
);

module.exports = router;