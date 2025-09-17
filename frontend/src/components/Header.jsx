// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { clearTokens, getEmail } from "../services/auth";

export default function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const email = getEmail();

  function handleLogout() {
    // optional confirmation
    if (!window.confirm("Are you sure you want to log out?")) return;

    // clear tokens from localStorage (implemented in services/auth)
    clearTokens();

    // navigate to auth page (replace so user can't go back)
    navigate("/auth", { replace: true });

    // optionally reload to reset app state (uncomment if you need a hard reset)
    // window.location.reload();
  }

  return (
    <header
      className="header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          aria-label="Toggle menu"
          onClick={toggleSidebar}
          style={{
            fontSize: 17,
            background: "black",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            padding: 5,
            borderRadius: 6,
          }}
        >
          ☰
        </button>

        <div style={{ fontWeight: 800, fontSize: 25 }}>AptivHire</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ color: "#666" }}>Recruitment Streamlining Portal</div>
        <div style={{ color: "#666" }}>|</div>
        <div style={{ color: "#666" }}>User: {email}</div>

        <button
          onClick={handleLogout}
          aria-label="Logout"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #eee",
            background: "#fffff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
