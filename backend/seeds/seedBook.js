require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("../models/Book");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const book = await Book.create({
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      coverPhoto: "https://example.com/gatsby.jpg",
      description: "A classic novel set in the 1920s.",
    });

    console.log("Book created:", book);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();