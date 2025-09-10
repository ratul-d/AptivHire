// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import Matches from "./pages/Matches";
import Interviews from "./pages/Interviews";
import MatchDetails from "./pages/MatchDetails"
import InterviewDetails from "./pages/InterviewDetails"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />        {/* default home page */}
          <Route path="dashboard" element={<Dashboard />} /> {/* accessible via /dashboard */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="matches" element={<Matches />} />
          <Route path="matches/:job_id/:candidate_id" element={<MatchDetails />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="interviews/:job_id/:candidate_id" element={<InterviewDetails />} />
          {/* add more nested routes here (candidates, matches, interviews) */}
        </Route>
      </Routes>
    </Router>
  );
}
