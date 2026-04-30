const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true, // "Favorites", "Want to Read"
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("List", listSchema);