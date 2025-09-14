// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../services/auth";

/**
 * Use in your router:
 * <Route element={<PrivateRoute/>}>
 *   <Route path="/" element={<Dashboard />} />
 * </Route>
 */
export default function PrivateRoute({ children }) {
  const token = getAccessToken();
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  // optionally decode token expiry here and redirect if expired
  return children ? children : <Outlet />;
}
