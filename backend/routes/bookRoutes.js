//this is the book API to perform CRUD operations from database for book models

const express = require("express");
const router = express.Router();

const {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
} = require("../controllers/bookController");

//GET /api/books
router.get("/", getBooks);

//GET /api/books/:id
router.get("/:id", getBookById);

//POST /api/books
router.post("/", createBook);

//PUT /api/books/:id
router.put("/:id", updateBook);

//DELETE /api/books/:id
router.delete("/:id", deleteBook);

module.exports = router;