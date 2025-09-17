// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, onNavigate }) {
  return (
    <aside
      className={`sidebar ${isOpen ? "open" : "closed"}`}
      style={{
        position: "fixed",
        left: isOpen ? 0 : "-260px",
        top: 0,
        bottom: 0,
        width: 260,
        background: "#fff",
        borderRight: "1px solid #eee",
        paddingTop: 64,
        transition: "left 0.18s ease",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ✖ Close button */}
      <button
        onClick={onNavigate}
        style={{
          position: "absolute",
          top: 16,
          right: 10,
          background: "black",
          border: "none",
          fontSize: 12,
          cursor: "pointer",
          color: "white",
        }}
      >
        ✖
      </button>
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 130, // leave space for ✖ button
          fontWeight: 750,
          fontSize: 25,
          color: "#222",
        }}
      >
        AptivHire
      </div>

      <nav style={{ padding: 16 }}>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12, // spacing between buttons
          }}
        >

          <li>
            <Link
              to="/dashboard"
              onClick={() => onNavigate?.()}
              style={{
                display: "block",
                padding: "10px 14px",
                borderRadius: 6,
                textDecoration: "none",
                color: "#111",
                background: "#f5f5f5",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/jobs"
              onClick={() => onNavigate?.()}
              style={{
                display: "block",
                padding: "10px 14px",
                borderRadius: 6,
                textDecoration: "none",
                color: "#111",
                background: "#f5f5f5",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            >
              Jobs
            </Link>
          </li>
          <li>
            <Link
              to="/candidates"
              onClick={() => onNavigate?.()}
              style={{
                display: "block",
                padding: "10px 14px",
                borderRadius: 6,
                textDecoration: "none",
                color: "#111",
                background: "#f5f5f5",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            >
              Candidates
            </Link>
          </li>
          <li>
            <Link
              to="/matches"
              onClick={() => onNavigate?.()}
              style={{
                display: "block",
                padding: "10px 14px",
                borderRadius: 6,
                textDecoration: "none",
                color: "#111",
                background: "#f5f5f5",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            >
              Matches
            </Link>
          </li>
          <li>
            <Link
              to="/interviews"
              onClick={() => onNavigate?.()}
              style={{
                display: "block",
                padding: "10px 14px",
                borderRadius: 6,
                textDecoration: "none",
                color: "#111",
                background: "#f5f5f5",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            >
              Interviews
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
