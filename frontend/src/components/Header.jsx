// src/components/Header.jsx
import React from "react";

export default function Header({ toggleSidebar }) {
  return (
    <header className="header" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      borderBottom: "1px solid #eee",
      background: "#fff"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          aria-label="Toggle menu"
          onClick={toggleSidebar}
          style={{
            fontSize: 17,
            background: "black",
            border: "none",
            cursor: "pointer",
            padding: 7
          }}
        >
          ☰
        </button>

        <div style={{ fontWeight: 700, fontSize: 25 }}>
          AptivHire
        </div>
      </div>

      <div style={{ color: "#666" }}>Recruitment Streamlining Portal</div>
    </header>
  );
}
