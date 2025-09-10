// src/components/ExistingJobsModal.jsx
import React, { useEffect, useState } from "react";
import { fetchJobs } from "../services/api";

export default function ExistingJobsModal({ show, onClose, setCurrentJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!show) return;
    loadJobs();
  }, [show]);

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (err) {
      alert("Error fetching existing jobs: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  function selectJob(job) {
    setCurrentJob(job);
    onClose();
  }

  // Filter jobs client-side based on searchTerm
  const filteredJobs = jobs.filter(job =>
    (job.title || "Untitled Job")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
            border: "1px solid #ccc"
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
              >
                <div className="list-item-title">
                  {job.title || "Untitled Job"}
                </div>
                <div className="list-item-details">
                  ID: {job.id} | Skills: {job.skills || "Not specified"}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
