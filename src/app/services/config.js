const DEV_FEEDBACK_FALLBACK = "http://localhost:8000";

function requireEnv(value, name) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function resolveFeedbackBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_FEEDBACK_BASE_URL;
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_FEEDBACK_BASE_URL");
  }

  // Development-only fallback so local dev works without manual env setup.
  return DEV_FEEDBACK_FALLBACK;
}

export const FEEDBACK_BASE_URL = resolveFeedbackBaseUrl();
export const USER_BASE_URL = requireEnv(process.env.NEXT_PUBLIC_USER_BASE_URL, "NEXT_PUBLIC_USER_BASE_URL");
export const PROFILE_BASE_URL = requireEnv(process.env.NEXT_PUBLIC_PROFILE_BASE_URL, "NEXT_PUBLIC_PROFILE_BASE_URL");
