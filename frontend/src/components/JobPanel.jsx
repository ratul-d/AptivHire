// src/components/JobPanel.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, getAccessToken, clearTokens } from "../services/auth";

export default function JobPanel({ currentJob, setCurrentJob, openJobsModal }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function resetView() {
    setText("");
    setCurrentJob(null);
  }

  async function processJobDescription() {
    if (!text.trim()) {
      alert("Please enter a job description");
      return;
    }

    // ensure user is authenticated before trying
    if (!getAccessToken()) {
      clearTokens();
      navigate("/auth", { replace: true });
      return;
    }

    setLoading(true);
    try {
      const processedText = text.replace(/\s+/g, " ").trim();

      const res = await fetchWithAuth("/jobs/create", {
        method: "POST",
        body: JSON.stringify({ raw_text: processedText }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) {
          // unauthorized — refresh likely failed or token invalid
          clearTokens();
          navigate("/auth", { replace: true });
          return;
        }
        throw new Error(body.detail || `Server responded ${res.status}`);
      }

      const job = await res.json();
      setCurrentJob(job);
      // optionally clear input after successful creation:
      setText("");
    } catch (err) {
      alert("Error processing job description: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
        </svg>
        Job Description
      </div>

      <button className="select-existing-button" onClick={() => openJobsModal(true)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5.5C13.66 5.5 15 6.84 15 8.5C15 10.16 13.66 11.5 12 11.5C10.34 11.5 9 10.16 9 8.5C9 6.84 10.34 5.5 12 5.5ZM12 2.5C15.87 2.5 19 5.63 19 9.5C19 13.37 15.87 16.5 12 16.5C8.13 16.5 5 13.37 5 9.5C5 5.63 8.13 2.5 12 2.5ZM12 0.5C7.03 0.5 3 4.53 3 9.5C3 14.47 7.03 18.5 12 18.5C16.97 18.5 21 14.47 21 9.5C21 4.53 16.97 0.5 12 0.5ZM12 20.5C11.45 20.5 11 20.95 11 21.5C11 22.05 11.45 22.5 12 22.5C12.55 22.5 13 22.05 13 21.5C13 20.95 12.55 20.5 12 20.5Z" fill="currentColor"/>
        </svg>
        Select Existing
      </button>

      <button className="edit-button" style={{ display: currentJob ? "flex" : "none" }} onClick={resetView}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
        </svg>
        Edit
      </button>

      {!currentJob ? (
        <div id="job-input-container">
          <textarea
            id="job-description"
            placeholder="Paste job description here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={processJobDescription} disabled={loading}>
            {loading ? "Processing..." : "Process Job Description"}
          </button>
        </div>
      ) : (
        <div id="job-result-container" className="result-container" style={{ display: "block" }}>
          <div className="result-item"><strong>Title:</strong> <span>{currentJob.title}</span></div>
          <div className="result-item"><strong>Summary:</strong> <span>{currentJob.summary}</span></div>
          <div className="result-item"><strong>Skills:</strong> <span>{currentJob.skills}</span></div>
          <div className="result-item"><strong>Experience Required:</strong> <span>{currentJob.experience_required}</span></div>
          <div className="result-item"><strong>Education Required:</strong> <span>{currentJob.education_required}</span></div>
          <div className="result-item"><strong>Responsibilities:</strong> <span>{currentJob.responsibilities}</span></div>
        </div>
      )}
    </div>
  );
}
