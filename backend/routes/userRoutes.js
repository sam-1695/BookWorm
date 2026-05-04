//this is the list API to perform CRUD operations from database for user models

const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
} = require("../controllers/userController");

// GET /api/users
router.get("/", getUsers);

// GET /api/users/:id
router.get("/:id", getUserById);

// POST /api/users
router.post("/", createUser);

// PUT /api/users/:id
router.put("/:id", updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

// PUT /api/users/:id/friend-request
router.put("/:id/friend-request", sendFriendRequest);

// PUT /api/users/:id/accept-friend
router.put("/:id/accept-friend", acceptFriendRequest);

// PUT /api/users/:id/remove-friend
router.put("/:id/remove-friend", removeFriend);

module.exports = router;