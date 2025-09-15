// src/pages/InterviewDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../services/auth";

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

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Timer component:
 * - shows a live countdown to `targetTime` (ISO string / timestamp / Date)
 * - if now >= targetTime, displays "00:00:00" (all zeros)
 * - animates slightly while counting down
 * - now shows: months, days, hours, minutes, seconds (calendar-aware months)
 */
function CountdownTimer({ targetTime }) {
  const [now, setNow] = useState(() => Date.now());
  const intervalRef = useRef(null);
  const prevSecRef = useRef(null);

  // Attempt to parse targetTime robustly
  const targetMs = (() => {
    if (!targetTime) return null;
    const t = typeof targetTime === "number" ? targetTime : Date.parse(String(targetTime));
    if (Number.isNaN(t)) return null;
    return t;
  })();

  useEffect(() => {
    // update immediately and then once per second
    setNow(Date.now());

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetMs]);

  if (!targetMs) {
    return <div style={{ fontSize: 14, color: "#666" }}>No scheduled time</div>;
  }

  // If target is past, show zeros
  if (now >= targetMs) {
    const zeros = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const currentSec = zeros.seconds;
    const animateClass = prevSecRef.current !== currentSec ? "timerPulse" : "";
    prevSecRef.current = currentSec;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.02); }
              100% { transform: scale(1); }
            }
            .timerPulse {
              animation: pulse 1s linear;
            }
            .timerDigits {
              font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
              font-weight: 700;
              font-variant-numeric: tabular-nums;
              letter-spacing: 0.02em;
            }
            .colonBlink {
              animation: blink 1s steps(1, start) infinite;
            }
            @keyframes blink {
              0%,50% { opacity: 1; }
              51%,100% { opacity: 0.2; }
            }
            .smallLabel { font-size: 11px; color: #666; margin-left: 6px; }
          `}
        </style>

        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Time until interview</div>

        <div
          className={animateClass}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "16px 20px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            minWidth: 320,
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <div className="timerDigits" style={{ fontSize: 24 }}>{zeros.months}</div>
            <div className="smallLabel">mo</div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <div className="timerDigits" style={{ fontSize: 24 }}>{zeros.days}</div>
            <div className="smallLabel">d</div>
          </div>

          <div style={{ width: 12 }} />

          <div className="timerDigits" style={{ fontSize: 28 }}>
            {pad(zeros.hours)}
          </div>
          <div className="timerDigits colonBlink" style={{ fontSize: 20 }}>
            :
          </div>
          <div className="timerDigits" style={{ fontSize: 28 }}>
            {pad(zeros.minutes)}
          </div>
          <div className="timerDigits colonBlink" style={{ fontSize: 20 }}>
            :
          </div>
          <div className="timerDigits" style={{ fontSize: 28 }}>
            {pad(zeros.seconds)}
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}>{new Date(targetMs).toLocaleString()}</div>
      </div>
    );
  }

  // calculate months (calendar-aware), then remaining days/hours/minutes/seconds
  const nowDate = new Date(now);
  const targetDate = new Date(targetMs);

  // months difference naive
  let months = (targetDate.getFullYear() - nowDate.getFullYear()) * 12 + (targetDate.getMonth() - nowDate.getMonth());

  // create an "intermediate" date = now + months (same day/time as now)
  const makeIntermediate = (baseDate, monthsToAdd) =>
    new Date(
      baseDate.getFullYear(),
      baseDate.getMonth() + monthsToAdd,
      baseDate.getDate(),
      baseDate.getHours(),
      baseDate.getMinutes(),
      baseDate.getSeconds(),
      baseDate.getMilliseconds()
    );

  let intermediate = makeIntermediate(nowDate, months);

  // If intermediate is greater than target, step months back until intermediate <= target.
  while (intermediate > targetDate && months > 0) {
    months -= 1;
    intermediate = makeIntermediate(nowDate, months);
  }

  // If intermediate is still greater (shouldn't happen), set months = 0 and intermediate = now
  if (intermediate > targetDate) {
    months = 0;
    intermediate = new Date(now);
  }

  let remMs = targetDate - intermediate; // remaining ms after removing whole months

  // compute days/hours/mins/secs from remMs
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_HOUR = 60 * 60 * 1000;
  const MS_PER_MIN = 60 * 1000;
  const MS_PER_SEC = 1000;

  const days = Math.floor(remMs / MS_PER_DAY);
  remMs -= days * MS_PER_DAY;

  const hours = Math.floor(remMs / MS_PER_HOUR);
  remMs -= hours * MS_PER_HOUR;

  const minutes = Math.floor(remMs / MS_PER_MIN);
  remMs -= minutes * MS_PER_MIN;

  const seconds = Math.floor(remMs / MS_PER_SEC);

  // small class toggle when seconds change to force a brief transform
  const currentSec = seconds;
  const animateClass = prevSecRef.current !== currentSec ? "timerPulse" : "";
  prevSecRef.current = currentSec;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {/* inline style tag for the tiny animation used by the timer */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          .timerPulse {
            animation: pulse 1s linear;
          }
          .timerDigits {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.02em;
          }
          .colonBlink {
            animation: blink 1s steps(1, start) infinite;
          }
          @keyframes blink {
            0%,50% { opacity: 1; }
            51%,100% { opacity: 0.2; }
          }
          .smallLabel { font-size: 11px; color: #666; margin-left: 6px; }
        `}
      </style>

      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Time until interview</div>

      <div
        className={animateClass}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "16px 20px",
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          minWidth: 320,
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <div className="timerDigits" style={{ fontSize: 24 }}>{months}</div>
          <div className="smallLabel">months</div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <div className="timerDigits" style={{ fontSize: 24 }}>{days}</div>
          <div className="smallLabel">days</div>
        </div>

        <div style={{ width: 12 }} />

        <div className="timerDigits" style={{ fontSize: 28 }}>
          {pad(hours)}
        </div>
        <div className="timerDigits colonBlink" style={{ fontSize: 20 }}>
          :
        </div>
        <div className="timerDigits" style={{ fontSize: 28 }}>
          {pad(minutes)}
        </div>
        <div className="timerDigits colonBlink" style={{ fontSize: 20 }}>
          :
        </div>
        <div className="timerDigits" style={{ fontSize: 28 }}>
          {pad(seconds)}
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}>{new Date(targetMs).toLocaleString()}</div>
    </div>
  );
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
      // use relative paths so fetchWithAuth will attach API_BASE and Authorization header
      const jobPath = `/jobs/${jobId}`;
      const candPath = `/candidates/${candidateId}`;
      const interviewPath = `/interviews/${jobId}/${candidateId}`;

      // fetchWithAuth returns a Response (same as fetch)
      const [jobRes, candRes, interviewRes] = await Promise.all([
        fetchWithAuth(jobPath, { signal: controller.signal }),
        fetchWithAuth(candPath, { signal: controller.signal }),
        fetchWithAuth(interviewPath, { signal: controller.signal }),
      ]);

      // If any response indicates unauthorized, send user to auth page
      if (jobRes.status === 401 || candRes.status === 401 || interviewRes.status === 401) {
        // clear navigation to login
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

      // INTERVIEWS
      if (interviewRes.ok) {
        const interviewsData = await interviewRes.json();
        // normalize to array (server may return either a single interview or a list)
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
      // If fetch was aborted, do nothing
      if (err && err.name === "AbortError") {
        return;
      }

      // Authentication-related errors from fetchWithAuth / refresh likely indicate we should send user to login
      const msg = (err && (err.message || String(err))) ?? "Network error";

      const lower = String(msg).toLowerCase();
      if (lower.includes("refresh") || lower.includes("token") || lower.includes("401") || lower.includes("unauthor")) {
        navigate("/auth", { replace: true });
        return;
      }

      // Otherwise surface the network error
      setJobError((prev) => prev || msg);
      setCandidateError((prev) => prev || msg);
      setInterviewError((prev) => prev || msg);
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
    navigate(
      {
        pathname: window.location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: true }
    );
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
          <button onClick={() => navigate(-1)} style={{ padding: "8px 12px", cursor: "pointer" }}>
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
          {jobError && <div style={{ color: "red", marginBottom: 8 }}>Error: {jobError}</div>}
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
            </div>
          ) : !jobError && !loading ? (
            <div style={{ color: "#666" }}>No job data</div>
          ) : null}
        </div>

        {/* Candidate Panel */}
        <div className="panel" style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Candidate</div>
          {candidateError && (
            <div style={{ color: "red", marginBottom: 8 }}>Error: {candidateError}</div>
          )}
          {candidate ? (
            <div style={{ fontSize: 13 }}>

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
              <div style={{ marginTop: 6 }}>
                <strong>Certifications:</strong> {candidate.certifications ?? "—"}
              </div>
            </div>
          ) : !candidateError && !loading ? (
            <div style={{ color: "#666" }}>No candidate data</div>
          ) : null}
        </div>

        {/* Interview Panel - spans both columns */}
        <div className="panel" style={{ padding: 12, gridColumn: "1 / span 2" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Interview</div>
          {interviewError && (
            <div style={{ color: "red", marginBottom: 8 }}>Error: {interviewError}</div>
          )}

          {/* If there are multiple interviews, render a simple selector */}
          {Array.isArray(interviews) && interviews.length > 1 && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>Choose interview:</label>
              <select
                value={interview?.id ?? ""}
                onChange={(e) => {
                  const selected = interviews.find((it) => String(it.id) === e.target.value);
                  handleSelectInterview(selected ?? null);
                }}
              >
                {interviews.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.id} — {it.interview_time ? new Date(it.interview_time).toLocaleString() : it.format ?? "Interview"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Layout: left side = details, right side = timer (right half of panel) */}
          {interview ? (
            <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
              {/* Left side - details */}
              <div style={{ flex: 1, fontSize: 13 }}>
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
                  <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{interview.notes ?? "—"}</div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <strong>Feedback:</strong>
                  <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{interview.feedback ?? "—"}</div>
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

              {/* Right side - timer occupying roughly half of the panel */}
              <div style={{ width: "45%", minWidth: 220, display: "flex", alignItems: "center" }}>
                {/* Pass the interview.interview_time directly; CountdownTimer will parse */}
                <CountdownTimer targetTime={interview.interview_time} />
              </div>
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
