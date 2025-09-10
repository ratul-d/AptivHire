// src/components/MatchPanel.jsx
import React, { useState, useEffect } from "react";
import { postMatch } from "../services/api";

export default function MatchPanel({ currentJob, currentCandidate }) {
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset match result when job or candidate changes
  useEffect(() => {
    setMatchResult(null);
  }, [currentJob, currentCandidate]);

  async function calculateMatch() {
    if (!currentJob || !currentCandidate) {
      alert("Please process both job description and candidate details first");
      return;
    }
    setLoading(true);
    try {
      const res = await postMatch(currentJob.id, currentCandidate.id);
      setMatchResult(res);
    } catch (err) {
      alert("Error calculating match: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">Match Result</div>

      <div id="match-input-container">
        <p>Job ID: <span className="id-badge">{currentJob ? currentJob.id : "Not set"}</span></p>
        <p>Candidate ID: <span className="id-badge">{currentCandidate ? currentCandidate.id : "Not set"}</span></p>

        {/* Only show button if no match result exists */}
        {!matchResult && (
          <div id="match-button-container">
            <button onClick={calculateMatch} disabled={loading} style={{ marginTop: 16 }}>
              {loading ? "Calculating..." : "Calculate Match"}
            </button>
          </div>
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