const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
  type: String,
  trim: true,
  default: "Other",
},

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    coverImage: {
      type: String,
      required: true,
    },

    pdfFile: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);