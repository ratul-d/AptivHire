// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/Auth";               // public login/register page
import PrivateRoute from "./components/PrivateRoute"; // auth guard

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import Matches from "./pages/Matches";
import Interviews from "./pages/Interviews";
import MatchDetails from "./pages/MatchDetails";
import InterviewDetails from "./pages/InterviewDetails";
import AptivHire from "./pages/landing"

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth route */}
        <Route index element={<AptivHire />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* All routes nested under "/" are protected */}
        <Route
          path="/"
          element={
            // PrivateRoute should return children (or <Outlet />) when user is authenticated.
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* nested inside Layout (Layout should render an <Outlet />) */}


          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="matches" element={<Matches />} />
          <Route path="matches/:job_id/:candidate_id" element={<MatchDetails />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="interviews/:job_id/:candidate_id" element={<InterviewDetails />} />
        </Route>

        {/* optional: fallback to auth (or a 404 component) */}
        <Route path="*" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}
