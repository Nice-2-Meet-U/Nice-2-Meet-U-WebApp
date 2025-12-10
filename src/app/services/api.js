import { FEEDBACK_BASE_URL, USER_BASE_URL, PROFILE_BASE_URL } from "./config";

const AUTH_BASE_URL = USER_BASE_URL;

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
export function userRequest(path, options) {
  return requestFrom(USER_BASE_URL, path, { includeCredentials: true, useAuthToken: true, ...options });
}

function requestFrom(
  baseUrl,
  path,
  { method = "GET", body, headers = {}, query, includeCredentials, useAuthToken } = {}
) {
  const url = new URL(path, baseUrl);
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

  const authToken =
    useAuthToken && typeof window !== "undefined" ? localStorage.getItem("authToken") || undefined : undefined;

  return fetch(url.toString(), {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: includeCredentials ? "include" : "same-origin",
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
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
  });
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

// Auth (Users service)
export function authSignup(payload) {
  return requestFrom(AUTH_BASE_URL, "/auth/signup", { method: "POST", body: payload, includeCredentials: true });
}

export function authLogin(payload) {
  return requestFrom(AUTH_BASE_URL, "/auth/login", { method: "POST", body: payload, includeCredentials: true });
}

export function authMe(token) {
  return requestFrom(AUTH_BASE_URL, "/auth/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    includeCredentials: true,
  });
}

export function authLogout(token) {
  return requestFrom(AUTH_BASE_URL, "/auth/logout", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    includeCredentials: true,
  });
}

export function authGoogleUrl() {
  return `${AUTH_BASE_URL.replace(/\/$/, "")}/auth/google`;
}

export function authGoogleCallback(searchParams) {
  const path = `/auth/google/callback${searchParams ? `?${searchParams}` : ""}`;
  return requestFrom(AUTH_BASE_URL, path, { includeCredentials: true });
}

export function getMyProfile(token) {
  return requestFrom(PROFILE_BASE_URL, "/profiles/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    includeCredentials: true,
    useAuthToken: true,
  });
}

// Profile microservice
export function createProfile(payload) {
  return requestFrom(PROFILE_BASE_URL, "/profiles", {
    method: "POST",
    body: payload,
    includeCredentials: true,
    useAuthToken: true,
  });
}

export function getProfile(profileId) {
  return requestFrom(PROFILE_BASE_URL, `/profiles/${profileId}`, {
    includeCredentials: true,
    useAuthToken: true,
  });
}

export function updateProfile(profileId, payload) {
  return requestFrom(PROFILE_BASE_URL, "/profiles/me", {
    method: "PUT",
    body: payload,
    includeCredentials: true,
    useAuthToken: true,
  });
}

export function deleteProfile() {
  return requestFrom(PROFILE_BASE_URL, "/profiles/me", {
    method: "DELETE",
    includeCredentials: true,
    useAuthToken: true,
  });
}

export function listProfiles(params = {}) {
  return requestFrom(PROFILE_BASE_URL, "/profiles", {
    query: params,
    includeCredentials: true,
    useAuthToken: true,
  });
}

// User microservice: photos
export function createPhoto(payload) {
  return requestFrom(PROFILE_BASE_URL, "/photos", {
    method: "POST",
    body: payload,
    includeCredentials: true,
    useAuthToken: true,
  });
}

export function getPhoto(photoId) {
  return requestFrom(PROFILE_BASE_URL, `/photos/${photoId}`, {
    includeCredentials: true,
    useAuthToken: true,
  });
}

export function updatePhoto(photoId, payload) {
  return requestFrom(PROFILE_BASE_URL, `/photos/${photoId}`, {
    method: "PATCH",
    body: payload,
    includeCredentials: true,
    useAuthToken: true,
  });
}

export function deletePhoto(photoId) {
  return requestFrom(PROFILE_BASE_URL, `/photos/${photoId}`, {
    method: "DELETE",
    includeCredentials: true,
    useAuthToken: true,
  });
}

export function listPhotos(params = {}) {
  return requestFrom(PROFILE_BASE_URL, "/photos", {
    query: params,
    includeCredentials: true,
    useAuthToken: true,
  });
}

// User microservice: visibility
export function createVisibility(payload) {
  return userRequest("/visibility", { method: "POST", body: payload });
}

export function getVisibilityByProfile(profileId) {
  return userRequest(`/visibility/${profileId}`);
}

export function updateVisibility(visibilityId, payload) {
  return userRequest(`/visibility/${visibilityId}`, { method: "PATCH", body: payload });
}
