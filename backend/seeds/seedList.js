require("dotenv").config();
const mongoose = require("mongoose");
const List = require("../models/List");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const list = await List.create({
      userId: "69f2c469d152726997ea9611",
      name: "Favorites",
      books: ["69f2c48162131ead02fe4cfc"],
    });

    console.log("List created:", list);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();