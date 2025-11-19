"use client";

import Link from "next/link";
import { useState } from "react";
import { fetchAtomic, sendCompositeData } from "./services/api";

export default function Home() {
  const [atomicData, setAtomicData] = useState(null);
  const [compositeData, setCompositeData] = useState(null);

  const handleGetAtomic = async () => {
    try {
      const data = await fetchAtomic();
      setAtomicData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostComposite = async () => {
    try {
      const data = await sendCompositeData({ test: "hello" });
      setCompositeData(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fff5f7] bg-[radial-gradient(circle_at_top,#fcefee,#fff5f7_45%,#fdfbf5)]">
      <div className="max-w-5xl mx-auto px-5 sm:px-10 py-12 space-y-10">
        <header className="rounded-3xl bg-white/80 border border-rose-100 shadow-[0_40px_80px_rgba(36,16,68,0.08)] p-8 space-y-4 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-400">Nice 2 Meet U</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#2b143c]">Feedback Hub</h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Ship a Hinge-inspired experience with playgrounds for match debriefs and app sentiment. Use the cards below to jump into each workflow or ping our microservices directly.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGetAtomic}
              className="px-5 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#ff6f91] via-[#f7aef8] to-[#b983ff] shadow-lg hover:opacity-90"
            >
              Call Atomic Service
            </button>
            <button
              onClick={handlePostComposite}
              className="px-5 py-3 rounded-full font-semibold border border-[#2b143c] text-[#2b143c] hover:bg-[#2b143c] hover:text-white transition"
            >
              Call Composite Service
            </button>
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          {[
            {
              href: "/feedback/matches",
              label: "Match Feedback",
              summary:
                "Document chemistry, red flags, and top tags for every match. Filters + stats mimic Hinge's internal tooling.",
              accent: "from-[#ffb347] to-[#ff6f91]",
            },
            {
              href: "/feedback/app",
              label: "App Feedback",
              summary:
                "Collect global sentiment, triage usability issues, and pull executive-ready stats across the app experience.",
              accent: "from-[#f6ae2d] to-[#c77dff]",
            },
          ].map(({ href, label, summary, accent }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden rounded-3xl border border-rose-100 bg-white/90 shadow-[0_25px_45px_rgba(36,16,68,0.08)] p-6 space-y-3"
            >
              <span className={`absolute inset-x-6 top-6 h-1 rounded-full bg-gradient-to-r ${accent} opacity-80`} />
              <div className="pt-8">
                <p className="text-sm uppercase tracking-[0.25em] text-rose-400">Playground</p>
                <h2 className="text-2xl font-semibold text-[#2b143c]">{label}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
                <span className="inline-flex items-center gap-2 text-[#2b143c] font-semibold mt-4">
                  Open playground
                  <svg className="w-4 h-4 transition group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </section>
      </div>

      {atomicData && (
        <div className="bg-white/95 border border-rose-100 rounded-3xl shadow-xl w-full max-w-md mx-auto p-6 mb-6">
          <h2 className="text-lg font-bold">Atomic Response:</h2>
          <pre className="text-sm mt-2 overflow-x-auto">
            {JSON.stringify(atomicData, null, 2)}
          </pre>
        </div>
      )}

      {compositeData && (
        <div className="bg-white/95 border border-rose-100 rounded-3xl shadow-xl w-full max-w-md mx-auto p-6 mb-6">
          <h2 className="text-lg font-bold">Composite Response:</h2>
          <pre className="text-sm mt-2 overflow-x-auto">
            {JSON.stringify(compositeData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
