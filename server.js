// console.log("wahab api");
const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/productModel");
const User = require("./models/userSchema");
const Data = require("./models/dataModel");
const app = express();
const port = 3000;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");

// Randomly generated secret key for testing purposes
const JWT_SECRET = "random_secret_key_for_testing";
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello Hassa zaheem");
});

// Middleware function to authenticate user
const authenticateUser = (req, res, next) => {
  // Extract the JWT token from the request headers
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token part

  console.log("Token received:", token); // Log the received token

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      // Token verification failed
      console.error("Token verification failed:", err);
      return res.status(401).json({ message: "Unauthorized" });
    } else {
      // Token verification successful, attach the decoded user information to the request object
      console.log("Token verified. Decoded token:", decodedToken);
      req.user = decodedToken;
      next();
    }
  });
};
// // Multer configuration to handle file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Directory to save uploaded files
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname); // Unique filename
//   },
// });

// const upload = multer({ storage: storage });

const upload = multer({ storage: multer.memoryStorage() });

app.post(
  "/save-data",
  authenticateUser,
  upload.single("image"),
  async (req, res) => {
    console.log("called");
    try {
      // Extract data from the request body
      const { name, price, companyName } = req.body;
      // Get the authenticated user ID
      const userId = req.user._id;

      // Access the uploaded file from memory
      const uploadedImage = req.file;

      // Save the data to the database, associating it with the user
      const savedData = await Data.create({
        user: userId,
        // Instead of saving the image path, you can directly save the buffer or base64 data
        image: {
          data: uploadedImage.buffer, // Buffer containing the file data
          contentType: uploadedImage.mimetype, // Mime type of the file
        },
        name,
        price,
        companyName,
      });

      res.status(201).json(savedData);
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
// // Route for saving data with an image
// app.post(
//   "/save-data",
//   authenticateUser,
//   upload.single("image"),
//   async (req, res) => {
//     console.log("called");
//     try {
//       // Extract data from the request body
//       const { name, price, companyName } = req.body;
//       // Get the authenticated user ID
//       const userId = req.user._id;

//       // Save the data to the database, associating it with the user
//       const savedData = await Data.create({
//         user: userId,
//         image: req.file.path, // Save the path to the uploaded image
//         name,
//         price,
//         companyName,
//       });

//       res.status(201).json(savedData);
//     } catch (error) {
//       console.error("Error saving data:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

// Route for retrieving data
app.get("/get-data", authenticateUser, async (req, res) => {
  try {
    // Get the authenticated user ID
    const userId = req.user._id;
    // Retrieve data associated with the user
    const userData = await Data.find({ userId });
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/signup", async (req, res) => {
  try {
    console.log("Received signup request:", req.body); // Log the received request body
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });

    console.log("Saving new user to the database...");
    const savedUser = await newUser.save();
    console.log("User saved successfully:", savedUser);
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if the user exists with the provided email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    // Compare the password
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    // Send back JWT token and any other user data you want to include
    res.status(200).json({ token, userData: user });
    console.log("token", token);
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
