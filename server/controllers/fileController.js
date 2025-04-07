const File = require("../models/fileModel");
const { generateUploadURL, generateAccessURL, deleteFileFromS3 } = require("../services/awsService");

exports.getPreSignedUploadURL = async (req, res) => {
  const { key, contentType } = req.body;

  if (!key || !contentType) {
    return res.status(400).json({
      success: false,
      message: "File key and content type are required.",
    });
  }

  try {
    const uniqueKey = `${Date.now()}_${key}`;


    const uploadUrl = await generateUploadURL("Chats", uniqueKey, contentType);

    res.status(201).json({
      success: true,
      message: "Pre-signed upload URL generated.",
      data: { uploadUrl, uniqueKey },
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate upload URL.",
      error: error.message,
    });
  }
};

// **Step 2: Confirm Upload and Save Metadata**
exports.confirmUpload = async (req, res) => {
  const { uniqueKey, name, email } = req.body;

  if (!uniqueKey || !name || !email) {
    return res.status(400).json({
      success: false,
      message: "Unique key, name, and email are required.",
    });
  }

  try {
    // Save file metadata to the database
    await File.create({ img: uniqueKey, name, email });

    res.status(201).json({
      success: true,
      message: "File upload confirmed, metadata saved to the database.",
    });
  } catch (error) {
    console.error("Error saving metadata:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save file metadata.",
      error: error.message,
    });
  }
};
// **Get File Access Link**
exports.getFileLink = async (req, res) => {
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).json({
      success: false,
      message: "File name is required.",
    });
  }

  try {
    const fileRecord = await File.findOne({ img: fileName });
    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: "File not found in the database.",
      });
    }

    const accessUrl = await generateAccessURL(fileRecord.img);

    res.status(200).json({
      success: true,
      message: "Access link generated successfully.",
      data: { accessUrl },
    });
  } catch (error) {
    console.error("Error generating access link:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate file access link.",
      error: error.message,
    });
  }
};

exports.deleteFile = async (req, res) => {
  const { id } = req.query; // Fetch the `id` from query parameters

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "File ID is required.",
    });
  }

  try {
    // Find the file in the database by ID
    const fileRecord = await File.findById(id);

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: "File not found in the database.",
      });
    }

    // Delete the file from S3
    await deleteFileFromS3(fileRecord.img);

    // Delete the file metadata from the database
    await File.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "File deleted successfully from S3 and the database.",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete the file.",
      error: error.message,
    });
  }
};

// **Get All Files**
exports.getAllFiles = async (req, res) => {
  try {
    const files = await File.find();

    if (!files.length) {
      return res.status(200).json({
        success: true,
        message: "No files found.",
        data: [],
      });
    }

    const filesWithAccessUrls = await Promise.all(
      files.map(async (file) => {
        try {
          const accessUrl = await generateAccessURL("Chats",file.img);
          return { ...file._doc, img: accessUrl };
        } catch (error) {
          console.error(`Error processing file: ${file.img}`, error);
          return { ...file._doc, img: null, error: "Failed to generate pre-signed URL." };
        }
      })
    );

    res.status(200).json({
      success: true,
      message: "Files fetched successfully.",
      data: filesWithAccessUrls,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch files from the server.",
      error: error.message,
    });
  }
};
