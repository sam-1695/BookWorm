//where we handle the operations for the list model
//controls the data flow from the database to the frontend

const List = require("../models/List");

// GET all lists
const getLists = async (req, res) => {
  try {
    const lists = await List.find()
      .populate("userId", "username email")
      .populate("books")
      .sort({ createdAt: -1 });

    res.status(200).json(lists);
  } catch (err) {
    res.status(500).json({ message: "Error getting lists", error: err.message });
  }
};

// GET lists for one user
const getListsByUser = async (req, res) => {
  try {
    const lists = await List.find({ userId: req.params.userId })
      .populate("books")
      .sort({ createdAt: -1 });

    res.status(200).json(lists);
  } catch (err) {
    res.status(500).json({ message: "Error getting user lists", error: err.message });
  }
};

// CREATE a list
const createList = async (req, res) => {
  try {
    const { userId, name, books } = req.body;

    const list = await List.create({
      userId,
      name,
      books: books || [],
    });

    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ message: "Error creating list", error: err.message });
  }
};

// UPDATE list name or books
const updateList = async (req, res) => {
  try {
    const updatedList = await List.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("books");

    if (!updatedList) {
      return res.status(404).json({ message: "List not found" });
    }

    res.status(200).json(updatedList);
  } catch (err) {
    res.status(400).json({ message: "Error updating list", error: err.message });
  }
};

// DELETE list
const deleteList = async (req, res) => {
  try {
    const deletedList = await List.findByIdAndDelete(req.params.id);

    if (!deletedList) {
      return res.status(404).json({ message: "List not found" });
    }

    res.status(200).json({ message: "List deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting list", error: err.message });
  }
};

// ADD book to list
const addBookToList = async (req, res) => {
  try {
    const { bookId } = req.body;

    const list = await List.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { books: bookId } },
      { new: true }
    ).populate("books");

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    res.status(200).json(list);
  } catch (err) {
    res.status(400).json({ message: "Error adding book to list", error: err.message });
  }
};

// REMOVE book from list
const removeBookFromList = async (req, res) => {
  try {
    const { bookId } = req.body;

    const list = await List.findByIdAndUpdate(
      req.params.id,
      { $pull: { books: bookId } },
      { new: true }
    ).populate("books");

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    res.status(200).json(list);
  } catch (err) {
    res.status(400).json({ message: "Error removing book from list", error: err.message });
  }
};

module.exports = {
  getLists,
  getListsByUser,
  createList,
  updateList,
  deleteList,
  addBookToList,
  removeBookFromList,
};