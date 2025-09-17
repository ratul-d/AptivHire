// src/pages/Jobs.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, getAccessToken, clearTokens } from "../services/auth";

export default function Jobs({ setCurrentJob }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100); // 25, 50, 100 or "all"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPageReached, setLastPageReached] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const abortRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If there is no access token, send user to auth immediately.
    if (!getAccessToken()) {
      // ensure local tokens cleared just in case
      clearTokens();
      navigate("/auth", { replace: true });
      return;
    }

    fetchJobs();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    applySearch(searchQuery);
  }, [jobs, searchQuery]);

  async function fetchJobs() {
    setLoading(true);
    setError(null);
    setLastPageReached(false);

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

      // Use fetchWithAuth which attaches the Authorization header and retries after refresh
      const url = `/jobs/read?skip=${skip}&limit=${limit}`;
      const res = await fetchWithAuth(url, { signal: controller.signal, method: "GET" });

      // If fetchWithAuth threw (e.g., refresh failed) it will have already cleared tokens.
      if (!res.ok) {
        // Try to parse error body for friendly message
        const body = await res.json().catch(() => ({}));
        // If unauthorized, navigate to auth page
        if (res.status === 401) {
          clearTokens();
          navigate("/auth", { replace: true });
          return;
        }
        throw new Error(body.detail || `Server responded ${res.status}`);
      }

      const data = await res.json();

      if (
        pageSize !== "all" &&
        Array.isArray(data) &&
        data.length < Number(pageSize)
      ) {
        setLastPageReached(true);
      } else {
        setLastPageReached(false);
      }

      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "AbortError") {
        // If the fetchWithAuth refresh failed it may have already cleared tokens; redirect user to auth
        if (err.message && err.message.toLowerCase().includes("refresh failed")) {
          clearTokens();
          navigate("/auth", { replace: true });
          return;
        }
        setError(err.message || "Failed to fetch jobs");
        setJobs([]);
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

  // Apply search filter
  function applySearch(query) {
    if (!query.trim()) {
      setFilteredJobs(jobs);
      return;
    }
    const lowerQ = query.toLowerCase();
    setFilteredJobs(
      jobs.filter((job) => {
        const title = job.title || "";
        return title.toLowerCase().includes(lowerQ);
      })
    );
  }

  // Select: navigate to /dashboard and pass job in location.state, and also call setCurrentJob if provided
  function selectJob(job) {
    if (typeof setCurrentJob === "function") {
      setCurrentJob(job);
    }
    navigate("/dashboard", { state: { job } });
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
        <h1 style={{ margin: 0 }}>Jobs</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Search input */}
          <input
            type="text"
            placeholder="Search by job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "6px 8px", fontSize: 14 }}
          />

          <label style={{ fontSize: 13, color: "#444" }}>
            Page size{" "}
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              style={{ marginLeft: 6 }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={"all"}>All</option>
            </select>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        {loading && <div>Loading jobs...</div>}
        {error && <div style={{ color: "red" }}>Error: {error}</div>}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 12,
        }}
      >
        {filteredJobs.map((job) => (
          <div key={job.id} className="panel" style={{ padding: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                gap: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  {job.title || "Untitled Job"}
                </div>
                <div style={{ fontSize: 13, color: "#444", marginBottom: 8 }}>
                  {job.summary
                    ? job.summary.length > 180
                      ? job.summary.slice(0, 180) + "…"
                      : job.summary
                    : "No summary"}
                </div>

                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  <strong>Skills:</strong> {job.skills || "—"}
                </div>
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  <strong>Experience:</strong> {job.experience_required || "—"}
                </div>
                <div style={{ fontSize: 13 }}>
                  <strong>Education:</strong> {job.education_required || "—"}
                </div>
                <div style={{ fontSize: 13 }}>
                  <strong>Responsibilities:</strong>{" "}
                  {job.responsibilities || "—"}
                </div>
              </div>

              <div
                style={{
                  marginLeft: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >

                <button
                  onClick={() => selectJob(job)}
                  style={{ padding: "8px 12px", cursor: "pointer" }}
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
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
          Page <strong>{page}</strong>{" "}
          {pageSize !== "all" && <>• Showing up to {pageSize} records</>}
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
            disabled={pageSize === "all" || lastPageReached || jobs.length === 0}
            style={{
              padding: "8px 12px",
              cursor:
                pageSize === "all" || lastPageReached
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
