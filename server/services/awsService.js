require("dotenv").config();
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

/**
 * Generate Pre-signed URL for Upload
 * @param {string} key - The name of the file in the S3 bucket.
 * @param {string} contentType - The MIME type of the file.
 * @returns {Promise<string>} - The pre-signed upload URL.
 */
const generateUploadURL = async (key, contentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error(`Error generating upload URL for key: ${key}`, error);
    throw new Error("Failed to generate pre-signed upload URL.");
  }
};

/**
 * Generate Pre-signed URL for Access
 * @param {string} key - The name of the file in the S3 bucket.
 * @returns {Promise<string>} - The pre-signed access URL.
 */
const generateAccessURL = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error(`Error generating access URL for key: ${key}`, error);
    throw new Error("Failed to generate pre-signed access URL.");
  }
};

/**
 * Delete a File from S3
 * @param {string} key - The name of the file in the S3 bucket.
 * @returns {Promise<void>} - Confirmation of the file deletion.
 */
const deleteFileFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    console.log(`File deleted successfully from S3: ${key}`);
  } catch (error) {
    console.error(`Error deleting file from S3 for key: ${key}`, error);
    throw new Error("Failed to delete file from S3.");
  }
};

module.exports = {
  generateUploadURL,
  generateAccessURL,
  deleteFileFromS3,
};
