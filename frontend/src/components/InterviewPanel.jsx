// src/components/InterviewPanel.jsx
import React, { useState } from "react";
import { scheduleInterview } from "../services/api";
import { toISTISOString } from "../utils/date";

export default function InterviewPanel({ currentJob, currentCandidate }) {
  const [datetimeLocal, setDatetimeLocal] = useState("");
  const [format, setFormat] = useState("Video");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSchedule() {
    if (!datetimeLocal) {
      alert("Please select a date and time for the interview");
      return;
    }
    if (!currentJob || !currentCandidate) {
      alert("Please process both job description and candidate details first");
      return;
    }

    setLoading(true);
    try {
      // datetimeLocal is like "2025-09-27T09:00"
      const dt = new Date(datetimeLocal);
      const istString = toISTISOString(dt);

      const payload = {
        job_id: currentJob.id,
        candidate_id: currentCandidate.id,
        interview_datetime: istString,
        interview_format: format,
      };

      await scheduleInterview(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert("Error scheduling interview: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">Schedule Interview</div>

      <div id="interview-form">
        <div className="form-group">
          <label>Job ID</label>
          <input type="text" value={currentJob ? currentJob.id : ""} readOnly />
        </div>
        <div className="form-group">
          <label>Candidate ID</label>
          <input type="text" value={currentCandidate ? currentCandidate.id : ""} readOnly />
        </div>

        <div className="flex-row">
          <div className="form-group">
            <label>Date & Time (IST)</label>
            <input type="datetime-local" value={datetimeLocal} onChange={(e) => setDatetimeLocal(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>In-person</option>
              <option>Video</option>
              <option>Phone</option>
            </select>
          </div>
        </div>

        <button id="schedule-interview-btn" onClick={handleSchedule} className={loading ? "button-loading" : ""}>
          {loading ? "Scheduling..." : "Shortlist & Schedule Interview"}
          <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" style={{ display: loading ? "inline" : "none", marginLeft: 8 }}>
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
            <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"/>
          </svg>
        </button>

        {success && <div className="success-message" style={{ display: "block" }}>Interview scheduled successfully! Email sent to candidate.</div>}
      </div>
    </div>
  );
}
