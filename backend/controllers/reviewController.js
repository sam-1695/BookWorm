//where we handle the operations for the review model
//controls the data flow from the database to the frontend

const Review = require("../models/Review");

// GET all reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "username email")
      .populate("bookId", "title author coverPhoto")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error getting reviews", error: err.message });
  }
};

// GET reviews for a specific book
const getReviewsByBook = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate("userId", "username email")
      .populate("bookId", "title author coverPhoto")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error getting book reviews", error: err.message });
  }
};

// GET reviews for a specific user
const getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .populate("bookId", "title author coverPhoto")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error getting user reviews", error: err.message });
  }
};

// CREATE review
const createReview = async (req, res) => {
  try {
    const { userId, bookId, rating, comment } = req.body;

    // Check if this user already reviewed this book
    const existing = await Review.findOne({ userId, bookId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this book." });
    }

    const review = await Review.create({
      userId,
      bookId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: "Error creating review", error: err.message });
  }
};

// UPDATE review
const updateReview = async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(updatedReview);
  } catch (err) {
    res.status(400).json({ message: "Error updating review", error: err.message });
  }
};

// DELETE review
const deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting review", error: err.message });
  }
};

module.exports = {
  getReviews,
  getReviewsByBook,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview,
};