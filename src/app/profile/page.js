"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authMe,
  listAppFeedback,
  createAppFeedback,
  getMyProfile,
  listPhotos,
  updateProfile,
} from "../services/api";

const inputClass =
  "mt-1 h-10 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-200 w-full";
const textareaClass =
  "mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[80px] w-full";

function computeAge(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function formatDateTime(value) {
  if (!value) return "Unknown date";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Unknown date" : d.toLocaleString();
}

export default function ProfilePage() {
  const router = useRouter();

  const apiBase = useMemo(
    () =>
      process.env.NEXT_PUBLIC_PROFILE_BASE_URL ||
      process.env.NEXT_PUBLIC_USER_BASE_URL ||
      "http://localhost:8001",
    []
  );

  const [authState, setAuthState] = useState({ checking: true, error: null });

  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ location: "", bio: "", gender: "" });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const initialFeedbackForm = useMemo(
    () => ({
      overall: "5",
      headline: "",
      comment: "",
      tags: "",
    }),
    []
  );

  const [feedbackForm, setFeedbackForm] = useState(initialFeedbackForm);
  const [feedbackState, setFeedbackState] = useState({
    submitting: false,
    error: null,
    success: null,
  });
  const [appFeedbackList, setAppFeedbackList] = useState({
    loading: false,
    error: null,
    items: [],
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await authMe();
        setAuthState({ checking: false, error: null });

        const me = await getMyProfile();
        setProfile(me);
        setEditForm({
          location: me.location || "",
          bio: me.bio || "",
          gender: me.gender || "",
        });

        const photoList = await listPhotos({ profile_id: me.id });
        setPhotos(photoList || []);

        if (photoList && photoList.length) {
          const primaryIdx = photoList.findIndex((p) => p.is_primary);
          setActivePhotoIndex(primaryIdx >= 0 ? primaryIdx : 0);
        }
        setLoading(false);
      } catch (err) {
        setAuthState({
          checking: false,
          error: err?.message || "Authentication required.",
        });
        setError(err?.message || "Unable to load profile.");
        setLoading(false);
        router.replace("/auth/connect");
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile?.id) {
      loadAppFeedback(profile.id);
    }
  }, [profile?.id]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        location: editForm.location || null,
        bio: editForm.bio || null,
        gender: editForm.gender || null,
      };

      const updated = await updateProfile(profile.id, payload);
      setProfile(updated);
      setEditForm({
        location: updated.location || "",
        bio: updated.bio || "",
        gender: updated.gender || "",
      });
      setSaving(false);
      setEditing(false);
    } catch (err) {
      setSaving(false);
      setSaveError(err?.message || "Unable to save changes.");
    }
  };

  const handleFeedbackInput = (e) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const loadAppFeedback = async (profileId) => {
    if (!profileId) return;
    setAppFeedbackList((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await listAppFeedback({
        author_profile_id: profileId,
        sort: "created_at",
        order: "desc",
        limit: 20,
      });
      setAppFeedbackList({
        loading: false,
        error: null,
        items: data?.items || data || [],
      });
    } catch (err) {
      setAppFeedbackList({
        loading: false,
        error: err?.message || "Unable to load feedback.",
        items: [],
      });
    }
  };

  const parseTags = (input) => {
    if (!input) return null;
    const tags = input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    return tags.length ? tags : null;
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setFeedbackState({ submitting: true, error: null, success: null });
    try {
      const payload = {
        author_profile_id: profile.id,
        overall: Number(feedbackForm.overall),
        headline: feedbackForm.headline || null,
        comment: feedbackForm.comment || null,
        tags: parseTags(feedbackForm.tags),
      };
      await createAppFeedback(payload);
      setFeedbackState({
        submitting: false,
        error: null,
        success: "Thanks! Feedback saved.",
      });
      setFeedbackForm({ ...initialFeedbackForm });
      loadAppFeedback(profile.id);
    } catch (err) {
      setFeedbackState({
        submitting: false,
        success: null,
        error: err?.message || "Unable to send feedback.",
      });
    }
  };

  const age = computeAge(profile?.birth_date);
  const displayName = profile
    ? `${profile.first_name || "Your name"}${
        profile.last_name ? ` ${profile.last_name.charAt(0).toUpperCase()}.` : ""
      }`
    : "Your name";
  const heroPhoto = photos[activePhotoIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#111827] text-white">
      {/* Top bar */}
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-slate-200 hover:text-white"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 text-lg shadow-lg">
                💘
              </span>
              <span className="font-semibold tracking-tight">Nice 2 Meet U</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="hidden sm:inline">
              API:{" "}
              <code className="bg-black/40 px-2 py-1 rounded-xl text-[10px]">
                {apiBase}
              </code>
            </span>
            {authState.checking ? (
              <span className="text-pink-400">Verifying session…</span>
            ) : authState.error ? (
              <span className="text-red-400">{authState.error}</span>
            ) : (
              <span className="text-emerald-400">Session verified ✔</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-sm text-slate-300">
            Loading your profile…
          </div>
        ) : error || !profile ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
            <p className="text-sm text-red-300">{error || "Profile not found."}</p>
            <Link
              href="/onboarding"
              className="px-5 py-2.5 rounded-full bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100"
            >
              Create your profile
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
              {/* LEFT: Photo + main card */}
              <section className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-[0_28px_80px_rgba(0,0,0,0.75)] border border-white/10">
                  {/* Hero photo */}
                  <div className="relative h-80 sm:h-[420px]">
                    {heroPhoto?.url ? (
                      <Image
                        src={heroPhoto.url}
                        alt="Profile"
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 flex flex-col items-center justify-center gap-2">
                        <span className="text-5xl">📷</span>
                        <p className="text-sm text-slate-200">
                          Add a photo in the photos console to see your full card.
                        </p>
                      </div>
                    )}

                    {/* Name + age overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="space-y-1">
                        <p className="text-2xl font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                          {displayName}
                          {age !== null && (
                            <span className="ml-1 align-middle">{age}</span>
                          )}
                        </p>
                        {profile.location && (
                          <p className="text-xs text-slate-100/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            {profile.location}
                          </p>
                        )}
                      </div>
                      {profile.gender && (
                        <span className="rounded-full bg-black/45 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                          {profile.gender}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Photo thumbnails */}
                  {photos.length > 1 && (
                    <div className="px-4 py-3 bg-black/45 backdrop-blur border-t border-white/5">
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {photos.map((photo, idx) => (
                          <button
                            key={photo.id || `${photo.url}-${idx}`}
                            type="button"
                            onClick={() => setActivePhotoIndex(idx)}
                            className={`relative h-16 w-12 rounded-2xl overflow-hidden border transition ${
                              idx === activePhotoIndex
                                ? "border-pink-400 shadow-[0_0_0_1px_rgba(244,114,182,0.8)]"
                                : "border-white/10 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <Image
                              src={photo.url}
                              alt="Thumbnail"
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="96px"
                            />
                            {photo.is_primary && (
                              <span className="absolute bottom-1 left-1 rounded-full bg-black/60 text-[8px] px-1.5 py-0.5">
                                Main
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* About / prompts */}
                <div className="rounded-3xl bg-white/5 border border-white/10 p-5 sm:p-6 space-y-4 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-pink-300/80">
                        About me
                      </p>
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Get to know {profile.first_name || "me"}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing((prev) => !prev)}
                      className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full border border-white/30 bg-white/5 hover:bg-white/10 font-medium"
                    >
                      {editing ? "Cancel" : "Edit profile"}
                    </button>
                  </div>

                  <p className="text-sm text-slate-100/90 leading-relaxed">
                    {profile.bio ||
                      "Add a short bio to tell people who you are, what you’re into, and what you’re looking for."}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-100/90">
                    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-pink-200">
                        Basics
                      </p>
                      <ul className="space-y-1">
                        {profile.location && (
                          <li>
                            <span className="text-slate-300/80">Location:</span>{" "}
                            {profile.location}
                          </li>
                        )}
                        {age !== null && (
                          <li>
                            <span className="text-slate-300/80">Age:</span> {age}
                          </li>
                        )}
                        {profile.gender && (
                          <li>
                            <span className="text-slate-300/80">Gender:</span>{" "}
                            {profile.gender}
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-pink-200">
                        Private info
                      </p>
                      <ul className="space-y-1">
                        {profile.email && (
                          <li>
                            <span className="text-slate-300/80">Email:</span>{" "}
                            {profile.email}
                          </li>
                        )}
                        {profile.phone && (
                          <li>
                            <span className="text-slate-300/80">Phone:</span>{" "}
                            {profile.phone}
                          </li>
                        )}
                      </ul>
                      <p className="text-[10px] text-slate-400 mt-1">
                        This is only visible to you and used for account and
                        safety features.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* RIGHT: Edit panel / meta */}
              <aside className="space-y-4">
                {/* Edit card */}
                <div className="rounded-3xl bg-white text-slate-900 border border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.7)] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-pink-500">
                        Profile settings
                      </p>
                      <h3 className="text-lg font-semibold">
                        Fine-tune your details
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Changes here update the profile card you just saw.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-1 text-xs sm:text-sm">
                      <label className="font-semibold text-slate-800">
                        Location
                      </label>
                      <input
                        name="location"
                        className={inputClass}
                        value={editForm.location}
                        onChange={handleEditChange}
                        placeholder="City, Country"
                      />
                    </div>

                    <div className="space-y-1 text-xs sm:text-sm">
                      <label className="font-semibold text-slate-800">
                        Gender
                      </label>
                      <input
                        name="gender"
                        className={inputClass}
                        value={editForm.gender}
                        onChange={handleEditChange}
                        placeholder="Woman, Man, Non-binary, etc."
                      />
                    </div>

                    <div className="space-y-1 text-xs sm:text-sm">
                      <label className="font-semibold text-slate-800">
                        Bio / About you
                      </label>
                      <textarea
                        name="bio"
                        className={textareaClass}
                        value={editForm.bio}
                        onChange={handleEditChange}
                        placeholder="What are you into? What are you looking for?"
                      />
                    </div>

                    {saveError && (
                      <p className="text-xs text-red-500">{saveError}</p>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 shadow-lg hover:brightness-110 active:scale-[0.99] transition"
                        disabled={saving}
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Dev/meta info card (optional but nice) */}
                <div className="rounded-3xl bg-white/5 border border-white/10 p-4 sm:p-5 text-xs text-slate-100/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[11px] uppercase tracking-[0.2em] text-pink-200">
                      Profile meta
                    </p>
                    <span className="rounded-full bg-white/5 px-2 py-1 border border-white/10 text-[10px]">
                      ID: {profile.id.slice(0, 8)}…
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    This view pulls from <code>/profiles/me</code> and{" "}
                    <code>/photos</code>. Use the separate profile console to
                    manage advanced fields or extra photos.
                  </p>
                </div>

                <div className="rounded-3xl bg-white border border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.7)] p-5 sm:p-6 space-y-4 text-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-pink-500">
                        App feedback
                      </p>
                      <h3 className="text-lg font-semibold">Tell us how we&apos;re doing</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Uses your profile ID ({profile.id.slice(0, 8)}…) so we can follow up.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="text-xs sm:text-sm font-semibold text-slate-800">
                        Overall rating
                        <select
                          name="overall"
                          className={inputClass}
                          value={feedbackForm.overall}
                          onChange={handleFeedbackInput}
                        >
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs sm:text-sm font-semibold text-slate-800">
                        Tags (comma separated)
                        <input
                          name="tags"
                          className={inputClass}
                          value={feedbackForm.tags}
                          onChange={handleFeedbackInput}
                          placeholder="bugs, ux, idea"
                        />
                      </label>
                    </div>

                    <label className="text-xs sm:text-sm font-semibold text-slate-800 w-full">
                      Headline
                      <input
                        name="headline"
                        className={inputClass}
                        value={feedbackForm.headline}
                        onChange={handleFeedbackInput}
                        placeholder="What went great (or not)?"
                      />
                    </label>

                    <label className="text-xs sm:text-sm font-semibold text-slate-800 w-full">
                      Comment
                      <textarea
                        name="comment"
                        className={textareaClass}
                        value={feedbackForm.comment}
                        onChange={handleFeedbackInput}
                        placeholder="Share details so we can improve."
                      />
                    </label>

                    {feedbackState.error && (
                      <p className="text-xs text-red-500">{feedbackState.error}</p>
                    )}
                    {feedbackState.success && (
                      <p className="text-xs text-emerald-600">{feedbackState.success}</p>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 shadow-lg hover:brightness-110 active:scale-[0.99] transition"
                        disabled={feedbackState.submitting}
                      >
                        {feedbackState.submitting ? "Sending…" : "Send feedback"}
                      </button>
                    </div>
                  </form>
                </div>
              </aside>
            </div>

            <section className="rounded-3xl bg-white/5 border border-white/10 p-5 sm:p-6 space-y-4 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-pink-200">
                    Your app feedback
                  </p>
                  <h3 className="text-lg sm:text-xl font-semibold">
                    Recent submissions ({appFeedbackList.items.length || 0})
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Pulled from the feedback service using your profile ID.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadAppFeedback(profile.id)}
                  className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 font-medium text-white"
                  disabled={appFeedbackList.loading}
                >
                  {appFeedbackList.loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              {appFeedbackList.loading ? (
                <p className="text-sm text-slate-200">Loading your feedback…</p>
              ) : appFeedbackList.error ? (
                <p className="text-sm text-red-300">{appFeedbackList.error}</p>
              ) : !appFeedbackList.items.length ? (
                <p className="text-sm text-slate-200">
                  You haven&apos;t shared app feedback yet. Drop a note above!
                </p>
              ) : (
                <div className="space-y-3">
                  {appFeedbackList.items.map((item) => (
                    <div
                      key={item.id || item.created_at}
                      className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 text-[11px]">
                              ★ {item.overall ?? "—"}
                            </span>
                            <p className="font-semibold text-sm text-white">
                              {item.headline || "No headline"}
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-100/90">
                            {item.comment || "No comment provided."}
                          </p>
                          {item.tags?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-100"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(item.created_at || item.updated_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
