// src/components/CandidatePanel.jsx
import React, { useState, useRef, useEffect } from "react";
import { getAccessToken, refreshAccessToken, clearTokens } from "../services/auth";

/**
 * CandidatePanel
 *
 * Props:
 *  - currentCandidate: optional object representing selected candidate
 *  - setCurrentCandidate: function(candidate) -> void  (required)
 *  - openCandidatesModal: function(show:boolean) -> void (optional)
 */
export default function CandidatePanel({
  currentCandidate = null,
  setCurrentCandidate,
  openCandidatesModal = () => {},
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [localCandidate, setLocalCandidate] = useState(currentCandidate);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef();

  // keep localCandidate in sync with prop
  useEffect(() => {
    setLocalCandidate(currentCandidate);
  }, [currentCandidate]);

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf") {
      setFileError("Please upload a PDF file");
      setSelectedFile(null);
      setFileName("");
      return;
    }
    setFileError("");
    setSelectedFile(file);
    setFileName(file.name);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Use the same API base as the app (matches pattern in services)
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  async function processCandidatePDF() {
    if (!selectedFile) {
      setFileError("Please select a PDF file");
      return;
    }
    setLoading(true);
    setFileError("");
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);

      // helper to perform the fetch with the current access token
      async function doUploadWithToken(token) {
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        // DON'T set Content-Type so the browser will add multipart boundary
        const res = await fetch(`${API_BASE}/candidates/create`, {
          method: "POST",
          headers,
          body: fd,
        });
        return res;
      }

      let access = getAccessToken();
      let res = await doUploadWithToken(access);

      // if unauthorized, try refresh once (same logic as client-side refresh)
      if (res.status === 401) {
        try {
          await refreshAccessToken();
          access = getAccessToken();
          res = await doUploadWithToken(access);
        } catch (refreshErr) {
          // failed to refresh -> clear tokens and inform user
          clearTokens();
          throw new Error("Authentication failed — please login again");
        }
      }

      if (!res.ok) {
        // attempt to parse useful error message
        const body = await res.json().catch(() => ({}));
        const message = body.detail || body.message || JSON.stringify(body) || `HTTP ${res.status}`;
        throw new Error(message);
      }

      const candidate = await res.json();
      setLocalCandidate(candidate);
      setCurrentCandidate(candidate); // lift to parent
      // clear temp upload
      setSelectedFile(null);
      setFileName("");
      setFileError("");
    } catch (err) {
      const message = (err && (err.message || err.detail)) || String(err);
      setFileError("Upload failed: " + message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectExisting() {
    // delegate to parent to open modal (if provided)
    openCandidatesModal(true);
  }

  function handleEdit() {
    // allow editing by clearing selected candidate (shows upload UI again)
    setLocalCandidate(null);
    setCurrentCandidate(null);
    setSelectedFile(null);
    setFileName("");
    setFileError("");
  }

  return (
    <div className="panel">
      <div className="panel-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
        </svg>
        Candidate Details
      </div>

      {/* Select Existing Button */}
      <button
        className="select-existing-button"
        id="select-existing-candidate-btn"
        onClick={handleSelectExisting}
        style={{ display: "flex" }}
        title="Select existing candidate"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5.5C13.66 5.5 15 6.84 15 8.5C15 10.16 13.66 11.5 12 11.5C10.34 11.5 9 10.16 9 8.5C9 6.84 10.34 5.5 12 5.5ZM12 2.5C15.87 2.5 19 5.63 19 9.5C19 13.37 15.87 16.5 12 16.5C8.13 16.5 5 13.37 5 9.5C5 5.63 8.13 2.5 12 2.5ZM12 0.5C7.03 0.5 3 4.53 3 9.5C3 14.47 7.03 18.5 12 18.5C16.97 18.5 21 14.47 21 9.5C21 4.53 16.97 0.5 12 0.5ZM12 20.5C11.45 20.5 11 20.95 11 21.5C11 22.05 11.45 22.5 12 22.5C12.55 22.5 13 22.05 13 21.5C13 20.95 12.55 20.5 12 20.5Z" fill="currentColor"/>
        </svg>
        Select Existing
      </button>

      {/* Edit Button */}
      <button
        className="edit-button"
        id="edit-candidate-btn"
        onClick={handleEdit}
        style={{ display: localCandidate ? "flex" : "none" }}
        title="Edit candidate"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
        </svg>
        Edit
      </button>

      {/* Upload area OR result display */}
      {!localCandidate ? (
        <div id="candidate-input-container" className="file-upload-container">
          <div
            className={`file-input-container`}
            id="file-drop-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileRef.current && fileRef.current.click()}
            role="button"
          >
            <input
              ref={fileRef}
              type="file"
              id="candidate-pdf"
              className="file-input"
              accept=".pdf"
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: "none" }}
            />

            <label htmlFor="candidate-pdf" className="file-input-label" style={{ pointerEvents: "none" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 13.91C8 13.29 8.54 12.88 9.15 13.04L9.38 13.09L10.98 13.87C11.56 14.12 12 14.56 12 15.24C12 16.17 11.17 17 10.24 17C9.76 17 9.34 16.82 9 16.5C8.66 16.18 8.48 15.76 8.48 15.28C8.48 15.12 8.5 14.96 8.54 14.81L8.59 14.58L8.77 13.98C8.88 13.57 8.87 13.16 8.74 12.78L8.64 12.5L8.46 12.06C8.22 11.48 8.01 10.95 8.01 10.36C8.01 9.43 8.84 8.6 9.77 8.6C10.25 8.6 10.67 8.78 11.01 9.1C11.35 9.42 11.53 9.84 11.53 10.32C11.53 10.48 11.51 10.64 11.47 10.79L11.42 11.02L11.24 11.62C11.13 12.03 11.14 12.44 11.27 12.82L11.37 13.1L11.55 13.54C11.79 14.12 12 14.65 12 15.24C12 16.17 11.17 17 10.24 17C9.76 17 9.34 16.82 9 16.5C8.66 16.18 8.48 15.76 8.48 15.28Z" fill="#666666"/>
              </svg>
              <h3>Upload Candidate CV (PDF)</h3>
              <p>Click to browse or drag and drop a PDF file</p>
            </label>

            <div className="file-name" id="file-name">{fileName}</div>
            {fileError && <div className="file-error" id="file-error">{fileError}</div>}
          </div>

          <button onClick={processCandidatePDF} disabled={loading}>
            {loading ? "Processing..." : "Process Candidate CV"}
          </button>
        </div>
      ) : (
        <div id="candidate-result-container" className="result-container" style={{ display: "block" }}>
          <div className="result-item"><strong>Name:</strong> <span id="candidate-name">{localCandidate.name}</span></div>
          <div className="result-item"><strong>Email:</strong> <span id="candidate-email">{localCandidate.email}</span></div>
          <div className="result-item"><strong>Phone:</strong> <span id="candidate-phone">{localCandidate.phone}</span></div>
          <div className="result-item"><strong>Skills:</strong> <span id="candidate-skills">{localCandidate.skills}</span></div>
          <div className="result-item"><strong>Education:</strong> <span id="candidate-education">{localCandidate.education}</span></div>
          <div className="result-item"><strong>Experience:</strong> <span id="candidate-experience">{localCandidate.experience}</span></div>
          <div className="result-item"><strong>Certifications:</strong> <span id="candidate-certifications">{localCandidate.certifications}</span></div>
        </div>
      )}
    </div>
  );
}
