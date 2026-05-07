const User = require("../models/User");
const List = require("../models/List");

function idMatches(idFromDb, idString) {
  return idFromDb.toString() === idString.toString();
}

async function formatUser(userId) {
  const user = await User.findById(userId)
    .select("-password")
    .populate("friends", "username email profilePicture")
    .populate("friendRequests", "username email profilePicture")
    .populate("recentReads");

  return user;
}

// GET all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("friends", "username email profilePicture")
      .populate("friendRequests", "username email profilePicture")
      .populate("recentReads");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error getting users", error: err.message });
  }
};

// GET one user
const getUserById = async (req, res) => {
  try {
    const user = await formatUser(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error getting user", error: err.message });
  }
};

// CREATE user
const createUser = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      bio: "",
      profilePicture: "",
      friends: [],
      friendRequests: [],
      recentReads: [],
    });

    // Create exactly one default Favorites list for this new user
    await List.findOneAndUpdate(
      {
        userId: newUser._id,
        name: { $regex: /^favorites$/i },
      },
      {
        $setOnInsert: {
          userId: newUser._id,
          name: "Favorites",
          books: [],
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    const userToReturn = await formatUser(newUser._id);

    res.status(201).json(userToReturn);
  } catch (err) {
    res.status(400).json({ message: "Error creating user", error: err.message });
  }
};

// UPDATE user
const updateUser = async (req, res) => {
  try {
    const allowedUpdates = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      bio: req.body.bio,
      profilePicture: req.body.profilePicture,
      friends: req.body.friends,
      friendRequests: req.body.friendRequests,
      recentReads: req.body.recentReads,
    };

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    if (allowedUpdates.email) {
      allowedUpdates.email = allowedUpdates.email.trim().toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToReturn = await formatUser(updatedUser._id);

    res.status(200).json(userToReturn);
  } catch (err) {
    res.status(400).json({ message: "Error updating user", error: err.message });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await List.deleteMany({ userId: req.params.id });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

// LOGIN a user
const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const userToReturn = await formatUser(user._id);

    res.status(200).json({
      message: "Login successful",
      user: userToReturn,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error logging in",
      error: err.message,
    });
  }
};

// SEND friend request
const sendFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const { senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ message: "Sender ID is required" });
    }

    if (receiverId === senderId) {
      return res.status(400).json({ message: "You cannot friend yourself" });
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFriends = receiver.friends.some((id) => idMatches(id, senderId));

    if (alreadyFriends) {
      return res.status(400).json({ message: "Users are already friends" });
    }

    const alreadyRequested = receiver.friendRequests.some((id) => idMatches(id, senderId));

    if (alreadyRequested) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    receiver.friendRequests.push(senderId);
    await receiver.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    res.status(400).json({ message: "Error sending friend request", error: err.message });
  }
};

// ACCEPT friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const { senderId } = req.body;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!receiver.friends.some((id) => idMatches(id, senderId))) {
      receiver.friends.push(senderId);
    }

    if (!sender.friends.some((id) => idMatches(id, receiverId))) {
      sender.friends.push(receiverId);
    }

    receiver.friendRequests = receiver.friendRequests.filter(
      (requestId) => !idMatches(requestId, senderId)
    );

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(400).json({ message: "Error accepting friend request", error: err.message });
  }
};

// DECLINE friend request
const declineFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const { senderId } = req.body;

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    receiver.friendRequests = receiver.friendRequests.filter(
      (requestId) => !idMatches(requestId, senderId)
    );

    await receiver.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (err) {
    res.status(400).json({ message: "Error declining friend request", error: err.message });
  }
};

// REMOVE friend
const removeFriend = async (req, res) => {
  try {
    const userId = req.params.id;
    const { friendId } = req.body;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends = user.friends.filter((id) => !idMatches(id, friendId));
    friend.friends = friend.friends.filter((id) => !idMatches(id, userId));

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed" });
  } catch (err) {
    res.status(400).json({ message: "Error removing friend", error: err.message });
  }
};

// ADD recent read
const addRecentRead = async (req, res) => {
  try {
    const userId = req.params.id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { recentReads: bookId },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.recentReads.unshift(bookId);
    user.recentReads = user.recentReads.slice(0, 10);

    await user.save();

    const updatedUser = await formatUser(userId);

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "Error adding recent read", error: err.message });
  }
};

// REMOVE recent read
const removeRecentRead = async (req, res) => {
  try {
    const userId = req.params.id;
    const { bookId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.recentReads = user.recentReads.filter(
      (id) => !idMatches(id, bookId)
    );

    await user.save();

    const updatedUser = await formatUser(userId);

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "Error removing recent read", error: err.message });
  }
};

module.exports = {
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
};