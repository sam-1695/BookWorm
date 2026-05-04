//where we handle the operations for the book model
//controls the data flow from the database to the frontend

const Book = require("../models/Book");

// GET all books
const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: "Error getting books", error: err.message });
  }
};

// GET one book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ message: "Error getting book", error: err.message });
  }
};

// CREATE a new book
const createBook = async (req, res) => {
  try {
    const { title, author, coverPhoto, description } = req.body;

    const newBook = await Book.create({
      title,
      author,
      coverPhoto,
      description,
    });

    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: "Error creating book", error: err.message });
  }
};

// UPDATE a book
const updateBook = async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: "Error updating book", error: err.message });
  }
};

// DELETE a book
const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting book", error: err.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};