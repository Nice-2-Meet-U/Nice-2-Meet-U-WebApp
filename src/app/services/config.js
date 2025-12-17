function requireEnv(value, name) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireHttpsEnv(name) {
  const raw = requireEnv(process.env[name], name);
  const value = raw.trim();
  if (!value.startsWith("https://")) {
    throw new Error(`Invalid ${name}: must start with "https://"`);
  }
  return value;
}

export const FEEDBACK_BASE_URL = requireHttpsEnv("NEXT_PUBLIC_FEEDBACK_BASE_URL");
export const USER_BASE_URL = requireHttpsEnv("NEXT_PUBLIC_USER_BASE_URL");
export const PROFILE_BASE_URL = requireHttpsEnv("NEXT_PUBLIC_PROFILE_BASE_URL");
