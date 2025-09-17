// src/pages/Candidates.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, getAccessToken, clearTokens } from "../services/auth";

export default function Candidates({ setCurrentCandidate }) {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100); // 25, 50, 100 or "all"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPageReached, setLastPageReached] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const abortRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if no token present
    if (!getAccessToken()) {
      clearTokens();
      navigate("/auth", { replace: true });
      return;
    }

    fetchCandidates();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    applySearch(searchQuery);
  }, [candidates, searchQuery]);

  async function fetchCandidates() {
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

      // Use fetchWithAuth which attaches the Authorization header and retries after refresh
      const url = `/candidates/read?skip=${skip}&limit=${limit}`;
      const res = await fetchWithAuth(url, { signal: controller.signal, method: "GET" });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) {
          // token expired or invalid — clear and redirect to auth
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

      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "AbortError") {
        // If refresh failed inside fetchWithAuth, fetchWithAuth should have cleared tokens.
        if (err.message && err.message.toLowerCase().includes("refresh failed")) {
          clearTokens();
          navigate("/auth", { replace: true });
          return;
        }
        setError(err.message || "Failed to fetch candidates");
        setCandidates([]);
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
      setFilteredCandidates(candidates);
      return;
    }
    const lowerQ = query.toLowerCase();
    setFilteredCandidates(
      candidates.filter((c) => {
        const name = c.name || c.full_name || "";
        return name.toLowerCase().includes(lowerQ);
      })
    );
  }

  // Select: navigate to /dashboard and pass candidate in location.state, and also call setCurrentCandidate if provided
  function selectCandidate(candidate) {
    if (typeof setCurrentCandidate === "function") {
      setCurrentCandidate(candidate);
    }
    navigate("/dashboard", { state: { candidate } });
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
        <h1 style={{ margin: 0 }}>Candidates</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Search input */}
          <input
            type="text"
            placeholder="Search by name..."
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
        {loading && <div>Loading candidates...</div>}
        {error && <div style={{ color: "red" }}>Error: {error}</div>}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 12,
        }}
      >
        {filteredCandidates.map((c) => {
          const title =
            c.name ||
            c.full_name ||
            c.email ||
            (c.id ? `Candidate ${c.id}` : "Unnamed Candidate");
          const skills =
            c.skills ||
            (Array.isArray(c.skill_list) ? c.skill_list.join(", ") : "") ||
            "—";
          const experience =
            c.experience || c.experience_years || c.years_experience || "—";
          const education = c.education || c.education_level || "—";
          const certifications = c.certifications || "—";
          const email = c.email ? `✉ ${c.email}` : "";
          const phone = c.phone ? ` ☎ ${c.phone}` : "";

          return (
            <div
              key={c.id ?? Math.random()}
              className="panel"
              style={{ padding: 12 }}
            >
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
                    {title}
                  </div>
                  {email && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        marginBottom: 8,
                      }}
                    >
                      {email}
                      {phone && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#444",
                            marginBottom: 8,
                          }}
                        >
                          {phone}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Skills:</strong> {skills}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Experience:</strong> {experience}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Education:</strong> {education}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Certifications:</strong> {certifications}
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
                    onClick={() => selectCandidate(c)}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  >
                    Select
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
            disabled={
              pageSize === "all" || lastPageReached || candidates.length === 0
            }
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
