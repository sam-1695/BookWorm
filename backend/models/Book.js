const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  coverPhoto: {
    type: String, // URL to image
  },
  description: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);