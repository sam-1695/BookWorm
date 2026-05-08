// Mongoose Schema Model 1: User (username, email, password, friends, friendRequests)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },

  bio: {
    type: String,
    default: "",
  },

  profilePicture: {
    type: String,
    default: "",
  },

  // Friends system
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // Optional: pending friend requests (nice upgrade)
  friendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

   // Starts blank for new accounts
  recentReads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);