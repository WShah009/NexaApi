// console.log("wahab api");
const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/productModel");
const User = require("./models/userSchema");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Hassa zaheem");
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email in the database
    const user = await User.findOne({ email });
    // If user is not found or password doesn't match, return error
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // If user is found and password matches, return success
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
mongoose
  .connect(
    "mongodb+srv://abwahab756:OaDVRznZvv28TgzY@cluster0.hbjtotg.mongodb.net/Node-Api?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to mongo DB");
    app.listen(port, () => {
      console.log(`Example app listenin on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("Error :>", error);
  });
