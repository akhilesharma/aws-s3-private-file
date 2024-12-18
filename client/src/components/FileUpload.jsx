import React, { useState } from "react";

const FileUpload = ({ setMessage, fetchAllFiles }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateInputs = () => {
    if (!selectedFile || !name || !email) {
      setMessage("All fields are required.");
      return false;
    }
    if (!isValidEmail(email)) {
      setMessage("Invalid email format.");
      return false;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("File size exceeds 5 MB.");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateInputs()) return;

    setIsUploading(true);
    try {
      // Step 1: Request pre-signed URL
      const preSignedResponse = await fetch("http://localhost:3000/api/files/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: selectedFile.name, contentType: selectedFile.type }),
      });

      const preSignedResult = await preSignedResponse.json();

      if (!preSignedResponse.ok) {
        setMessage(preSignedResult.message || "Failed to generate upload URL.");
        setIsUploading(false);
        return;
      }

      const { uploadUrl, uniqueKey } = preSignedResult.data;

      // Step 2: Upload to S3
      const s3Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!s3Response.ok) {
        setMessage("Failed to upload file to S3.");
        setIsUploading(false);
        return;
      }

      // Step 3: Confirm upload
      const confirmResponse = await fetch("http://localhost:3000/api/files/confirm-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueKey, name, email }),
      });

      const confirmResult = await confirmResponse.json();

      if (confirmResponse.ok) {
        setMessage("File uploaded successfully!");
        setSelectedFile(null);
        setName("");
        setEmail("");
        fetchAllFiles(); // Refresh the file list
      } else {
        setMessage(confirmResult.message || "Failed to save file metadata.");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h3>Upload File</h3>
      <label htmlFor="name">Name:</label>
      <input
        id="name"
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="email">Email:</label>
      <input
        id="email"
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="file">File:</label>
      <input
        id="file"
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default FileUpload;
