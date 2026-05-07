//where we handle the operations for the user model
//controls the data flow from the database to the frontend

const User = require("../models/User");

// GET all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("friends", "username email")
      .populate("friendRequests", "username email");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error getting users", error: err.message });
  }
};

// GET one user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("friends", "username email")
      .populate("friendRequests", "username email");

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
    const { username, email, password } = req.body;

    const newUser = await User.create({
      username,
      email,
      password,
    });

    // Do not send the password back
    const userToReturn = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      friends: newUser.friends,
      friendRequests: newUser.friendRequests,
    };

    res.status(201).json(userToReturn);
  } catch (err) {
    res.status(400).json({ message: "Error creating user", error: err.message });
  }
};

// UPDATE user
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
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

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

// SEND friend request
// req.params.id = user receiving the request
// req.body.senderId = user sending the request
const sendFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const { senderId } = req.body;

    if (receiverId === senderId) {
      return res.status(400).json({ message: "You cannot friend yourself" });
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    if (receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "Users are already friends" });
    }

    if (receiver.friendRequests.includes(senderId)) {
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
// req.params.id = user accepting the request
// req.body.senderId = user who originally sent the request
const acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const { senderId } = req.body;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add each user to the other's friends list
    if (!receiver.friends.includes(senderId)) {
      receiver.friends.push(senderId);
    }

    if (!sender.friends.includes(receiverId)) {
      sender.friends.push(receiverId);
    }

    // Remove the request from receiver's pending requests
    receiver.friendRequests = receiver.friendRequests.filter(
      (requestId) => requestId.toString() !== senderId
    );

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(400).json({ message: "Error accepting friend request", error: err.message });
  }
};

// REMOVE friend
// req.params.id = current user
// req.body.friendId = friend to remove
const removeFriend = async (req, res) => {
  try {
    const userId = req.params.id;
    const { friendId } = req.body;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends = user.friends.filter(
      (id) => id.toString() !== friendId
    );

    friend.friends = friend.friends.filter(
      (id) => id.toString() !== userId
    );

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed" });
  } catch (err) {
    res.status(400).json({ message: "Error removing friend", error: err.message });
  }
};

//LOGIN a user
const loginUser = async (req, res) => {
  try {
    const {email, password} = req.body;

    //check that the email and passwords were sent from angular
    if (!email || !password) {
      return res.status(400).json({message: "Email and password are required!"});
    }

    //find a user by email
    const user = await User.findOne({email: email.toLowerCase()});

    if (!user) {
      return res.status(401).json({message: "invalid email or password"});
    }

    //compare password - password stored as plain text
    if (user.password !== password) {
      return res.status(401).json({message: "Invalid email or password"});
    }

    //do not send password back to angular
    const userToReturn = {
      _id: user._id,
      username: user.username,
      email: user.email,
      friends: user.friends,
      friendRequests: user.friendRequests,
    };

    res.status(200).json({
      message: "Login successful",
      user: userToReturn,
    });
  } catch (err) {
    res.status(500).json({message: "Error logging in", error: err.message});
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
  removeFriend,
};