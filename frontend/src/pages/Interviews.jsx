// src/pages/Interviews.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../services/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100); // 25, 50, 100 or "all"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPageReached, setLastPageReached] = useState(false);

  // two separate search boxes (job title and candidate name)
  const [searchJobTitle, setSearchJobTitle] = useState("");
  const [searchCandidateName, setSearchCandidateName] = useState("");

  const [expanded, setExpanded] = useState(() => new Set());
  const [sortOrder, setSortOrder] = useState("none"); // "none" | "asc" | "desc"

  const abortRef = useRef(null);
  const navigate = useNavigate();

  // fetch list of interviews (paginated)
  useEffect(() => {
    fetchInterviews();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // depend only on page and pageSize so search inputs don't trigger fetch
  }, [page, pageSize]);

  // when interviews array or search inputs change, apply search
  useEffect(() => {
    applySearch(searchJobTitle, searchCandidateName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviews, searchJobTitle, searchCandidateName]);

  async function fetchInterviews() {
    setLoading(true);
    setError(null);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let skip = 0;
      let limit = 100;
      if (pageSize === "all") {
        skip = 0;
        limit = 1000000;
      } else {
        limit = Number(pageSize);
        skip = (page - 1) * limit;
      }

      const res = await fetchWithAuth(
        `${API_BASE}/interviews/read?skip=${skip}&limit=${limit}`,
        { signal: controller.signal }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Server responded ${res.status}`);
      }

      const data = await res.json();

      if (pageSize !== "all" && Array.isArray(data) && data.length < Number(pageSize)) {
        setLastPageReached(true);
      } else {
        setLastPageReached(false);
      }

      setInterviews(Array.isArray(data) ? data : []);
      setFilteredInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to fetch interviews");
        setInterviews([]);
        setFilteredInterviews([]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function handlePageSizeChange(e) {
    const val = e.target.value;
    setPageSize(val === "all" ? "all" : Number(val));
    setPage(1);
  }

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function goNext() {
    if (pageSize === "all") return;
    if (!lastPageReached) setPage((p) => p + 1);
  }

  /**
   * Apply search filters to the loaded interviews.
   *
   * Both fields matched with AND logic when both present.
   */
  function applySearch(jobQuery, candidateQuery) {
    const jobQ = jobQuery?.toString().trim() ?? "";
    const candQ = candidateQuery?.toString().trim() ?? "";

    if (!jobQ && !candQ) {
      setFilteredInterviews(interviews);
      return;
    }

    const jobQLower = jobQ.toLowerCase();
    const candQLower = candQ.toLowerCase();

    setFilteredInterviews(
      interviews.filter((it) => {
        const jobTitleStr = (it.job_title ?? "").toString().toLowerCase();
        const candidateNameStr = (it.candidate_name ?? "").toString().toLowerCase();

        if (jobQLower && candQLower) {
          return jobTitleStr.includes(jobQLower) && candidateNameStr.includes(candQLower);
        }
        if (jobQLower) return jobTitleStr.includes(jobQLower);
        if (candQLower) return candidateNameStr.includes(candQLower);
        return true;
      })
    );
  }

  // compute displayed interviews (filteredInterviews sorted)
  const displayedInterviews = useMemo(() => {
    const arr = Array.isArray(filteredInterviews) ? [...filteredInterviews] : [];

    if (sortOrder === "none") return arr;

    const getTime = (item) => {
      const v = item?.interview_time;
      if (!v) return null;
      const t = Date.parse(v);
      return Number.isFinite(t) ? t : null;
    };

    arr.sort((a, b) => {
      const aT = getTime(a);
      const bT = getTime(b);

      if (aT === null && bT === null) return 0;
      if (aT === null) return 1;
      if (bT === null) return -1;

      return sortOrder === "asc" ? aT - bT : bT - aT;
    });

    return arr;
  }, [filteredInterviews, sortOrder]);

  function toggleExpand(interviewId) {
    setExpanded((prev) => {
      const copy = new Set(prev);
      if (copy.has(interviewId)) copy.delete(interviewId);
      else copy.add(interviewId);
      return copy;
    });
  }

  function renderTruncated(text, id, max = 300) {
    if (!text) return "—";
    const full = text.toString();
    const isExpanded = expanded.has(id);
    if (full.length <= max) return full;
    return (
      <>
        {isExpanded ? full : `${full.slice(0, max)}…`}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(id);
          }}
          style={{
            marginLeft: 8,
            fontSize: 12,
            background: "transparent",
            border: "none",
            color: "#0366d6",
            cursor: "pointer",
          }}
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      </>
    );
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  function openDetails(item) {
    const candidateId = item.candidate_id ?? "";
    const interviewId = item.id ?? "";
    const jobId = item.job_id ?? "";
    navigate(`/interviews/${jobId}/${candidateId}?interview_id=${interviewId}`);
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
        <h1 style={{ margin: 0 }}>Interviews</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search by job title"
              value={searchJobTitle}
              onChange={(e) => setSearchJobTitle(e.target.value)}
              style={{ padding: "6px 8px", fontSize: 14, minWidth: 220 }}
            />
            <input
              type="text"
              placeholder="Search by candidate name"
              value={searchCandidateName}
              onChange={(e) => setSearchCandidateName(e.target.value)}
              style={{ padding: "6px 8px", fontSize: 14, minWidth: 220 }}
            />
          </div>

          <label style={{ fontSize: 13, color: "#444" }}>
            Sort by time{" "}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ marginLeft: 6 }}
            >
              <option value="none">None</option>
              <option value="asc">Time ↑ (old → new)</option>
              <option value="desc">Time ↓ (new → old)</option>
            </select>
          </label>

          <label style={{ fontSize: 13, color: "#444" }}>
            Page size{" "}
            <select value={pageSize} onChange={handlePageSizeChange} style={{ marginLeft: 6 }}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={"all"}>All</option>
            </select>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        {loading && <div>Loading interviews...</div>}
        {error && <div style={{ color: "red" }}>Error: {error}</div>}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
          gap: 12,
        }}
      >
        {displayedInterviews.map((it) => {
          const id = it.id ?? Math.random();
          const interviewTime = it.interview_time ? formatDate(it.interview_time) : "—";
          const format = it.format ?? "—";
          const inviteEmail = it.invite_email ?? "—";
          const candidatename = it.candidate_name ?? "—";
          const jobtitle = it.job_title ?? "—";

          return (
            <div
              key={id}
              className="panel"
              style={{
                padding: 12,
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => openDetails(it)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong> Candidate Name:</strong> {candidatename}
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Job Title:</strong> {jobtitle}
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Interview Time:</strong> {interviewTime}
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Format:</strong> {renderTruncated(format, id)}
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Invite Email:</strong>{" "}
                    <span style={{ wordBreak: "break-all" }}>{inviteEmail}</span>
                  </div>
                </div>

                <div
                  style={{
                    marginLeft: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "flex-end",
                  }}
                >

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetails(it);
                    }}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 13, color: "#666" }}>
          Page <strong>{page}</strong> {pageSize !== "all" && <>• Showing up to {pageSize} records</>}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={goPrev}
            disabled={page === 1}
            style={{
              padding: "8px 12px",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            ← Prev
          </button>

          <button
            onClick={goNext}
            disabled={pageSize === "all" || lastPageReached || interviews.length === 0}
            style={{
              padding: "8px 12px",
              cursor: pageSize === "all" || lastPageReached ? "not-allowed" : "pointer",
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
