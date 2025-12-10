"use client";

import Link from "next/link";
import { useState } from "react";
import {
  createProfileFeedback,
  listProfileFeedback,
  fetchProfileFeedbackStats,
} from "../../services/api";
import { FEEDBACK_BASE_URL } from "../../services/config";

const ratingOptions = [1, 2, 3, 4, 5];
const badgeClass =
  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-rose-100 text-rose-700";
const cardClass =
  "bg-white border border-rose-100 rounded-3xl shadow-[0px_8px_30px_rgba(32,10,55,0.06)] p-5 space-y-5";
const labelClass =
  "flex flex-col gap-1 text-base font-semibold text-[#2b143c] w-full sm:w-[260px] mx-auto";
const inputClass =
  "mt-1 h-10 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-200 w-full sm:w-[240px]";
const selectClass = `${inputClass} cursor-pointer`;
const textareaClass =
  "mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-200 min-h-[90px] w-full sm:w-[320px] mx-auto";

const initialCreateState = {
  reviewer_profile_id: "",
  reviewee_profile_id: "",
  match_id: "",
  overall_experience: "5",
  would_meet_again: "",
  safety_feeling: "",
  respectfulness: "",
  headline: "",
  comment: "",
  tags: "",
};

const initialListFilters = {
  reviewee_profile_id: "",
  reviewer_profile_id: "",
  match_id: "",
  tags: "",
  search: "",
  min_overall: "",
  max_overall: "",
  since: "",
  sort: "created_at",
  order: "desc",
  limit: "10",
  cursor: "",
};

const initialStatsFilters = {
  reviewee_profile_id: "",
  tags: "",
  since: "",
};

function parseTags(raw) {
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

function parseDate(raw) {
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function renderResult({ loading, error, data }) {
  if (loading) return <p className="text-rose-600 font-medium">Working...</p>;
  if (error)
    return <p className="text-red-600 font-medium">{error}</p>;
  if (!data) return <p className="text-slate-500">Nothing to show yet.</p>;
  return (
    <pre className="mt-3 text-xs sm:text-sm bg-[#161026] text-white/90 p-4 rounded-2xl overflow-auto shadow-inner">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function MatchFeedbackPage() {
  const [createForm, setCreateForm] = useState(initialCreateState);
  const [listFilters, setListFilters] = useState(initialListFilters);
  const [statsFilters, setStatsFilters] = useState(initialStatsFilters);

  const [createState, setCreateState] = useState({ loading: false, data: null, error: null });
  const [listState, setListState] = useState({ loading: false, data: null, error: null });
  const [statsState, setStatsState] = useState({ loading: false, data: null, error: null });

  const handleInput = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!createForm.reviewer_profile_id || !createForm.reviewee_profile_id) {
      setCreateState({ loading: false, data: null, error: "Reviewer and reviewee IDs are required." });
      return;
    }

    setCreateState({ loading: true, data: null, error: null });
    try {
      const payload = {
        reviewer_profile_id: createForm.reviewer_profile_id,
        reviewee_profile_id: createForm.reviewee_profile_id,
        match_id: createForm.match_id || null,
        overall_experience: Number(createForm.overall_experience),
        would_meet_again:
          createForm.would_meet_again === ""
            ? null
            : createForm.would_meet_again === "yes",
        safety_feeling: createForm.safety_feeling ? Number(createForm.safety_feeling) : null,
        respectfulness: createForm.respectfulness ? Number(createForm.respectfulness) : null,
        headline: createForm.headline || null,
        comment: createForm.comment || null,
        tags: parseTags(createForm.tags) || null,
      };

      const data = await createProfileFeedback(payload);
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
        reviewee_profile_id: listFilters.reviewee_profile_id || undefined,
        reviewer_profile_id: listFilters.reviewer_profile_id || undefined,
        match_id: listFilters.match_id || undefined,
        tags: listFilters.tags || undefined,
        search: listFilters.search || undefined,
        min_overall: listFilters.min_overall || undefined,
        max_overall: listFilters.max_overall || undefined,
        since: parseDate(listFilters.since),
        sort: listFilters.sort,
        order: listFilters.order,
        limit: listFilters.limit ? Number(listFilters.limit) : undefined,
        cursor: listFilters.cursor || undefined,
      };

      const data = await listProfileFeedback(query);
      setListState({ loading: false, data, error: null });
    } catch (err) {
      setListState({ loading: false, data: null, error: err.message || "Unable to list feedback." });
    }
  };

  const handleStats = async (event) => {
    event.preventDefault();
    if (!statsFilters.reviewee_profile_id) {
      setStatsState({ loading: false, data: null, error: "Reviewee profile ID is required." });
      return;
    }

    setStatsState({ loading: true, data: null, error: null });
    try {
      const query = {
        reviewee_profile_id: statsFilters.reviewee_profile_id,
        tags: statsFilters.tags || undefined,
        since: parseDate(statsFilters.since),
      };
      const data = await fetchProfileFeedbackStats(query);
      setStatsState({ loading: false, data, error: null });
    } catch (err) {
      setStatsState({ loading: false, data: null, error: err.message || "Unable to load stats." });
    }
  };

  const apiBase = FEEDBACK_BASE_URL;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f0ea] to-[#ece7de] py-10 px-4 sm:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="rounded-3xl bg-white border border-rose-100 shadow-[0_15px_45px_rgba(32,10,55,0.08)] p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Link href="/" className="underline underline-offset-4 decoration-rose-400">Home</Link>
            <span>›</span>
            <span>Feedback</span>
            <span>›</span>
            <span className="text-slate-900 font-medium">Matches</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-[#2b143c]">Match Feedback Studio</span>
            <span className={badgeClass}>Beta</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Curate thoughtful follow-ups just like the Hinge app: capture chemistry highlights, filter for safety signals, and surface vibe-ready stats for your teams.
          </p>
          <div className="text-xs text-slate-500">
            API base: <code className="bg-rose-50 text-rose-700 rounded-xl px-2 py-1">{apiBase}</code>
          </div>
        </header>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-rose-400">Step 01</p>
              <h2 className="text-2xl font-semibold text-[#2b143c]">Create Match Feedback</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Give future matches context with a detailed snapshot.</p>
          </div>
          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start justify-center" onSubmit={handleCreate}>
            <label className={labelClass}>
              Reviewer Profile ID*
              <input
                name="reviewer_profile_id"
                className={inputClass}
                value={createForm.reviewer_profile_id}
                onChange={handleInput(setCreateForm)}
                placeholder="UUID"
                required
              />
            </label>
            <label className={labelClass}>
              Reviewee Profile ID*
              <input
                name="reviewee_profile_id"
                className={inputClass}
                value={createForm.reviewee_profile_id}
                onChange={handleInput(setCreateForm)}
                placeholder="UUID"
                required
              />
            </label>
            <label className={labelClass}>
              Match ID
              <input
                name="match_id"
                className={inputClass}
                value={createForm.match_id}
                onChange={handleInput(setCreateForm)}
                placeholder="UUID"
              />
            </label>
            <label className={labelClass}>
              Overall Experience*
              <select
                name="overall_experience"
                className={selectClass}
                value={createForm.overall_experience}
                onChange={handleInput(setCreateForm)}
              >
                {ratingOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Would Meet Again
              <select
                name="would_meet_again"
                className={selectClass}
                value={createForm.would_meet_again}
                onChange={handleInput(setCreateForm)}
              >
                <option value="">Not provided</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label className={labelClass}>
              Safety Feeling
              <select
                name="safety_feeling"
                className={selectClass}
                value={createForm.safety_feeling}
                onChange={handleInput(setCreateForm)}
              >
                <option value="">Not provided</option>
                {ratingOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Respectfulness
              <select
                name="respectfulness"
                className={selectClass}
                value={createForm.respectfulness}
                onChange={handleInput(setCreateForm)}
              >
                <option value="">Not provided</option>
                {ratingOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
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
                placeholder="Add detail for future matches"
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Tags (comma separated)
              <input
                name="tags"
                className={inputClass}
                value={createForm.tags}
                onChange={handleInput(setCreateForm)}
                placeholder="fun, punctual, foodie"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#ff6f91] via-[#f7aef8] to-[#b983ff] shadow-lg hover:opacity-90"
                disabled={createState.loading}
              >
                {createState.loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
          {renderResult(createState)}
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-rose-400">Step 02</p>
              <h2 className="text-2xl font-semibold text-[#2b143c]">Search Feedback</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Stack filters to recreate Hinge-style moderation workflows.</p>
          </div>
          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start justify-center" onSubmit={handleList}>
            {[
              { label: "Reviewee Profile ID", name: "reviewee_profile_id", placeholder: "UUID" },
              { label: "Reviewer Profile ID", name: "reviewer_profile_id", placeholder: "UUID" },
            { label: "Match ID", name: "match_id", placeholder: "UUID" },
            { label: "Tags", name: "tags", placeholder: "thoughtful,fun" },
            { label: "Search headline/comment", name: "search", placeholder: "case-insensitive search" },
            { label: "Min Overall", name: "min_overall", type: "number", min: 1, max: 5 },
            { label: "Max Overall", name: "max_overall", type: "number", min: 1, max: 5 },
            ].map(({ label, name, placeholder, type = "text", min, max }) => (
              <label key={name} className={labelClass}>
                {label}
                <input
                  type={type}
                  name={name}
                  min={min}
                  max={max}
                  className={inputClass}
                  value={listFilters[name]}
                  onChange={handleInput(setListFilters)}
                  placeholder={placeholder}
                />
              </label>
            ))}
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
                <option value="overall_experience">Overall Experience</option>
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
                className="px-6 py-3 rounded-full text-white font-semibold bg-[#2b143c] hover:bg-[#3a1c4f]"
                disabled={listState.loading}
              >
                {listState.loading ? "Searching..." : "Run Query"}
              </button>
            </div>
          </form>
          {renderResult(listState)}
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-rose-400">Step 03</p>
              <h2 className="text-2xl font-semibold text-[#2b143c]">Reviewee Stats</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Summaries for trust & safety or matchmaking squads.</p>
          </div>
          <form className="grid md:grid-cols-3 gap-4 auto-rows-max items-start justify-center" onSubmit={handleStats}>
            <label className={`${labelClass} md:col-span-2`}>
              Reviewee Profile ID*
              <input
                name="reviewee_profile_id"
                className={inputClass}
                value={statsFilters.reviewee_profile_id}
                onChange={handleInput(setStatsFilters)}
                placeholder="UUID"
                required
              />
            </label>
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
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#ffb347] to-[#ff6f91] hover:opacity-90"
                disabled={statsState.loading}
              >
                {statsState.loading ? "Loading..." : "Fetch Stats"}
              </button>
            </div>
          </form>
          {renderResult(statsState)}
        </section>
      </div>
    </div>
  );
}
