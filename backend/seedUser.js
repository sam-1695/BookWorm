require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.create({
      username: "testuser",
      email: "testuser@example.com",
      password: "123456",
    });

    console.log("User created:", user);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();