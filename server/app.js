require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/dbConfig");
const fileRoutes = require("./routes/fileRoutes");

// Initialize App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/files", fileRoutes);

// Start Server
const port = process.env.PORT || 3000;

// Connect to MongoDB and Start Server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
