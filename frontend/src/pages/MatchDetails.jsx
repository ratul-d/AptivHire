// src/pages/MatchDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchWithAuth, clearTokens } from "../services/auth";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function MatchDetails() {
  const { job_id: jobParam, candidate_id: candidateParam } = useParams();
  const query = useQuery();
  const navigate = useNavigate();

  const matchQueryId = query.get("match_id");

  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [match, setMatch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [jobError, setJobError] = useState(null);
  const [candidateError, setCandidateError] = useState(null);
  const [matchError, setMatchError] = useState(null);

  const abortRef = useRef(null);

  useEffect(() => {
    fetchAll();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobParam, candidateParam]);

  async function fetchAll() {
    setLoading(true);
    setJob(null);
    setCandidate(null);
    setMatch(null);
    setJobError(null);
    setCandidateError(null);
    setMatchError(null);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const jobId = parseInt(jobParam, 10);
    const candidateId = parseInt(candidateParam, 10);

    if (Number.isNaN(jobId) || Number.isNaN(candidateId)) {
      setJobError(Number.isNaN(jobId) ? "Invalid job id" : null);
      setCandidateError(Number.isNaN(candidateId) ? "Invalid candidate id" : null);
      setLoading(false);
      return;
    }

    try {
      // use relative paths so fetchWithAuth prefixes API_BASE internally
      const jobPath = `/jobs/${jobId}`;
      const candPath = `/candidates/${candidateId}`;
      const matchPath = `/matches/${jobId}/${candidateId}`;

      const [jobRes, candRes, matchRes] = await Promise.all([
        fetchWithAuth(jobPath, { signal: controller.signal }),
        fetchWithAuth(candPath, { signal: controller.signal }),
        fetchWithAuth(matchPath, { signal: controller.signal }),
      ]);

      // If any response indicates unauthorized, clear tokens and redirect to login
      if (jobRes.status === 401 || candRes.status === 401 || matchRes.status === 401) {
        clearTokens();
        navigate("/auth", { replace: true });
        return;
      }

      // JOB
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob(jobData);
      } else {
        const body = await jobRes.json().catch(() => ({}));
        setJobError(body.detail || `Job fetch failed (${jobRes.status})`);
      }

      // CANDIDATE
      if (candRes.ok) {
        const candData = await candRes.json();
        setCandidate(candData);
      } else {
        const body = await candRes.json().catch(() => ({}));
        setCandidateError(body.detail || `Candidate fetch failed (${candRes.status})`);
      }

      // MATCH
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        setMatch(matchData);
      } else {
        const body = await matchRes.json().catch(() => ({}));
        setMatchError(body.detail || `Match fetch failed (${matchRes.status})`);
      }
    } catch (err) {
      // If fetchWithAuth threw because refresh failed / no token, redirect to auth
      if (err && (err.message?.includes("Refresh failed") || err.message?.includes("No refresh token") || err.message?.toLowerCase().includes("401"))) {
        clearTokens();
        navigate("/auth", { replace: true });
        return;
      }

      if (err.name !== "AbortError") {
        const msg = err.message || "Network error";
        setJobError((prev) => prev || msg);
        setCandidateError((prev) => prev || msg);
        setMatchError((prev) => prev || msg);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  return (
    <div style={{ width: "100%", padding: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Match Details</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: "8px 12px", cursor: "pointer" }}
          >
            ← Back
          </button>
        </div>
      </div>

      {loading && <div>Loading details...</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "auto auto",
          gap: 12,
        }}
      >
        {/* Job Panel */}
        <div className="panel" style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Job</div>
          {jobError && (
            <div style={{ color: "red", marginBottom: 8 }}>Error: {jobError}</div>
          )}
          {job ? (
            <div style={{ fontSize: 13 }}>
              <div style={{ marginTop: 6 }}>
                <strong>Title:</strong> {job.title ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Summary:</strong> {job.summary ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Skills:</strong> {job.skills ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Experience:</strong> {job.experience_required ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Education:</strong> {job.education_required ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Responsibilities:</strong>{" "}
                {job.responsibilities ?? "—"}
              </div>
            </div>
          ) : !jobError && !loading ? (
            <div style={{ color: "#666" }}>No job data</div>
          ) : null}
        </div>

        {/* Candidate Panel */}
        <div className="panel" style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Candidate</div>
          {candidateError && (
            <div style={{ color: "red", marginBottom: 8 }}>
              Error: {candidateError}
            </div>
          )}
          {candidate ? (
            <div style={{ fontSize: 13 }}>

              <div style={{ marginTop: 6 }}>
                <strong>Name:</strong>{" "}
                {candidate.name ?? candidate.full_name ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Email:</strong> {candidate.email ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Phone:</strong> {candidate.phone ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Skills:</strong> {candidate.skills ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Education:</strong> {candidate.education ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Experience:</strong> {candidate.experience ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Certifications:</strong>{" "}
                {candidate.certifications ?? "—"}
              </div>
            </div>
          ) : !candidateError && !loading ? (
            <div style={{ color: "#666" }}>No candidate data</div>
          ) : null}
        </div>

        {/* Match Panel - spans both columns */}
        <div
          className="panel"
          style={{ padding: 12, gridColumn: "1 / span 2" }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Match</div>
          {matchError && (
            <div style={{ color: "red", marginBottom: 8 }}>
              Error: {matchError}
            </div>
          )}
          {match ? (
            <div style={{ fontSize: 13 }}>

              <div style={{ marginTop: 6 }}>
                <strong>Match Score:</strong>
              </div>

              {/* Match Score - centered box */}
              <div
                style={{
                  margin: "20px 0",
                  textAlign: "center",
                  fontSize: "28px",
                  fontWeight: "bold",
                  border: "2px solid #333",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "inline-block",
                  minWidth: "120px",
                }}
              >
                {match.match_score ?? "—"}%
              </div>

              <div style={{ marginTop: 6 }}>
                <strong>Reasoning:</strong>
              </div>
              <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                {match.reasoning ?? "—"}
              </div>

              <div style={{ marginTop: 10 }}>
                <div>
                  <strong>Missing skills:</strong>{" "}
                  {match.missing_skills ?? "—"}
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Missing experience:</strong>{" "}
                  {match.missing_experience ?? "—"}
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Missing education:</strong>{" "}
                  {match.missing_education ?? "—"}
                </div>
              </div>
            </div>
          ) : !matchError && !loading ? (
            <div style={{ color: "#666" }}>No match data</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
