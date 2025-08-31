import React, { useState } from "react";
import axios from "axios";

export default function UploadForm({ onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
    setError("");
  };

  const uploadSingleFile = async (file) => {
    const formData = new FormData();
    formData.append("audios", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.name === file.name ? { ...f, progress: percent } : f
              )
            );
          },
        }
      );
      return response.data.audios[0]; // assuming server returns single audio per request
    } catch (err) {
      console.error("Upload failed for", file.name, err);
      return { error: true, fileName: file.name };
    }
  };

  const CONCURRENT_LIMIT = 4; // max uploads at a time

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError("⚠️ Please select one or more audio files to upload.");
      return;
    }
    setError("");

    setUploadingFiles(files.map((f) => ({ name: f.name, progress: 0 })));

    const queue = [...files];
    const results = [];

    const uploadWorker = async () => {
      while (queue.length > 0) {
        const file = queue.shift(); // get next file
        try {
          const result = await uploadSingleFile(file);
          results.push(result);
        } catch (err) {
          console.error("Upload failed for", file.name, err);
          results.push({ error: true, fileName: file.name });
        }
      }
    };

    // Start workers in parallel
    const workers = Array.from({ length: Math.min(CONCURRENT_LIMIT, files.length) }, () =>
      uploadWorker()
    );

    await Promise.all(workers);

    if (onUploadSuccess) onUploadSuccess(results);
    setFiles([]);
    setUploadingFiles([]);
  };


  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-2xl shadow-2xl">
      <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        🎵 Upload Audio Files
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Input */}
        <label
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition ${uploadingFiles.length > 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-indigo-500"
            }`}
        >
          <span className="text-gray-600">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : "Drag & drop or click to select audio files"}
          </span>
          <input
            type="file"
            accept=".mp3, .wav"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploadingFiles.length > 0}
          />
        </label>

        {/* Per-file progress */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-2">
            {uploadingFiles.map((f) => (
              <div key={f.name} className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-indigo-600 h-4 rounded-full text-xs text-white text-center"
                  style={{ width: `${f.progress}%` }}
                >
                  {f.progress}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm font-medium text-center">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploadingFiles.length > 0}
          className="w-full cursor-pointer bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 flex items-center justify-center"
        >
          {uploadingFiles.length > 0 ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : (
            "Upload"
          )}
        </button>
      </form>
    </div>
  );
}
