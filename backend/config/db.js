const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Mongo URI exists?", !!process.env.MONGO_URI);
    console.log("Mongo URI starts with:", process.env.MONGO_URI?.substring(0, 20));

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;