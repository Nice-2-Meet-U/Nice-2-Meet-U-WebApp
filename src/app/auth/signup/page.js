"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createProfile } from "../../services/api";

const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-300";

export default function SignupPage() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setError("");
  }, [form]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus("Creating your account…");
    setError("");
    (async () => {
      try {
        const payload = {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          bio: null,
          gender: null,
          location: null,
          phone: null,
          birth_date: null,
        };
        const profile = await createProfile(payload);
        localStorage.setItem("mockAuth", "true");
        if (profile?.id) {
          localStorage.setItem("mockProfileId", profile.id);
        }
        setStatus("Account created. Let’s set up your profile.");
        setTimeout(() => router.push("/onboarding"), 600);
      } catch (err) {
        setError(err?.message || "Unable to create account.");
        setStatus("");
      }
    })();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1d2438] to-[#101827] text-white">
      <div className="max-w-xl mx-auto px-5 sm:px-10 py-14 space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">Join</p>
          <h1 className="text-4xl font-semibold">Create your account</h1>
          <p className="text-sm text-slate-200">Sign up, then head straight to profile creation.</p>
          <Link href="/" className="text-emerald-200 underline underline-offset-4 text-sm">
            ← Return home
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="space-y-1 text-sm font-semibold text-white">
              First Name
              <input
                name="first_name"
                required
                className={inputClass}
                value={form.first_name}
                onChange={handleChange}
                placeholder="Ada"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-white">
              Last Name
              <input
                name="last_name"
                required
                className={inputClass}
                value={form.last_name}
                onChange={handleChange}
                placeholder="Lovelace"
              />
            </label>
          </div>
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
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#34d399] to-[#10b981] text-slate-900 font-semibold shadow-lg hover:opacity-90"
          >
            Sign Up
          </button>
          {status ? <p className="text-center text-emerald-200 text-sm">{status}</p> : null}
          {error ? <p className="text-center text-red-200 text-sm">{error}</p> : null}
          <p className="text-center text-sm text-slate-300">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4 text-emerald-200">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
