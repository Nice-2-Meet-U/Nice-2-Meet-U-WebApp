export default function MatchPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#111827] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Optional small title, matches rest of app */}
        <header className="mb-6 sm:mb-8">
          <p className="text-[11px] tracking-[0.35em] uppercase text-pink-300/80">
            Nice 2 Meet U
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">Your matches</h1>
          <p className="max-w-xl mt-2 text-sm text-slate-300">
            Join a pool, generate matches, and keep track of your connections —
            all powered by our matching service.
          </p>
        </header>

        {/* Card containing the standalone match UI */}
        <section className="rounded-[1.75rem] bg-slate-900/70 border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          <iframe
            src="/match-ui/index.html"
            title="Match UI"
            className="w-full min-h-[900px] md:min-h-[960px] border-0 block"
          />
        </section>
      </div>
    </main>
  );
}