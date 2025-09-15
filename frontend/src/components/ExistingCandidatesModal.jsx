// src/components/ExistingCandidatesModal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, clearTokens } from "../services/auth";

export default function ExistingCandidatesModal({ show, onClose, setCurrentCandidate }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    if (!show) return;

    const controller = new AbortController();

    async function loadCandidates() {
      setLoading(true);
      try {
        // fetchWithAuth returns a Response (and will attempt refresh automatically)
        const res = await fetchWithAuth("/candidates/read", {
          signal: controller.signal,
        });

        // If response was not ok try to parse body for detail then throw
        let data;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          // If unauthorized or refresh failed, clear tokens and redirect to auth
          if (res.status === 401) {
            clearTokens();
            if (isMounted) navigate("/auth");
            return;
          }
          throw new Error(data?.detail || data?.message || `HTTP ${res.status}`);
        }

        if (isMounted) setCandidates(Array.isArray(data) ? data : []);
      } catch (err) {
        // Handle common auth-related errors from fetchWithAuth / refresh flow
        const msg = (err && err.message) || String(err);
        const isAuthError =
          msg.toLowerCase().includes("no refresh token") ||
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("expired") ||
          msg.toLowerCase().includes("401");

        if (isAuthError) {
          clearTokens();
          if (isMounted) navigate("/auth");
        } else if (isMounted) {
          // show a friendly alert for other errors
          alert("Error fetching existing candidates: " + msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCandidates();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [show, navigate]);

  function selectCandidate(candidate) {
    setCurrentCandidate(candidate);
    onClose();
  }

  // Filter candidates by name (case-insensitive)
  const filteredCandidates = candidates.filter((c) =>
    (c.name || "Unnamed Candidate").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!show) return null;
  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-content">
        <span
          className="close-button"
          onClick={onClose}
          style={{ cursor: "pointer", fontSize: 20 }}
          aria-label="Close"
        >
          &times;
        </span>
        <div className="modal-title" style={{ fontWeight: 700, marginBottom: 12 }}>
          Select Existing Candidate
        </div>

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
            margin: "10px 0 16px 0",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <div id="existing-candidates-list" style={{ maxHeight: 320, overflowY: "auto" }}>
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
                style={{
                  padding: 12,
                  borderRadius: 6,
                  border: "1px solid #eee",
                  marginBottom: 8,
                  cursor: "pointer",
                  background: "#fff",
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") selectCandidate(c);
                }}
              >
                <div className="list-item-title" style={{ fontWeight: 600 }}>
                  {c.name || "Unnamed Candidate"}
                </div>
                <div className="list-item-details" style={{ fontSize: 12, color: "#666" }}>
                  Email: {c.email || "Not specified"} | Phone: {c.phone || "Not specified"}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
