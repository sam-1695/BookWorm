//this is the list API to perform CRUD operations from database for list models

const express = require("express");
const router = express.Router();

const {
  getLists,
  getListsByUser,
  createList,
  updateList,
  deleteList,
  addBookToList,
  removeBookFromList,
} = require("../controllers/listController");

//GET /api/lists
router.get("/", getLists);

//GET /api/lists/user/:userId
router.get("/user/:userId", getListsByUser);

//POST /api/lists
router.post("/", createList);

//PUT /api/lists/:id
router.put("/:id", updateList);

//DELETE /api/lists/:id
router.delete("/:id", deleteList);

//PUT /api/lists/:id/add-book
router.put("/:id/add-book", addBookToList);

//PUT /api/lists/:id/remove-book
router.put("/:id/remove-book", removeBookFromList);

module.exports = router;