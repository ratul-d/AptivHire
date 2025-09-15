// src/pages/Matches.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, getAccessToken } from "../services/auth";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100); // 25, 50, 100 or "all"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPageReached, setLastPageReached] = useState(false);

  // two separate search boxes
  const [searchJobTitle, setSearchJobTitle] = useState("");
  const [searchCandidateName, setSearchCandidateName] = useState("");

  const [expanded, setExpanded] = useState(() => new Set());
  const [sortOrder, setSortOrder] = useState("none"); // "none" | "asc" | "desc"

  const abortRef = useRef(null);
  const navigate = useNavigate();

  // Redirect to auth if there's no access token immediately (protect page)
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate("/auth", { replace: true });
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMatches();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // intentionally only depend on page and pageSize
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // re-apply search whenever matches or either search input changes
  useEffect(() => {
    applySearch(searchJobTitle, searchCandidateName);
  }, [matches, searchJobTitle, searchCandidateName]);

  async function fetchMatches() {
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

      // use fetchWithAuth so Authorization header + refresh logic is applied
      const path = `/matches/read?skip=${skip}&limit=${limit}`;
      const res = await fetchWithAuth(path, {
        method: "GET",
        signal: controller.signal,
      });

      if (!res.ok) {
        // try parse body for a useful message
        const body = await res.json().catch(() => ({}));
        // if 401, treat as auth failure and redirect to /auth
        if (res.status === 401) {
          // clear tokens handled by fetchWithAuth/refresh but make sure to redirect
          navigate("/auth", { replace: true });
        }
        throw new Error(body.detail || `Server responded ${res.status}`);
      }

      const data = await res.json();

      if (pageSize !== "all" && Array.isArray(data) && data.length < Number(pageSize)) {
        setLastPageReached(true);
      } else {
        setLastPageReached(false);
      }

      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      // if fetchWithAuth failed due to refresh/no refresh token, redirect to login
      const msg = err?.message || String(err);
      const lower = msg.toLowerCase();
      if (
        lower.includes("refresh") ||
        lower.includes("no refresh token") ||
        lower.includes("401") ||
        lower.includes("unauthorized")
      ) {
        // navigate user to auth page to re-login
        navigate("/auth", { replace: true });
        return;
      }

      // ignore aborts
      if (err.name !== "AbortError") {
        setError(msg || "Failed to fetch matches");
        setMatches([]);
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
   * Apply search filters to the loaded matches.
   * Both searches operate on already-loaded content (client-side).
   * - jobTitleQuery: substring match against m.job_title (case-insensitive)
   * - candidateQuery: substring match against m.candidate_name (case-insensitive)
   *
   * If both are empty, show all loaded matches.
   * If one or both present, perform case-insensitive substring matching.
   */
  function applySearch(jobTitleQuery, candidateQuery) {
    const jobQ = jobTitleQuery?.toString().trim() ?? "";
    const candQ = candidateQuery?.toString().trim() ?? "";

    // if both empty -> show all
    if (!jobQ && !candQ) {
      setFilteredMatches(matches);
      return;
    }

    const jobQLower = jobQ.toLowerCase();
    const candQLower = candQ.toLowerCase();

    setFilteredMatches(
      matches.filter((m) => {
        const jobTitle = (m.job_title ?? "").toString().toLowerCase();
        const candidateName = (m.candidate_name ?? "").toString().toLowerCase();

        // if both queries present, require both to match (AND)
        if (jobQLower && candQLower) {
          return jobTitle.includes(jobQLower) && candidateName.includes(candQLower);
        }

        // only job title filter
        if (jobQLower) {
          return jobTitle.includes(jobQLower);
        }

        // only candidate name filter
        if (candQLower) {
          return candidateName.includes(candQLower);
        }

        return true;
      })
    );
  }

  // compute displayed matches (filteredMatches sorted according to sortOrder)
  const displayedMatches = useMemo(() => {
    const arr = Array.isArray(filteredMatches) ? [...filteredMatches] : [];

    if (sortOrder === "none") return arr;

    // helper to extract numeric score or null
    const getScore = (item) => {
      const v = Number(item?.match_score);
      return Number.isFinite(v) ? v : null;
    };

    arr.sort((a, b) => {
      const aS = getScore(a);
      const bS = getScore(b);

      // handle nulls: place nulls at the end for both asc and desc
      if (aS === null && bS === null) return 0;
      if (aS === null) return 1;
      if (bS === null) return -1;

      return sortOrder === "asc" ? aS - bS : bS - aS;
    });

    return arr;
  }, [filteredMatches, sortOrder]);

  function toggleExpand(matchId) {
    setExpanded((prev) => {
      const copy = new Set(prev);
      if (copy.has(matchId)) copy.delete(matchId);
      else copy.add(matchId);
      return copy;
    });
  }

  function renderTruncated(text, id) {
    if (!text) return "—";
    const full = text.toString();
    const isExpanded = expanded.has(id);
    if (full.length <= 300) return full;
    return (
      <>
        {isExpanded ? full : `${full.slice(0, 300)}…`}
        <button
          onClick={(e) => {
            e.stopPropagation(); // don't trigger tile navigation
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

  // navigate to MatchDetails with job_id and candidate_id in path, match id as query param
  function openDetails(m) {
    const jobId = m.job_id ?? "";
    const candidateId = m.candidate_id ?? "";
    const matchId = m.id ?? "";
    // route: /matches/:job_id/:candidate_id?match_id=...
    navigate(`/matches/${jobId}/${candidateId}?match_id=${matchId}`);
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
        <h1 style={{ margin: 0 }}>Matches</h1>

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
            Sort by score{" "}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ marginLeft: 6 }}
            >
              <option value="none">None</option>
              <option value="asc">Score ↑ (low → high)</option>
              <option value="desc">Score ↓ (high → low)</option>
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
        {loading && <div>Loading matches...</div>}
        {error && <div style={{ color: "red" }}>Error: {error}</div>}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
          gap: 12,
        }}
      >
        {displayedMatches.map((m) => {
          const id = m.id ?? Math.random();
          const score =
            typeof m.match_score === "number"
              ? m.match_score.toFixed(0)
              : m.match_score !== undefined && m.match_score !== null
              ? String(m.match_score)
              : "—";
          const missingSkills = m.missing_skills ?? "—";
          const missingExperience = m.missing_experience ?? "—";
          const missingEducation = m.missing_education ?? "—";
          const reasoning = m.reasoning ?? "—";

          return (
            <div
              key={id}
              className="panel"
              style={{
                padding: 12,
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => openDetails(m)}
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
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Score: {score}</div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Job Title:</strong> {m.job_title ?? "—"}
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Candidate Name:</strong> {m.candidate_name ?? "—"}
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Reasoning:</strong>{" "}
                    <span style={{ display: "inline" }}>{renderTruncated(reasoning, id)}</span>
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Missing skills:</strong> {missingSkills}
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Missing experience:</strong> {missingExperience}
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Missing education:</strong> {missingEducation}
                  </div>
                </div>

                <div style={{ marginLeft: 12, display: "flex", flexDirection: "column", gap: 8 }}>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetails(m);
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
            disabled={pageSize === "all" || lastPageReached || matches.length === 0}
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
