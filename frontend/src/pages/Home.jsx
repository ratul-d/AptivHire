// src/pages/Home.jsx
import React from "react";

export default function Home() {
  // Fake data for demonstration
  const totalJobs = 128;
  const totalCandidates = 342;
  const totalMatches = 76;
  const avgMatchScore = 82; // %
  const upcomingInterviews = 12;

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <h1 style={{ marginBottom: 12 }}>Welcome, Recruiter!</h1>
      <p style={{ marginBottom: 24, color: "#555" }}>
        Here's a quick overview of your recruitment activity.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        <div
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalJobs}</div>
          <div style={{ fontSize: 14, color: "#666" }}>Total Jobs</div>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalCandidates}</div>
          <div style={{ fontSize: 14, color: "#666" }}>Total Candidates</div>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalMatches}</div>
          <div style={{ fontSize: 14, color: "#666" }}>Total Matches</div>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700 }}>{avgMatchScore}%</div>
          <div style={{ fontSize: 14, color: "#666" }}>Average Match Score</div>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700 }}>{upcomingInterviews}</div>
          <div style={{ fontSize: 14, color: "#666" }}>Upcoming Interviews</div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 12 }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              padding: "10px 16px",
              background: "#black",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            View Jobs
          </button>
          <button
            style={{
              padding: "10px 16px",
              background: "black",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            View Candidates
          </button>
          <button
            style={{
              padding: "10px 16px",
              background: "#black",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            View Matches
          </button>
        </div>
      </div>
    </div>
  );
}
