// src/components/ExistingCandidatesModal.jsx
import React, { useEffect, useState } from "react";
import { fetchCandidates } from "../services/api";

export default function ExistingCandidatesModal({ show, onClose, setCurrentCandidate }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!show) return;
    loadCandidates();
  }, [show]);

  async function loadCandidates() {
    setLoading(true);
    try {
      const data = await fetchCandidates();
      setCandidates(data);
    } catch (err) {
      alert("Error fetching existing candidates: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  function selectCandidate(candidate) {
    setCurrentCandidate(candidate);
    onClose();
  }

  // Filter candidates by name (case-insensitive)
  const filteredCandidates = candidates.filter(c =>
    (c.name || "Unnamed Candidate")
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
        <div className="modal-title">Select Existing Candidate</div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by candidate name..."
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

        <div id="existing-candidates-list">
          {loading && <div className="no-items">Loading...</div>}
          {!loading && filteredCandidates.length === 0 && (
            <div className="no-items">No matching candidates found</div>
          )}
          {!loading &&
            filteredCandidates.map((c) => (
              <div
                className="list-item"
                key={c.id}
                onClick={() => selectCandidate(c)}
              >
                <div className="list-item-title">{c.name || "Unnamed Candidate"}</div>
                <div className="list-item-details">
                  ID: {c.id} | Email: {c.email || "Not specified"}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
