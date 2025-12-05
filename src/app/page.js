"use client";

import Link from "next/link";
import { useMemo } from "react";
import { authGoogleUrl } from "./services/api";

export default function Home() {
  const googleHref = useMemo(() => authGoogleUrl(), []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#050816] via-[#111827] to-[#020617] text-white flex items-center justify-center px-4">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left side: brand + tagline */}
        <div className="text-center md:text-left space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-pink-200/80">
            Nice 2 Meet U
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
            Dating, but simpler.
          </h1>
          <p className="text-base sm:text-lg text-slate-200/90 max-w-md">
            Log in, sign up, or continue with Google—then jump straight into
            building your profile and getting match-ready in minutes.
          </p>
        </div>

        {/* Right side: "phone" card with auth options */}
        <div className="w-full max-w-sm">
          <div className="relative">
            {/* Phone frame vibe */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-white/10 blur-2xl opacity-40" />
            <div className="relative rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
              {/* Top notch / indicators */}
              <div className="flex justify-center mb-6">
                <div className="h-1 w-16 rounded-full bg-white/30" />
              </div>

              {/* Logo + title */}
              <div className="flex flex-col items-center gap-1 mb-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 shadow-lg">
                  <span className="text-2xl">💘</span>
                </div>
                <h2 className="text-xl font-semibold mt-2">Nice 2 Meet U</h2>
                <p className="text-xs text-slate-200/80">
                  Log in or sign up to continue
                </p>
              </div>

              {/* Google CTA */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = googleHref;
                  }}
                  className="flex items-center justify-center gap-2 w-full rounded-full bg-white text-slate-900 font-semibold py-3 text-sm shadow-[0_14px_40px_rgba(0,0,0,0.45)] hover:bg-slate-50 active:scale-[0.99] transition"
                >
                  {/* Fake Google icon circle */}
                  <span className="h-5 w-5 rounded-full bg-gradient-to-tr from-[#4285F4] via-[#FBBC05] to-[#EA4335] flex items-center justify-center text-[10px] font-black text-white">
                    G
                  </span>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 text-xs text-slate-300/70">
                  <div className="h-px flex-1 bg-white/15" />
                  <span>or</span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>

                {/* Email login / signup */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/auth/login"
                    className="flex-1 rounded-full border border-white/40 bg-white/5 text-white text-sm font-semibold py-3 text-center hover:bg-white/10 hover:border-white/70 active:scale-[0.99] transition"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex-1 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-slate-950 text-sm font-semibold py-3 text-center shadow-[0_18px_50px_rgba(0,0,0,0.6)] hover:brightness-110 active:scale-[0.99] transition"
                  >
                    Sign up
                  </Link>
                </div>
              </div>

              {/* Small legal / hint */}
              <p className="mt-6 text-[10px] text-center text-slate-300/70 leading-relaxed">
                By continuing, you agree to our Terms and acknowledge our
                Privacy Policy. No spam, just better matches. 💞
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
