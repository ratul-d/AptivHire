// src/pages/InterviewDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleString();
  } catch {
    return dateStr;
  }
}

export default function InterviewDetails() {
  const { job_id: jobParam, candidate_id: candidateParam } = useParams();
  const query = useQuery();
  const navigate = useNavigate();

  // optional query param to select a specific interview
  const interviewQueryId = query.get("interview_id");

  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(null);

  // interviews array and currently selected interview
  const [interviews, setInterviews] = useState([]);
  const [interview, setInterview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [jobError, setJobError] = useState(null);
  const [candidateError, setCandidateError] = useState(null);
  const [interviewError, setInterviewError] = useState(null);

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
    setInterviews([]);
    setInterview(null);
    setJobError(null);
    setCandidateError(null);
    setInterviewError(null);

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
      const jobUrl = `${API_BASE}/jobs/${jobId}`;
      const candUrl = `${API_BASE}/candidates/${candidateId}`;
      // endpoint returning list of interviews for job+candidate pair
      const interviewUrl = `${API_BASE}/interviews/${jobId}/${candidateId}`;

      const [jobRes, candRes, interviewRes] = await Promise.all([
        fetch(jobUrl, { signal: controller.signal }),
        fetch(candUrl, { signal: controller.signal }),
        fetch(interviewUrl, { signal: controller.signal }),
      ]);

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

      // INTERVIEWS (expects an array)
      if (interviewRes.ok) {
        const interviewsData = await interviewRes.json();
        // normalize to array (server is expected to return a list)
        const arr = Array.isArray(interviewsData) ? interviewsData : [interviewsData];
        setInterviews(arr);

        // pick selected interview:
        if (interviewQueryId) {
          const qid = parseInt(interviewQueryId, 10);
          const found = arr.find((it) => Number(it.id) === qid);
          setInterview(found ?? arr[0] ?? null);
        } else if (arr.length === 1) {
          setInterview(arr[0]);
        } else {
          // default to first if multiple and no query param
          setInterview(arr[0] ?? null);
        }
      } else {
        const body = await interviewRes.json().catch(() => ({}));
        setInterviewError(body.detail || `Interview fetch failed (${interviewRes.status})`);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        const msg = err.message || "Network error";
        setJobError((prev) => prev || msg);
        setCandidateError((prev) => prev || msg);
        setInterviewError((prev) => prev || msg);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function handleSelectInterview(it) {
    setInterview(it);
    // update URL query param for shareability without reloading
    const params = new URLSearchParams(window.location.search);
    if (it && it.id != null) {
      params.set("interview_id", String(it.id));
    } else {
      params.delete("interview_id");
    }
    navigate({
      pathname: window.location.pathname,
      search: params.toString() ? `?${params.toString()}` : "",
    }, { replace: true });
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
        <h1 style={{ margin: 0 }}>Interview Details</h1>
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
              <div>
                <strong>ID:</strong> {job.id ?? "—"}
              </div>
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
              <div>
                <strong>ID:</strong> {candidate.id ?? "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>Name:</strong> {candidate.name ?? candidate.full_name ?? "—"}
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
            </div>
          ) : !candidateError && !loading ? (
            <div style={{ color: "#666" }}>No candidate data</div>
          ) : null}
        </div>

        {/* Interview Panel - spans both columns */}
        <div
          className="panel"
          style={{ padding: 12, gridColumn: "1 / span 2" }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Interview</div>
          {interviewError && (
            <div style={{ color: "red", marginBottom: 8 }}>
              Error: {interviewError}
            </div>
          )}

          {/* If multiple interviews, show a small selector row */}
          {Array.isArray(interviews) && interviews.length > 1 && (
            <div style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {interviews.map((it) => (
                <button
                  key={it.id ?? Math.random()}
                  onClick={() => handleSelectInterview(it)}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    borderRadius: 6,
                    border: it && interview && it.id === interview.id ? "2px solid #333" : "1px solid #ccc",
                    background: "transparent",
                    fontSize: 12,
                  }}
                >
                  {it.id ? `#${it.id}` : "—"} · {it.status ?? "—"} · {fmtDate(it.interview_time)}
                </button>
              ))}
            </div>
          )}

          {interview ? (
            <div style={{ fontSize: 13 }}>

              <div style={{ marginTop: 8 }}>
                <strong>Interview Time:</strong> {fmtDate(interview.interview_time)}
              </div>

              <div style={{ marginTop: 8 }}>
                <strong>Format:</strong> {interview.format ?? interview.mode ?? "—"}
              </div>

              <div style={{ marginTop: 8 }}>
                <strong>Invite Email:</strong> {interview.invite_email ?? "—"}
              </div>

              {/* Keep other fields if present */}
              <div style={{ marginTop: 8 }}>
                <strong>Notes:</strong>
                <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                  {interview.notes ?? "—"}
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <strong>Feedback:</strong>
                <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                  {interview.feedback ?? "—"}
                </div>
              </div>

              {interview.recording_url && (
                <div style={{ marginTop: 10 }}>
                  <strong>Recording:</strong>{" "}
                  <a href={interview.recording_url} target="_blank" rel="noreferrer">
                    View recording
                  </a>
                </div>
              )}
            </div>
          ) : !interviewError && !loading ? (
            // If server returned an array but we haven't selected one (shouldn't normally happen), show helpful message
            Array.isArray(interviews) && interviews.length > 0 ? (
              <div style={{ color: "#666" }}>Select an interview from above to view details</div>
            ) : (
              <div style={{ color: "#666" }}>No interview data</div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
