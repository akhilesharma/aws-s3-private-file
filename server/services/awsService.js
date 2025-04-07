require("dotenv").config();
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});


const generateUploadURL = async (folderName,key, contentType) => {
  try {

    const folderKey = `${folderName}/${key}`;
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: folderKey,
      ContentType: contentType,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 300 });
  } catch (error) {
    console.error(`Error generating upload URL for key: ${key}`, error);
    throw new Error("Failed to generate pre-signed upload URL.");
  }
};


const generateAccessURL = async (folderName,key) => {
  try {
    const folderKey = `${folderName}/${key}`;
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: folderKey,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 300 });
  } catch (error) {
    console.error(`Error generating access URL for key: ${key}`, error);
    throw new Error("Failed to generate pre-signed access URL.");
  }
};


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
