// TODO: Update these URLs to point at your deployed microservices.
const ATOMIC_BASE_URL = process.env.NEXT_PUBLIC_ATOMIC_BASE_URL || "http://YOUR-ATOMIC-IP:PORT";
const COMPOSITE_BASE_URL = process.env.NEXT_PUBLIC_COMPOSITE_BASE_URL || "http://YOUR-COMPOSITE-IP:PORT";
const FEEDBACK_BASE_URL = process.env.NEXT_PUBLIC_FEEDBACK_BASE_URL || "http://localhost:8000";

async function request(path, { method = "GET", body, headers = {}, query } = {}) {
  const url = new URL(path, FEEDBACK_BASE_URL);
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      params.append(key, value);
    });
    const qs = params.toString();
    if (qs) {
      url.search = qs;
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  const data = text
    ? contentType.includes("application/json")
      ? JSON.parse(text)
      : text
    : null;

  if (!res.ok) {
    const message = data?.detail || data?.message || res.statusText;
    throw new Error(message || "Request failed");
  }

  return data;
}

export const feedbackRequest = request;

// Example: GET call to atomic microservice
export async function fetchAtomic() {
  const res = await fetch(`${ATOMIC_BASE_URL}/resource`, {
    method: "GET",
  });
  return res.json();
}

// Example: POST call to composite microservice
export async function sendCompositeData(payload) {
  const res = await fetch(`${COMPOSITE_BASE_URL}/composite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// Profile (match) feedback endpoints
export function createProfileFeedback(payload) {
  return request("/feedback/profile", { method: "POST", body: payload });
}

export function getProfileFeedback(id, { ifNoneMatch } = {}) {
  return request(`/feedback/profile/${id}`, {
    headers: ifNoneMatch ? { "If-None-Match": ifNoneMatch } : undefined,
  });
}

export function updateProfileFeedback(id, payload) {
  return request(`/feedback/profile/${id}`, { method: "PATCH", body: payload });
}

export function deleteProfileFeedback(id) {
  return request(`/feedback/profile/${id}`, { method: "DELETE" });
}

export function listProfileFeedback(params = {}) {
  return request("/feedback/profile", { query: params });
}

export function fetchProfileFeedbackStats(params) {
  return request("/feedback/profile/stats", { query: params });
}

// App feedback endpoints
export function createAppFeedback(payload) {
  return request("/feedback/app", { method: "POST", body: payload });
}

export function getAppFeedback(id, { ifNoneMatch } = {}) {
  return request(`/feedback/app/${id}`, {
    headers: ifNoneMatch ? { "If-None-Match": ifNoneMatch } : undefined,
  });
}

export function updateAppFeedback(id, payload, { ifMatch } = {}) {
  return request(`/feedback/app/${id}`, {
    method: "PATCH",
    body: payload,
    headers: ifMatch ? { "If-Match": ifMatch } : undefined,
  });
}

export function deleteAppFeedback(id) {
  return request(`/feedback/app/${id}`, { method: "DELETE" });
}

export function listAppFeedback(params = {}) {
  return request("/feedback/app", { query: params });
}

export function fetchAppFeedbackStats(params = {}) {
  return request("/feedback/app/stats", { query: params });
}

// Feedback analysis jobs (async stats refresh)
export function enqueueFeedbackJob(payload) {
  return request("/feedback/jobs", { method: "POST", body: payload });
}

export function getFeedbackJob(jobId) {
  return request(`/feedback/jobs/${jobId}`);
}
