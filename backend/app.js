// this is where we setup middleware, CORS, and our routes

const express = require("express");
const cors = require("cors");

const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const listRoutes = require("./routes/listRoutes");

const app = express();

// middleware
app.use(cors());

// Needed for base64 profile image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// test route
app.get("/", (req, res) => {
  res.send("Book Worm API is running");
});

// express REST API routes
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/lists", listRoutes);

module.exports = app;