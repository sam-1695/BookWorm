require("dotenv").config();
const mongoose = require("mongoose");
const Review = require("./models/Review");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const review = await Review.create({
      userId: "69f2c469d152726997ea9611",
      bookId: "69f2c48162131ead02fe4cfc",
      rating: 5,
      comment: "Amazing book!",
    });

    console.log("Review created:", review);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();