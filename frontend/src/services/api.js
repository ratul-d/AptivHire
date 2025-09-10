// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function handleResponse(res) {
  if (!res.ok) {
    // try parse body for useful error detail
    try {
      const body = await res.json();
      throw new Error(body.detail || body.message || JSON.stringify(body));
    } catch {
      throw new Error(`HTTP error ${res.status}`);
    }
  }
  return res.json();
}

export async function postJob(raw_text) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text }),
  });
  return handleResponse(res);
}

export async function fetchJobs() {
  const res = await fetch(`${API_BASE}/jobs`);
  return handleResponse(res);
}

export async function uploadCandidatePDF(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/candidates`, {
    method: "POST",
    body: fd,
  });
  return handleResponse(res);
}

export async function fetchCandidates() {
  const res = await fetch(`${API_BASE}/candidates`);
  return handleResponse(res);
}

export async function postMatch(job_id, candidate_id) {
  const res = await fetch(`${API_BASE}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id, candidate_id }),
  });
  return handleResponse(res);
}

export async function scheduleInterview(payload) {
  const res = await fetch(`${API_BASE}/interviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export default {
  postJob,
  fetchJobs,
  uploadCandidatePDF,
  fetchCandidates,
  postMatch,
  scheduleInterview,
};
