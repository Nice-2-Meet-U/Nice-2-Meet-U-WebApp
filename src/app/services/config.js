function requireEnv(value, name) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const FEEDBACK_BASE_URL = requireEnv(process.env.NEXT_PUBLIC_FEEDBACK_BASE_URL, "NEXT_PUBLIC_FEEDBACK_BASE_URL");
export const USER_BASE_URL = requireEnv(process.env.NEXT_PUBLIC_USER_BASE_URL, "NEXT_PUBLIC_USER_BASE_URL");
export const PROFILE_BASE_URL = requireEnv(process.env.NEXT_PUBLIC_PROFILE_BASE_URL, "NEXT_PUBLIC_PROFILE_BASE_URL");
