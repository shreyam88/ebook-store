const Razorpay = require("razorpay");
const crypto = require("crypto");

const Book = require("../models/Book");
const Purchase = require("../models/Purchase");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =========================
// CREATE RAZORPAY ORDER
// =========================

const createOrder = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        message: "Book ID is required",
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

    const amount = Math.round(book.price * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Invalid book price",
      });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      message: "Razorpay order created successfully",
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    res.status(500).json({
      message: "Unable to create payment order",
    });
  }
};

// =========================
// VERIFY RAZORPAY PAYMENT
// =========================

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookId
    ) {
      return res.status(400).json({
        message: "Payment verification data is incomplete",
      });
    }

    // =========================
    // GET BOOK
    // =========================

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // =========================
    // VERIFY SIGNATURE
    // =========================

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (
      generatedSignature !== razorpay_signature
    ) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // =========================
    // FETCH RAZORPAY ORDER
    // =========================

    const order =
      await razorpay.orders.fetch(
        razorpay_order_id
      );

    // =========================
    // VERIFY ORDER CURRENCY
    // =========================

    if (order.currency !== "INR") {
      return res.status(400).json({
        message: "Invalid payment currency",
      });
    }

    // =========================
    // VERIFY ORDER AMOUNT
    // =========================

    const expectedAmount =
      Math.round(book.price * 100);

    if (order.amount !== expectedAmount) {
      return res.status(400).json({
        message: "Payment amount does not match book price",
      });
    }

    // =========================
    // VERIFY ORDER PAYMENT STATUS
    // =========================

    if (order.status !== "paid") {
      return res.status(400).json({
        message: "Razorpay order has not been paid",
      });
    }

    // =========================
    // CHECK DUPLICATE PURCHASE
    // =========================

    const existingPurchase =
      await Purchase.findOne({
        user: req.user.userId,
        book: bookId,
        paymentStatus: "paid",
      });

    if (existingPurchase) {
      return res.status(409).json({
        message: "Book already purchased",
      });
    }

    // =========================
    // SAVE PURCHASE
    // =========================

    const purchase = await Purchase.create({
      user: req.user.userId,
      book: bookId,
      amount: book.price,
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
    });

    res.status(200).json({
      message:
        "Payment verified and purchase saved successfully",
      purchase,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};