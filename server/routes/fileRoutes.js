const express = require("express");
const {
  getPreSignedUploadURL,
  confirmUpload,
  getFileLink,
  deleteFile,
  getAllFiles,
} = require("../controllers/fileController");

const router = express.Router();

// Generate Pre-Signed URL
router.post("/upload-url", getPreSignedUploadURL);

// Confirm Upload and Save Metadata
router.post("/confirm-upload", confirmUpload);

// Get pre-signed access URL for a file
router.get("/file-link", getFileLink);

// Delete a file from S3 and the database
router.delete("/delete", deleteFile);

// Get all files with pre-signed URLs
router.get("/", getAllFiles);

module.exports = router;
