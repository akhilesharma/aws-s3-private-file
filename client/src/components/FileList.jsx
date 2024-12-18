import React from "react";

const FileList = ({ files, setMessage, fetchAllFiles }) => {
  const handleDelete = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/files/delete?id=${fileId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("File deleted successfully!");
        fetchAllFiles(); // Refresh the file list
      } else {
        setMessage(result.message || "Failed to delete file.");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h3>All Files</h3>
      <ul>
        {files.map((file) => (
          <li key={file._id}>
            <p>
              <strong>{file.name}</strong> ({file.email})
            </p>
            {file.img ? (
              <img
                src={file.img}
                alt={file.name}
                style={{ maxWidth: "200px", margin: "10px 0" }}
              />
            ) : (
              <p style={{ color: "red" }}>{file.error}</p>
            )}
            <button onClick={() => handleDelete(file._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
