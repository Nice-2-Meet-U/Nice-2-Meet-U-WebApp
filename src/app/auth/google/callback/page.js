"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authGoogleCallback, authMe } from "../../../services/api";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState({ loading: true, error: null });
  const searchParams = useSearchParams();
  const searchString = useMemo(() => searchParams?.toString() || "", [searchParams]);
  const redirectParam = useMemo(() => {
    if (!searchParams) return null;
    return searchParams.get("redirect") || searchParams.get("next") || null;
  }, [searchParams]);

  useEffect(() => {
    const finish = async () => {
      setStatus({ loading: true, error: null });
      try {
        let callbackData = null;
        if (searchString) {
          callbackData = await authGoogleCallback(searchString);
        }

        const me = await authMe();
        if (typeof window !== "undefined") {
          if (callbackData?.token) {
            localStorage.setItem("authToken", callbackData.token);
          }
          if (me) {
            localStorage.setItem("authUser", JSON.stringify(me));
          }
        }

        const fallback = me?.profile_id ? "/profile" : "/onboarding";
        router.replace(redirectParam || fallback);
      } catch (err) {
        setStatus({ loading: false, error: err.message || "Unable to complete Google auth." });
      }
    };

    finish();
  }, [redirectParam, router, searchString]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f8fbff] to-white py-10 px-4 sm:px-8 text-slate-800">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="rounded-3xl bg-white/90 border border-[#c8d4ff] shadow-[0_15px_45px_rgba(61,54,122,0.12)] p-6 space-y-3 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-500">Google callback</p>
          <h1 className="text-3xl font-semibold text-[#202349]">Finishing sign-in</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            We finalize OAuth, rely on the HttpOnly access_token cookie, and send you back into the app to start your
            profile. If a redirect target is provided via{" "}
            <code className="bg-indigo-50 text-indigo-800 rounded-xl px-2 py-1">redirect</code> or{" "}
            <code className="bg-indigo-50 text-indigo-800 rounded-xl px-2 py-1">next</code> query params, we respect it;
            otherwise we send you to onboarding (or straight to your profile if you already have one).
          </p>
          <Link href="/auth/connect" className="text-indigo-600 underline underline-offset-4 text-sm">← Back to Auth</Link>
        </header>

        <section className="bg-white/90 border border-[#c8d4ff] rounded-3xl shadow-[0_18px_50px_rgba(61,54,122,0.14)] p-6 space-y-3 backdrop-blur">
          {status.loading && <p className="text-indigo-600 font-medium">Finishing OAuth…</p>}
          {status.error && (
            <div className="space-y-3">
              <p className="text-red-600 font-medium">{status.error}</p>
              <button
                type="button"
                onClick={() => router.replace(defaultRedirect)}
                className="px-4 py-2 rounded-full bg-[#202349] text-white font-semibold hover:bg-[#2b2f5c]"
              >
                Return to auth console
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
