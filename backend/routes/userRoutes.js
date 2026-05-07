const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  addRecentRead,
  removeRecentRead,
} = require("../controllers/userController");

// GET /api/users
router.get("/", getUsers);

// POST /api/users
router.post("/", createUser);

// POST /api/users/login
router.post("/login", loginUser);

// GET /api/users/:id
router.get("/:id", getUserById);

// PUT /api/users/:id
router.put("/:id", updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

// PUT /api/users/:id/friend-request
router.put("/:id/friend-request", sendFriendRequest);

// PUT /api/users/:id/accept-friend
router.put("/:id/accept-friend", acceptFriendRequest);

// PUT /api/users/:id/decline-friend
router.put("/:id/decline-friend", declineFriendRequest);

// PUT /api/users/:id/remove-friend
router.put("/:id/remove-friend", removeFriend);

// PUT /api/users/:id/recent-reads
router.put("/:id/recent-reads", addRecentRead);

// PUT /api/users/:id/recent-reads/remove
router.put("/:id/recent-reads/remove", removeRecentRead);

module.exports = router;