import React, { useEffect, useState } from "react";
import FileUpload from "./FileUpload";
import FileList from "./FileList";

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch all files from the backend
  const fetchAllFiles = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/files");
      const result = await response.json();

      if (response.ok) {
        setFiles(result.data);
      } else {
        setMessage(result.message || "Failed to fetch files.");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // Refresh files on component mount
  useEffect(() => {
    fetchAllFiles();
  }, []);

  return (
    <div>
      <h2>File Manager</h2>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <FileUpload setMessage={setMessage} fetchAllFiles={fetchAllFiles} />
      <FileList files={files} setMessage={setMessage} fetchAllFiles={fetchAllFiles} />
    </div>
  );
};

export default FileManager;
