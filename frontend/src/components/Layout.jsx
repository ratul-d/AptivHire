// src/components/Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggleSidebar() {
    setSidebarOpen(v => !v);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />
      <main style={{
        marginLeft: sidebarOpen ? 260 : 0,
        transition: "margin-left 0.18s ease",
        padding: 16,
      }}>
        <Outlet />
      </main>
    </div>
  );
}
