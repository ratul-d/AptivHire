// src/services/auth.js
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

const ACCESS_KEY = "aptiv_access_token";
const REFRESH_KEY = "aptiv_refresh_token";
const EMAIL = "aptiv_email";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
export function getEmail() {
  return localStorage.getItem(EMAIL);
}
export function setTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem(ACCESS_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EMAIL);
}

/** login: POST /auth/login -> expects { email, password }.
 *  response JSON must contain access_token and refresh_token.
 */
export async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Login failed (${res.status})`);
  }
  const data = await res.json();
  setTokens(data);
  if (email) localStorage.setItem(EMAIL, email);
  return data;
}

export async function register({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Register failed (${res.status})`);
  }
  return await res.json();
}

/** call refresh endpoint with refresh_token in JSON {"refresh_token": "..."} */
export async function refreshAccessToken() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) throw new Error("No refresh token");
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  if (!res.ok) {
    // remove tokens on failed refresh
    clearTokens();
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Refresh failed (${res.status})`);
  }
  const data = await res.json();
  // server returns { access_token: ... } (and maybe refresh)
  setTokens({ access_token: data.access_token, refresh_token: data.refresh_token ?? refresh_token });
  return data;
}

/**
 * fetchWithAuth(url, opts) — attaches Authorization header and retries once after refresh
 * Usage: fetchWithAuth("/jobs", { method: "GET" })
 */
export async function fetchWithAuth(input, init = {}) {
  const access = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (access) headers.set("Authorization", `Bearer ${access}`);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

  let res = await fetch(input.startsWith("http") ? input : `${API_BASE}${input}`, {
    ...init,
    headers,
  });

  if (res.status === 401) {
    // try refresh once
    try {
      await refreshAccessToken();
      const newAccess = getAccessToken();
      const retryHeaders = new Headers(init.headers || {});
      if (newAccess) retryHeaders.set("Authorization", `Bearer ${newAccess}`);
      retryHeaders.set("Content-Type", retryHeaders.get("Content-Type") ?? "application/json");
      res = await fetch(input.startsWith("http") ? input : `${API_BASE}${input}`, {
        ...init,
        headers: retryHeaders,
      });
    } catch (err) {
      // refresh failed => clear tokens and bubble up 401
      clearTokens();
      throw err;
    }
  }

  return res;
}
