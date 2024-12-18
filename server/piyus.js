const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config(); // Load environment variables from .env file

// Configure S3 Client with environment variables
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

async function getObjectURL(key) {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME, // Use Bucket Name from .env
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return url;
}

async function hello() {
    const url = await getObjectURL("Screenshot (1).png");
    console.log("URL for Screenshot (1).png:", url);
}

hello();
