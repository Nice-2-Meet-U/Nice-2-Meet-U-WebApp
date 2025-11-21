"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createAppFeedback, listAppFeedback, fetchAppFeedbackStats } from "../../services/api";

const ratings = [1, 2, 3, 4, 5];
const badgeClass =
  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-[#ffe8d6] text-[#b65f35]";
const cardClass =
  "bg-white border border-[#ffe4cf] rounded-3xl shadow-[0px_8px_30px_rgba(32,10,55,0.06)] p-5 space-y-5";
const labelClass = "flex flex-col gap-1 text-sm font-semibold text-slate-900 w-full sm:w-[260px] mx-auto";
const inputClass =
  "mt-1 h-10 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-[#ffd6b3] w-full sm:w-[240px]";
const selectClass = `${inputClass} cursor-pointer`;
const textareaClass =
  "mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-[#ffd6b3] min-h-[90px] w-full sm:w-[320px] mx-auto";

const initialCreateForm = {
  author_profile_id: "",
  overall: "5",
  usability: "",
  reliability: "",
  performance: "",
  support_experience: "",
  headline: "",
  comment: "",
  tags: "",
};

const initialListFilters = {
  author_profile_id: "",
  tags: "",
  search: "",
  min_overall: "",
  max_overall: "",
  since: "",
  sort: "created_at",
  order: "desc",
  limit: "10",
  offset: "",
  cursor: "",
};

const initialStatsFilters = {
  tags: "",
  since: "",
};

function parseTags(input) {
  if (!input) return undefined;
  const tags = input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length ? tags : undefined;
}

function parseDateValue(raw) {
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function ResultBlock({ state }) {
  if (state.loading) return <p className="text-[#b65f35] font-medium">Working...</p>;
  if (state.error) return <p className="text-red-600 font-medium">{state.error}</p>;
  if (!state.data) return <p className="text-slate-500">Nothing to show yet.</p>;
  return (
    <pre className="mt-3 text-xs sm:text-sm bg-[#1f1630] text-white/90 p-4 rounded-2xl overflow-auto shadow-inner">
      {JSON.stringify(state.data, null, 2)}
    </pre>
  );
}

export default function AppFeedbackPage() {
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [createState, setCreateState] = useState({ loading: false, data: null, error: null });

  const [listFilters, setListFilters] = useState(initialListFilters);
  const [listState, setListState] = useState({ loading: false, data: null, error: null });

  const [statsFilters, setStatsFilters] = useState(initialStatsFilters);
  const [statsState, setStatsState] = useState({ loading: false, data: null, error: null });

  const handleInput = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_FEEDBACK_BASE_URL || "http://localhost:8000", []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateState({ loading: true, data: null, error: null });
    try {
      const payload = {
        author_profile_id: createForm.author_profile_id || null,
        overall: Number(createForm.overall),
        usability: createForm.usability ? Number(createForm.usability) : null,
        reliability: createForm.reliability ? Number(createForm.reliability) : null,
        performance: createForm.performance ? Number(createForm.performance) : null,
        support_experience: createForm.support_experience
          ? Number(createForm.support_experience)
          : null,
        headline: createForm.headline || null,
        comment: createForm.comment || null,
        tags: parseTags(createForm.tags) || null,
      };
      const data = await createAppFeedback(payload);
      setCreateState({ loading: false, data, error: null });
    } catch (err) {
      setCreateState({ loading: false, data: null, error: err.message || "Unable to submit feedback." });
    }
  };

  const handleList = async (event) => {
    event.preventDefault();
    setListState({ loading: true, data: null, error: null });
    try {
      const query = {
        author_profile_id: listFilters.author_profile_id || undefined,
        tags: listFilters.tags || undefined,
        search: listFilters.search || undefined,
        min_overall: listFilters.min_overall || undefined,
        max_overall: listFilters.max_overall || undefined,
        since: parseDateValue(listFilters.since),
        sort: listFilters.sort,
        order: listFilters.order,
        limit: listFilters.limit ? Number(listFilters.limit) : undefined,
        offset: listFilters.offset ? Number(listFilters.offset) : undefined,
        cursor: listFilters.cursor || undefined,
      };
      const data = await listAppFeedback(query);
      setListState({ loading: false, data, error: null });
    } catch (err) {
      setListState({ loading: false, data: null, error: err.message || "Unable to run query." });
    }
  };

  const handleStats = async (event) => {
    event.preventDefault();
    setStatsState({ loading: true, data: null, error: null });
    try {
      const query = {
        tags: statsFilters.tags || undefined,
        since: parseDateValue(statsFilters.since),
      };
      const data = await fetchAppFeedbackStats(query);
      setStatsState({ loading: false, data, error: null });
    } catch (err) {
      setStatsState({ loading: false, data: null, error: err.message || "Unable to load stats." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f1ea] to-[#eee8de] py-10 px-4 sm:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="rounded-3xl bg-white border border-[#ffe4cf] shadow-[0_15px_45px_rgba(32,10,55,0.08)] p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Link href="/" className="underline underline-offset-4 decoration-[#b65f35]">Home</Link>
            <span>›</span>
            <span>Feedback</span>
            <span>›</span>
            <span className="text-slate-900 font-medium">App</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-[#3e1b3d]">App Sentiment Studio</span>
            <span className={badgeClass}>Live</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Mirror Hinge&rsquo;s premium polish with refined storytelling: log delight or frustration, sift signals, and deliver data-backed priorities for product squads.
          </p>
          <div className="text-xs text-slate-500">
            API base: <code className="bg-[#fff2e3] text-[#b65f35] rounded-xl px-2 py-1">{apiBase}</code>
          </div>
        </header>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#d98e73]">Step 01</p>
              <h2 className="text-2xl font-semibold text-[#3e1b3d]">Create App Feedback</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Capture the vibe in less than a minute.</p>
          </div>
          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start justify-center" onSubmit={handleCreate}>
            <label className={labelClass}>
              Author Profile ID
              <input
                name="author_profile_id"
                className={inputClass}
                value={createForm.author_profile_id}
                onChange={handleInput(setCreateForm)}
                placeholder="Optional UUID"
              />
            </label>
            <label className={labelClass}>
              Overall*
              <select
                name="overall"
                className={selectClass}
                value={createForm.overall}
                onChange={handleInput(setCreateForm)}
              >
                {ratings.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            {["usability", "reliability", "performance", "support_experience"].map((name) => (
              <label key={name} className={labelClass}>
                {name.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                <select
                  name={name}
                  className={selectClass}
                  value={createForm[name]}
                  onChange={handleInput(setCreateForm)}
                >
                  <option value="">Not provided</option>
                  {ratings.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            ))}
            <label className={`${labelClass} md:col-span-2`}>
              Headline
              <input
                name="headline"
                className={inputClass}
                value={createForm.headline}
                onChange={handleInput(setCreateForm)}
                placeholder="Optional title"
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Comment
              <textarea
                name="comment"
                className={textareaClass}
                value={createForm.comment}
                onChange={handleInput(setCreateForm)}
                placeholder="How can we improve?"
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Tags (comma separated)
              <input
                name="tags"
                className={inputClass}
                value={createForm.tags}
                onChange={handleInput(setCreateForm)}
                placeholder="crash, onboarding, video"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#f6ae2d] via-[#ff6f91] to-[#c77dff] shadow-lg hover:opacity-90"
                disabled={createState.loading}
              >
                {createState.loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
          <ResultBlock state={createState} />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#d98e73]">Step 02</p>
              <h2 className="text-2xl font-semibold text-[#3e1b3d]">Search App Feedback</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Pinpoint the biggest wins (and pain points).</p>
          </div>
          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start justify-center" onSubmit={handleList}>
            <label className={labelClass}>
              Author Profile ID
              <input
                name="author_profile_id"
                className={inputClass}
                value={listFilters.author_profile_id}
                onChange={handleInput(setListFilters)}
                placeholder="UUID"
              />
            </label>
            <label className={labelClass}>
              Tags
              <input
                name="tags"
                className={inputClass}
                value={listFilters.tags}
                onChange={handleInput(setListFilters)}
                placeholder="ios,android"
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Search headline/comment
              <input
                name="search"
                className={inputClass}
                value={listFilters.search}
                onChange={handleInput(setListFilters)}
                placeholder="Type to run case-insensitive search"
              />
            </label>
            <label className={labelClass}>
              Min Overall
              <input
                type="number"
                min={1}
                max={5}
                name="min_overall"
                className={inputClass}
                value={listFilters.min_overall}
                onChange={handleInput(setListFilters)}
              />
            </label>
            <label className={labelClass}>
              Max Overall
              <input
                type="number"
                min={1}
                max={5}
                name="max_overall"
                className={inputClass}
                value={listFilters.max_overall}
                onChange={handleInput(setListFilters)}
              />
            </label>
            <label className={labelClass}>
              Since (UTC)
              <input
                type="datetime-local"
                name="since"
                className={inputClass}
                value={listFilters.since}
                onChange={handleInput(setListFilters)}
              />
            </label>
            <label className={labelClass}>
              Sort By
              <select
                name="sort"
                className={selectClass}
                value={listFilters.sort}
                onChange={handleInput(setListFilters)}
              >
                <option value="created_at">Created At</option>
                <option value="overall">Overall Rating</option>
              </select>
            </label>
            <label className={labelClass}>
              Order
              <select
                name="order"
                className={selectClass}
                value={listFilters.order}
                onChange={handleInput(setListFilters)}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </label>
            <label className={labelClass}>
              Limit
              <input
                type="number"
                name="limit"
                min={1}
                max={100}
                className={inputClass}
                value={listFilters.limit}
                onChange={handleInput(setListFilters)}
              />
            </label>
            <label className={labelClass}>
              Offset
              <input
                type="number"
                name="offset"
                min={0}
                className={inputClass}
                value={listFilters.offset}
                onChange={handleInput(setListFilters)}
                placeholder="0"
              />
            </label>
            <label className={labelClass}>
              Cursor
              <input
                name="cursor"
                className={inputClass}
                value={listFilters.cursor}
                onChange={handleInput(setListFilters)}
                placeholder="Paste next_cursor token"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-[#3e1b3d] hover:bg-[#4f2750]"
                disabled={listState.loading}
              >
                {listState.loading ? "Searching..." : "Run Query"}
              </button>
            </div>
          </form>
          <ResultBlock state={listState} />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#d98e73]">Step 03</p>
              <h2 className="text-2xl font-semibold text-[#3e1b3d]">App Sentiment Stats</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Pulse checks for leadership decks.</p>
          </div>
          <form className="grid md:grid-cols-3 gap-4 auto-rows-max items-start justify-center" onSubmit={handleStats}>
            <label className={labelClass}>
              Tags
              <input
                name="tags"
                className={inputClass}
                value={statsFilters.tags}
                onChange={handleInput(setStatsFilters)}
                placeholder="Optional tag filter"
              />
            </label>
            <label className={labelClass}>
              Since (UTC)
              <input
                type="datetime-local"
                name="since"
                className={inputClass}
                value={statsFilters.since}
                onChange={handleInput(setStatsFilters)}
              />
            </label>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#ff9a8b] via-[#ff6a88] to-[#ff99ac] hover:opacity-90"
                disabled={statsState.loading}
              >
                {statsState.loading ? "Loading..." : "Fetch Stats"}
              </button>
            </div>
          </form>
          <ResultBlock state={statsState} />
        </section>
      </div>
    </div>
  );
}
