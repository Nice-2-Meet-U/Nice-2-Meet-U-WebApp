"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-300";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setStatus("Signing you in…");
    setTimeout(() => {
      localStorage.setItem("mockAuth", "true");
      setStatus("Signed in.");
      router.push("/profile");
    }, 600);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1d2438] to-[#101827] text-white">
      <div className="max-w-xl mx-auto px-5 sm:px-10 py-14 space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Welcome Back</p>
          <h1 className="text-4xl font-semibold">Log in to Nice 2 Meet U</h1>
          <p className="text-sm text-slate-200">Continue to your profile and matches.</p>
          <Link href="/" className="text-amber-200 underline underline-offset-4 text-sm">
            ← Return home
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        >
          <label className="space-y-1 text-sm font-semibold text-white">
            Email
            <input
              type="email"
              name="email"
              required
              className={inputClass}
              value={form.email}
              onChange={handleChange}
              placeholder="ada@example.com"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-white">
            Password
            <input
              type="password"
              name="password"
              required
              className={inputClass}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] text-slate-900 font-semibold shadow-lg hover:opacity-90"
          >
            Log In
          </button>
          {status ? <p className="text-center text-amber-200 text-sm">{status}</p> : null}
          {error ? <p className="text-center text-red-200 text-sm">{error}</p> : null}
          <p className="text-center text-sm text-slate-300">
            No account?{" "}
            <Link href="/auth/signup" className="underline underline-offset-4 text-amber-200">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
