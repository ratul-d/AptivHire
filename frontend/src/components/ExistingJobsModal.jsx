// src/components/ExistingJobsModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, getAccessToken, clearTokens } from "../services/auth";

export default function ExistingJobsModal({ show, onClose, setCurrentJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const abortRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!show) return;
    loadJobs();
    return () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  async function loadJobs() {
    setLoading(true);
    setJobs([]);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // ensure user has token; otherwise redirect to auth
      if (!getAccessToken()) {
        clearTokens();
        navigate("/auth", { replace: true });
        return;
      }

      // fetch first page of jobs (adjust skip/limit if you want pagination inside modal)
      const res = await fetchWithAuth(`/jobs/read?skip=0&limit=100`, {
        method: "GET",
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) {
          // unauthorized — clear tokens and redirect to login
          clearTokens();
          navigate("/auth", { replace: true });
          return;
        }
        throw new Error(body.detail || `Server responded ${res.status}`);
      }

      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "AbortError") {
        // if refresh failed inside fetchWithAuth, it should have cleared tokens already
        if (err.message && err.message.toLowerCase().includes("refresh failed")) {
          clearTokens();
          navigate("/auth", { replace: true });
          return;
        }
        alert("Error fetching existing jobs: " + (err.message || err));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function selectJob(job) {
    setCurrentJob(job);
    onClose();
  }

  // Filter jobs client-side based on searchTerm
  const filteredJobs = jobs.filter((job) =>
    (job.title || "Untitled Job").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!show) return null;
  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <div className="modal-title">Select Existing Job</div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by job title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
          style={{
            width: "100%",
            padding: "8px",
            margin: "10px 0",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <div id="existing-jobs-list">
          {loading && <div className="no-items">Loading...</div>}
          {!loading && filteredJobs.length === 0 && (
            <div className="no-items">No matching jobs found</div>
          )}
          {!loading &&
            filteredJobs.map((job) => (
              <div
                className="list-item"
                key={job.id}
                onClick={() => selectJob(job)}
                style={{ cursor: "pointer" }}
              >
                <div className="list-item-title">
                  {job.title || "Untitled Job"}
                </div>
                <div className="list-item-details">
                  Skills: {job.skills || "Not specified"}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
