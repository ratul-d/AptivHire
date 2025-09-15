// src/components/MatchPanel.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken, fetchWithAuth, clearTokens } from "../services/auth";

export default function MatchPanel({ currentJob, currentCandidate }) {
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(!!getAccessToken());
  const navigate = useNavigate();

  // Reset match result when job or candidate changes
  useEffect(() => {
    setMatchResult(null);
  }, [currentJob, currentCandidate]);

  // Keep auth state in sync (useful if tokens are changed elsewhere)
  useEffect(() => {
    const onStorage = () => setIsAuth(!!getAccessToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function calculateMatch() {
    if (!currentJob || !currentCandidate) {
      alert("Please process both job description and candidate details first");
      return;
    }

    if (!isAuth) {
      // not authenticated — send user to login
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth("/matches/create", {
        method: "POST",
        body: JSON.stringify({ job_id: currentJob.id, candidate_id: currentCandidate.id }),
      });

      // If fetchWithAuth returned a Response object, handle it
      if (!res) throw new Error("No response from server");

      if (res.status === 401) {
        // Auth failed even after refresh attempt — force login
        clearTokens();
        navigate("/auth");
        return;
      }

      const data = await (res.ok ? res.json() : res.json().catch(() => null));

      if (!res.ok) {
        const detail = data?.detail || data?.message || JSON.stringify(data) || `HTTP ${res.status}`;
        throw new Error(detail);
      }

      setMatchResult(data);
    } catch (err) {
      const msg = (err && err.message) ? err.message : String(err);
      // If it's an authentication/refresh related error, redirect to login
      if (msg.toLowerCase().includes("refresh") || msg.toLowerCase().includes("401") || msg.toLowerCase().includes("no refresh")) {
        clearTokens();
        navigate("/auth");
        return;
      }

      alert("Error calculating match: " + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">Match Result</div>

      <div id="match-input-container" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <p>Job ID: <span className="id-badge">{currentJob ? "Set" : "Not set"}</span></p>
        <p>Candidate ID: <span className="id-badge">{currentCandidate ? "Set" : "Not set"}</span></p></div>
      <div id="match-input-container">
        {/* If user is not authenticated show CTA to login */}
        {!isAuth ? (
          <div id="match-button-container">
            <button
              onClick={() => navigate("/auth")}
              style={{ marginTop: 16 }}
            >
              Login to calculate match
            </button>
          </div>
        ) : (
          // Only show Calculate button if no match result exists
          !matchResult && (
            <div id="match-button-container">
              <button onClick={calculateMatch} disabled={loading} style={{ marginTop: 16 }}>
                {loading ? "Calculating..." : "Calculate Match"}
              </button>
            </div>
          )
        )}
      </div>

      {matchResult && (
        <div id="match-result-container" className="result-container" style={{ display: "block" }}>
          <div className="match-score">{matchResult.match_score}%</div>
          <div className="match-details">
            <div className="result-item"><strong>Reasoning:</strong> <span>{matchResult.reasoning}</span></div>
            <div className="result-item"><strong>Missing Skills:</strong> <span>{matchResult.missing_skills}</span></div>
            <div className="result-item"><strong>Missing Experience:</strong> <span>{matchResult.missing_experience}</span></div>
            <div className="result-item"><strong>Missing Education:</strong> <span>{matchResult.missing_education}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
