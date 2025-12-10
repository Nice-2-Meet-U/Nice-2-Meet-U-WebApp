"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  authGoogleUrl,
  authLogin,
  authLogout,
  authMe,
  authSignup,
  getMyProfile,
} from "../../services/api";
import { PROFILE_BASE_URL } from "../../services/config";

const cardClass =
  "bg-white/90 border border-[#c8d4ff] rounded-3xl shadow-[0_18px_50px_rgba(61,54,122,0.14)] p-6 space-y-5 backdrop-blur";
const inputClass =
  "mt-1 h-10 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full";

const emptyState = { loading: false, data: null, error: null };

function Result({ state }) {
  if (state.loading) return <p className="text-indigo-600 font-medium">Working...</p>;
  if (state.error) return <p className="text-red-600 font-medium">{state.error}</p>;
  if (!state.data) return null;
  return (
    <pre className="mt-3 text-xs sm:text-sm bg-[#0f172a] text-white/90 p-4 rounded-2xl overflow-auto shadow-inner">
      {JSON.stringify(state.data, null, 2)}
    </pre>
  );
}

export default function AuthConnectPage() {
  const [signupForm, setSignupForm] = useState({ email: "", password: "", name: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [signupState, setSignupState] = useState(emptyState);
  const [loginState, setLoginState] = useState(emptyState);
  const [meState, setMeState] = useState(emptyState);
  const [profileState, setProfileState] = useState(emptyState);
  const [logoutState, setLogoutState] = useState(emptyState);

  const googleHref = useMemo(() => authGoogleUrl(), []);
  const profileBase = PROFILE_BASE_URL;

  const storeSession = (newToken, newUser) => {
    setToken(newToken || "");
    setUser(newUser || null);
    if (typeof window !== "undefined") {
      if (newToken) {
        localStorage.setItem("authToken", newToken);
      } else {
        localStorage.removeItem("authToken");
      }
      if (newUser) {
        localStorage.setItem("authUser", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("authUser");
      }
    }
  };

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
    if (stored) setToken(stored);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (user) return;
    const hydrate = async () => {
      setMeState({ loading: true, data: null, error: null });
      try {
        const data = await authMe();
        setMeState({ loading: false, data, error: null });
        if (data) {
          storeSession(token, data);
        }
      } catch (err) {
        setMeState({ loading: false, data: null, error: err.message || "Unable to fetch me." });
      }
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSignup = async (event) => {
    event.preventDefault();
    setSignupState({ loading: true, data: null, error: null });
    try {
      const data = await authSignup({
        email: signupForm.email,
        password: signupForm.password,
        name: signupForm.name || undefined,
      });
      storeSession(data.token, data.user);
      setSignupState({ loading: false, data, error: null });
    } catch (err) {
      setSignupState({ loading: false, data: null, error: err.message || "Unable to sign up." });
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginState({ loading: true, data: null, error: null });
    try {
      const data = await authLogin({
        email: loginForm.email,
        password: loginForm.password,
      });
      storeSession(data.token, data.user);
      setLoginState({ loading: false, data, error: null });
    } catch (err) {
      setLoginState({ loading: false, data: null, error: err.message || "Unable to log in." });
    }
  };

  const handleMe = async () => {
    setMeState({ loading: true, data: null, error: null });
    try {
      const data = await authMe(token || undefined);
      setMeState({ loading: false, data, error: null });
      if (data) {
        storeSession(token, data);
      }
    } catch (err) {
      setMeState({ loading: false, data: null, error: err.message || "Unable to fetch me." });
    }
  };

  const handleProfile = async () => {
    setProfileState({ loading: true, data: null, error: null });
    try {
      const data = await getMyProfile(token || undefined);
      setProfileState({ loading: false, data, error: null });
    } catch (err) {
      setProfileState({ loading: false, data: null, error: err.message || "Unable to fetch profile." });
    }
  };

  const handleLogout = async () => {
    setLogoutState({ loading: true, data: null, error: null });
    try {
      const data = await authLogout(token || undefined);
      storeSession("", null);
      setLogoutState({ loading: false, data, error: null });
    } catch (err) {
      setLogoutState({ loading: false, data: null, error: err.message || "Unable to logout." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f8fbff] to-white py-10 px-4 sm:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="rounded-3xl bg-white/90 border border-[#c8d4ff] shadow-[0_15px_45px_rgba(61,54,122,0.12)] p-6 space-y-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Link href="/" className="underline underline-offset-4 decoration-indigo-400">Home</Link>
            <span>›</span>
            <span className="text-slate-900 font-medium">Auth</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-[#202349]">User Auth + Protected Profile</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Call the Users service for signup/login/Google, then exercise the protected Profiles API with the JWT.
          </p>
          <div className="text-xs text-slate-500 flex flex-wrap gap-4">
            <span>Users base: <code className="bg-indigo-50 text-indigo-800 rounded-xl px-2 py-1">{authGoogleUrl().split("/auth")[0]}</code></span>
            <span>Profiles base: <code className="bg-indigo-50 text-indigo-800 rounded-xl px-2 py-1">{profileBase}</code></span>
          </div>
          {token ? (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Token present
            </div>
          ) : (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-3 py-2 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> No token stored
            </div>
          )}
          {user?.profile_id ? (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Profile ID: {user.profile_id}
            </div>
          ) : null}
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <div className={cardClass}>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Sign Up</p>
              <p className="text-sm text-slate-500">Creates account via /auth/signup and stores token.</p>
            </div>
            <form className="space-y-3" onSubmit={handleSignup}>
              <label className="text-sm font-semibold text-slate-900">
                Email
                <input
                  type="email"
                  className={inputClass}
                  value={signupForm.email}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-semibold text-slate-900">
                Password
                <input
                  type="password"
                  className={inputClass}
                  value={signupForm.password}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-semibold text-slate-900">
                Name (optional)
                <input
                  className={inputClass}
                  value={signupForm.name}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#5b8def] via-[#6c7bff] to-[#7f5af0] text-white font-semibold shadow-lg hover:opacity-90"
                disabled={signupState.loading}
              >
                {signupState.loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
            <Result state={signupState} />
          </div>

          <div className={cardClass}>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Log In</p>
              <p className="text-sm text-slate-500">Authenticates via /auth/login and stores token.</p>
            </div>
            <form className="space-y-3" onSubmit={handleLogin}>
              <label className="text-sm font-semibold text-slate-900">
                Email
                <input
                  type="email"
                  className={inputClass}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-semibold text-slate-900">
                Password
                <input
                  type="password"
                  className={inputClass}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </label>
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#202349] text-white font-semibold shadow-lg hover:bg-[#2b2f5c]"
                disabled={loginState.loading}
              >
                {loginState.loading ? "Logging in..." : "Log In"}
              </button>
            </form>
            <Result state={loginState} />
          </div>
        </section>

        <section className={cardClass}>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">OAuth</p>
            <p className="text-sm text-slate-500">
              Use Google to auth; backend sets an HttpOnly access_token cookie, then we load your session via
              {" "}
              <code className="bg-indigo-50 text-indigo-800 rounded-xl px-2 py-1">/auth/me</code> when you land back in
              the app and send you to onboarding to create your profile. Callback page is{" "}
              <code className="bg-indigo-50 text-indigo-800 rounded-xl px-2 py-1">/auth/google/callback</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = googleHref;
              }}
              className="px-5 py-3 rounded-full bg-white border border-[#c8d4ff] text-[#202349] font-semibold hover:bg-indigo-50"
            >
              Continue with Google
            </button>
            <Link
              href="/auth/google/callback"
              className="px-5 py-3 rounded-full bg-gradient-to-r from-[#6dd3ff] to-[#7f5af0] text-white font-semibold shadow-lg hover:opacity-90"
            >
              Debug callback page
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className={cardClass}>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Me</p>
              <p className="text-sm text-slate-500">Calls /auth/me with Authorization header + cookies.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleMe}
                className="px-5 py-3 rounded-full bg-gradient-to-r from-[#20a4f3] to-[#7f5af0] text-white font-semibold shadow-lg hover:opacity-90"
                disabled={meState.loading}
              >
                {meState.loading ? "Loading..." : "Fetch Me"}
              </button>
              {user ? (
                <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
                  Stored user: {user.email || user.name || "—"}
                </div>
              ) : null}
              <Result state={meState} />
            </div>
          </div>

          <div className={cardClass}>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Protected profile</p>
              <p className="text-sm text-slate-500">Calls /profiles/me on the protected Profiles service.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleProfile}
                className="px-5 py-3 rounded-full bg-[#202349] text-white font-semibold shadow-lg hover:bg-[#2b2f5c]"
                disabled={profileState.loading}
              >
                {profileState.loading ? "Loading..." : "Fetch My Profile"}
              </button>
              <Result state={profileState} />
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Logout</p>
            <p className="text-sm text-slate-500">Calls /auth/logout, clears cookie + local token.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-3 rounded-full bg-rose-500 text-white font-semibold shadow-lg hover:bg-rose-600"
            disabled={logoutState.loading}
          >
            {logoutState.loading ? "Logging out..." : "Logout"}
          </button>
          <Result state={logoutState} />
        </section>
      </div>
    </div>
  );
}
