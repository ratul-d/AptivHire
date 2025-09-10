// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import JobPanel from "../components/JobPanel";
import CandidatePanel from "../components/CandidatePanel";
import MatchPanel from "../components/MatchPanel";
import InterviewPanel from "../components/InterviewPanel";
import ExistingJobsModal from "../components/ExistingJobsModal";
import ExistingCandidatesModal from "../components/ExistingCandidatesModal";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export default function Dashboard() {
  const [currentJob, setCurrentJob] = useState(null);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);

  const location = useLocation();
  const [searchParams] = useSearchParams();

  // If navigated with location.state.job (from Jobs.jsx), use it.
  useEffect(() => {
    if (location?.state?.job) {
      // if job is an object set it directly, if it's an id, fetch it
      const jobState = location.state.job;
      if (typeof jobState === "object") {
        setCurrentJob(jobState);
      } else if (jobState) {
        (async () => {
          try {
            const res = await fetch(`${API_BASE}/jobs/${jobState}`);
            if (!res.ok) {
              console.warn("Failed to fetch job from state id:", res.status);
              return;
            }
            const job = await res.json();
            setCurrentJob(job);
          } catch (err) {
            console.warn("Failed to fetch job by id from state:", err);
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // If query param ?job_id=xxx is present and currentJob is empty, fetch job
  useEffect(() => {
    const jobId = searchParams.get("job_id");
    if (jobId && !currentJob) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/jobs/${jobId}`);
          if (!res.ok) {
            console.warn("Failed to fetch job:", res.status);
            return;
          }
          const job = await res.json();
          setCurrentJob(job);
        } catch (err) {
          console.warn("Failed to fetch job by id:", err);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // If navigated with location.state.candidate (from Candidates.jsx), use it.
  useEffect(() => {
    if (location?.state?.candidate) {
      const candidateState = location.state.candidate;
      if (typeof candidateState === "object") {
        setCurrentCandidate(candidateState);
      } else if (candidateState) {
        (async () => {
          try {
            const res = await fetch(`${API_BASE}/candidates/${candidateState}`);
            if (!res.ok) {
              console.warn("Failed to fetch candidate from state id:", res.status);
              return;
            }
            const cand = await res.json();
            setCurrentCandidate(cand);
          } catch (err) {
            console.warn("Failed to fetch candidate by id from state:", err);
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // If query param ?candidate_id=xxx is present and currentCandidate is empty, fetch candidate
  useEffect(() => {
    const candidateId = searchParams.get("candidate_id");
    if (candidateId && !currentCandidate) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/candidates/${candidateId}`);
          if (!res.ok) {
            console.warn("Failed to fetch candidate:", res.status);
            return;
          }
          const cand = await res.json();
          setCurrentCandidate(cand);
        } catch (err) {
          console.warn("Failed to fetch candidate by id:", err);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="container">
      <div className="dashboard">
        <JobPanel
          currentJob={currentJob}
          setCurrentJob={setCurrentJob}
          openJobsModal={setShowJobsModal}
        />
        <CandidatePanel
          currentCandidate={currentCandidate}
          setCurrentCandidate={setCurrentCandidate}
          openCandidatesModal={setShowCandidatesModal}
        />
        <MatchPanel currentJob={currentJob} currentCandidate={currentCandidate} />
        <InterviewPanel currentJob={currentJob} currentCandidate={currentCandidate} />
      </div>

      <ExistingJobsModal
        show={showJobsModal}
        onClose={() => setShowJobsModal(false)}
        setCurrentJob={setCurrentJob}
      />
      <ExistingCandidatesModal
        show={showCandidatesModal}
        onClose={() => setShowCandidatesModal(false)}
        setCurrentCandidate={setCurrentCandidate}
      />
    </div>
  );
}
