//this is the review API to perform CRUD operations from database for review models

const express = require("express");
const router = express.Router();

const {
  getReviews,
  getReviewsByBook,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

//GET /api/reviews
router.get("/", getReviews);

//GET /api/reviews/book/:bookId
router.get("/book/:bookId", getReviewsByBook);

//GET /api/reviews/user/:userId
router.get("/user/:userId", getReviewsByUser);

//POST /api/reviews
router.post("/", createReview);

//PUT /api/reviews/:id
router.put("/:id", updateReview);

//DELETE /api/reviews/:id
router.delete("/:id", deleteReview);

module.exports = router;