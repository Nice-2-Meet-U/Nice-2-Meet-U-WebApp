"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authMe,
  createAppFeedback,
  createPhoto,
  createProfile,
  getMyProfile,
  getProfile,
  listPhotos,
  updateProfile,
} from "../services/api";

const labelClass =
  "flex flex-col gap-1 text-sm font-semibold text-slate-900 w-full sm:w-[260px] mx-auto";
const inputClass =
  "mt-1 h-10 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full sm:w-[240px]";
const selectClass = `${inputClass} cursor-pointer`;
const textareaClass =
  "mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[90px] w-full sm:w-[320px] mx-auto";
const cardClass =
  "bg-white/90 border border-[#c8d4ff] rounded-3xl shadow-[0_18px_50px_rgba(61,54,122,0.14)] p-6 space-y-5 backdrop-blur";

const initialProfileForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  birth_date: "",
  gender: "",
  location: "",
  bio: "",
};

const initialPhotoForm = { url: "", description: "", is_primary: "true" };

const initialFeedbackForm = {
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

function parseTags(raw) {
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

function normalizeOptional(value, transform = (v) => v) {
  if (value === undefined || value === null || value === "") return undefined;
  return transform(value);
}

function parseBool(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function ProfileWorkspace() {
  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_PROFILE_BASE_URL || process.env.NEXT_PUBLIC_USER_BASE_URL || "http://localhost:8001",
    []
  );
  const router = useRouter();

  const [createForm, setCreateForm] = useState(initialProfileForm);
  const [createState, setCreateState] = useState(emptyState);

  const [currentProfile, setCurrentProfile] = useState(null);
  const [profileIdInput, setProfileIdInput] = useState("");
  const [readState, setReadState] = useState(emptyState);

  const [updateForm, setUpdateForm] = useState(initialProfileForm);
  const [updateState, setUpdateState] = useState(emptyState);

  const [photoForm, setPhotoForm] = useState(initialPhotoForm);
  const [photoState, setPhotoState] = useState(emptyState);
  const [photoListState, setPhotoListState] = useState(emptyState);

  const [feedbackForm, setFeedbackForm] = useState(initialFeedbackForm);
  const [feedbackState, setFeedbackState] = useState(emptyState);
  const [authState, setAuthState] = useState({ checking: true, error: null });

  const onChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await authMe();
        setAuthState({ checking: false, error: null });
      } catch (err) {
        setAuthState({ checking: false, error: err.message || "Authentication required." });
        router.replace("/auth/connect");
      }
    };
    verifyAuth();

    const cachedId = typeof window !== "undefined" ? localStorage.getItem("mockProfileId") : null;
    if (cachedId) {
      setProfileIdInput(cachedId);
      fetchById(cachedId);
    }
  }, []);

  const fillUpdateForm = (profile) => {
    if (!profile) return;
    setUpdateForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      birth_date: profile.birth_date || "",
      gender: profile.gender || "",
      location: profile.location || "",
      bio: profile.bio || "",
    });
    setFeedbackForm((prev) => ({
      ...prev,
      author_profile_id: profile.id || prev.author_profile_id,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateState({ loading: true, data: null, error: null });
    try {
      const payload = {
        first_name: createForm.first_name,
        last_name: createForm.last_name,
        email: createForm.email,
        phone: createForm.phone || null,
        birth_date: createForm.birth_date || null,
        gender: createForm.gender || null,
        location: createForm.location || null,
        bio: createForm.bio || null,
      };
      const data = await createProfile(payload);
      setCreateState({ loading: false, data, error: null });
      setCurrentProfile(data);
      setProfileIdInput(data.id || "");
      fillUpdateForm(data);
    } catch (err) {
      setCreateState({ loading: false, data: null, error: err.message || "Unable to create profile." });
    }
  };

  const fetchById = async (id) => {
    setReadState({ loading: true, data: null, error: null });
    try {
      const data = await getProfile(id);
      setReadState({ loading: false, data, error: null });
      setCurrentProfile(data);
      fillUpdateForm(data);
    } catch (err) {
      setReadState({ loading: false, data: null, error: err.message || "Unable to fetch profile." });
    }
  };

  const handleFetch = async (event) => {
    event.preventDefault();
    if (!profileIdInput) {
      setReadState({ loading: false, data: null, error: "Enter a profile ID." });
      return;
    }
    fetchById(profileIdInput);
  };

  const handleFetchMine = async () => {
    setReadState({ loading: true, data: null, error: null });
    try {
      const data = await getMyProfile();
      setReadState({ loading: false, data, error: null });
      setCurrentProfile(data);
      setProfileIdInput(data.id || "");
      fillUpdateForm(data);
    } catch (err) {
      setReadState({ loading: false, data: null, error: err.message || "Unable to fetch profile." });
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!currentProfile?.id) {
      setUpdateState({ loading: false, data: null, error: "Load or create a profile first." });
      return;
    }
    const payload = {
      first_name: normalizeOptional(updateForm.first_name),
      last_name: normalizeOptional(updateForm.last_name),
      email: normalizeOptional(updateForm.email),
      phone: normalizeOptional(updateForm.phone),
      birth_date: normalizeOptional(updateForm.birth_date),
      gender: normalizeOptional(updateForm.gender),
      location: normalizeOptional(updateForm.location),
      bio: normalizeOptional(updateForm.bio),
    };
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    if (!Object.keys(cleaned).length) {
      setUpdateState({ loading: false, data: null, error: "Change a field before updating." });
      return;
    }
    setUpdateState({ loading: true, data: null, error: null });
    try {
      const data = await updateProfile(currentProfile.id, cleaned);
      setUpdateState({ loading: false, data, error: null });
      setCurrentProfile(data);
    } catch (err) {
      setUpdateState({ loading: false, data: null, error: err.message || "Unable to update profile." });
    }
  };

  const handlePhotoCreate = async (event) => {
    event.preventDefault();
    if (!currentProfile?.id) {
      setPhotoState({ loading: false, data: null, error: "Create or load a profile first." });
      return;
    }
    if (!photoForm.url) {
      setPhotoState({ loading: false, data: null, error: "Photo URL is required." });
      return;
    }
    setPhotoState({ loading: true, data: null, error: null });
    try {
      const payload = {
        profile_id: currentProfile.id,
        url: photoForm.url,
        is_primary: photoForm.is_primary === "true",
        description: photoForm.description || null,
      };
      const data = await createPhoto(payload);
      setPhotoState({ loading: false, data, error: null });
      await handlePhotoList(); // refresh list after upload
    } catch (err) {
      setPhotoState({ loading: false, data: null, error: err.message || "Unable to upload photo." });
    }
  };

  const handlePhotoList = async () => {
    if (!currentProfile?.id) {
      setPhotoListState({ loading: false, data: null, error: "Load a profile to list photos." });
      return;
    }
    setPhotoListState({ loading: true, data: null, error: null });
    try {
      const data = await listPhotos({ profile_id: currentProfile.id });
      setPhotoListState({ loading: false, data, error: null });
    } catch (err) {
      setPhotoListState({ loading: false, data: null, error: err.message || "Unable to list photos." });
    }
  };

  const handleFeedback = async (event) => {
    event.preventDefault();
    if (!feedbackForm.author_profile_id && !currentProfile?.id) {
      setFeedbackState({ loading: false, data: null, error: "Add an author profile ID." });
      return;
    }
    setFeedbackState({ loading: true, data: null, error: null });
    try {
      const payload = {
        author_profile_id: feedbackForm.author_profile_id || currentProfile?.id || null,
        overall: Number(feedbackForm.overall),
        usability: normalizeOptional(feedbackForm.usability, Number) ?? null,
        reliability: normalizeOptional(feedbackForm.reliability, Number) ?? null,
        performance: normalizeOptional(feedbackForm.performance, Number) ?? null,
        support_experience: normalizeOptional(feedbackForm.support_experience, Number) ?? null,
        headline: feedbackForm.headline || null,
        comment: feedbackForm.comment || null,
        tags: parseTags(feedbackForm.tags) || null,
      };
      const data = await createAppFeedback(payload);
      setFeedbackState({ loading: false, data, error: null });
    } catch (err) {
      setFeedbackState({ loading: false, data: null, error: err.message || "Unable to send feedback." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f8fbff] to-white py-10 px-4 sm:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="rounded-3xl bg-white/90 border border-[#c8d4ff] shadow-[0_15px_45px_rgba(61,54,122,0.12)] p-6 space-y-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Link href="/" className="underline underline-offset-4 decoration-indigo-400">Home</Link>
            <span>›</span>
            <span className="text-slate-900 font-medium">Profile</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-[#202349]">Your Dating Profile</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Create your dating persona, pull it back from the user service, tweak fields inline, manage photos, and leave app feedback on the same screen.
          </p>
          <div className="text-xs text-slate-500">
            Profile API base: <code className="bg-indigo-50 text-indigo-800 rounded-xl px-2 py-1">{apiBase}</code>
          </div>
          <div className="text-xs">
            {authState.checking ? (
              <span className="text-indigo-600">Verifying your session…</span>
            ) : authState.error ? (
              <span className="text-red-600">{authState.error}</span>
            ) : (
              <span className="text-emerald-700">Session verified</span>
            )}
          </div>
        </header>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 01</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Create your profile</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Fields map to the FastAPI models.</p>
          </div>
          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start" onSubmit={handleCreate}>
            {[
              { label: "First Name", name: "first_name", placeholder: "Ada" },
              { label: "Last Name", name: "last_name", placeholder: "Lovelace" },
              { label: "Email", name: "email", type: "email", placeholder: "ada@example.com" },
              { label: "Phone", name: "phone", placeholder: "+1-212-555-0199" },
              { label: "Birth Date", name: "birth_date", type: "date" },
              { label: "Gender", name: "gender", placeholder: "female" },
              { label: "Location", name: "location", placeholder: "London, UK" },
            ].map(({ label, name, placeholder, type = "text" }) => (
              <label key={name} className={labelClass}>
                {label}
                <input
                  type={type}
                  name={name}
                  className={inputClass}
                  value={createForm[name]}
                  onChange={onChange(setCreateForm)}
                  placeholder={placeholder}
                  required={name === "first_name" || name === "last_name" || name === "email"}
                />
              </label>
            ))}
            <label className={`${labelClass} md:col-span-2`}>
              Bio
              <textarea
                name="bio"
                className={textareaClass}
                value={createForm.bio}
                onChange={onChange(setCreateForm)}
                placeholder="Short bio for your dating card"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#5b8def] via-[#6c7bff] to-[#7f5af0] shadow-lg hover:opacity-90"
                disabled={createState.loading}
              >
                {createState.loading ? "Creating..." : "Create Profile"}
              </button>
            </div>
          </form>
          <Result state={createState} />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 02</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Load & edit inline</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Fetch by ID, tweak fields, push updates.</p>
          </div>

          <form className="flex flex-col sm:flex-row gap-3 items-start" onSubmit={handleFetch}>
            <label className={labelClass}>
              Profile ID
              <input
                className={inputClass}
                value={profileIdInput}
                onChange={(e) => setProfileIdInput(e.target.value)}
                placeholder="UUID"
              />
            </label>
            <button
              type="submit"
              className="px-5 py-3 rounded-full text-white font-semibold bg-[#202349] hover:bg-[#2b2f5c]"
              disabled={readState.loading}
            >
              {readState.loading ? "Fetching..." : "Fetch Profile"}
            </button>
            <button
              type="button"
              onClick={handleFetchMine}
              className="px-5 py-3 rounded-full text-[#202349] font-semibold bg-white border border-[#c8d4ff] hover:bg-indigo-50"
              disabled={readState.loading}
            >
              {readState.loading ? "Fetching..." : "Fetch My Profile"}
            </button>
          </form>
          <Result state={readState} />

          <div className="grid md:grid-cols-2 gap-4 auto-rows-max">
            {[
              { label: "First Name", name: "first_name" },
              { label: "Last Name", name: "last_name" },
              { label: "Email", name: "email", type: "email" },
              { label: "Phone", name: "phone" },
              { label: "Birth Date", name: "birth_date", type: "date" },
              { label: "Gender", name: "gender" },
              { label: "Location", name: "location" },
            ].map(({ label, name, type = "text" }) => (
              <label key={name} className={labelClass}>
                {label}
                <input
                  type={type}
                  name={name}
                  className={inputClass}
                  value={updateForm[name]}
                  onChange={onChange(setUpdateForm)}
                  placeholder="Leave blank to keep"
                  disabled={!currentProfile}
                />
              </label>
            ))}
          </div>
          <label className={`${labelClass}`}>
            Bio
            <textarea
              name="bio"
              className={textareaClass}
              value={updateForm.bio}
              onChange={onChange(setUpdateForm)}
              placeholder="Leave blank to keep"
              disabled={!currentProfile}
            />
          </label>
          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#20a4f3] to-[#7f5af0] hover:opacity-90"
              disabled={updateState.loading}
            >
              {updateState.loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
          <Result state={updateState} />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 03</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Upload a photo</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Mark a primary hero image or alternate angles.</p>
          </div>
          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start" onSubmit={handlePhotoCreate}>
            <label className={labelClass}>
              Photo URL
              <input
                name="url"
                className={inputClass}
                value={photoForm.url}
                onChange={onChange(setPhotoForm)}
                placeholder="https://example.com/photo.jpg"
                disabled={!currentProfile}
                required
              />
            </label>
            <label className={labelClass}>
              Is Primary
              <select
                name="is_primary"
                className={selectClass}
                value={photoForm.is_primary}
                onChange={onChange(setPhotoForm)}
                disabled={!currentProfile}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Description
              <input
                name="description"
                className={inputClass}
                value={photoForm.description}
                onChange={onChange(setPhotoForm)}
                placeholder="Sunset at the beach"
                disabled={!currentProfile}
              />
            </label>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#6dd3ff] to-[#7f5af0] hover:opacity-90"
                disabled={photoState.loading}
              >
                {photoState.loading ? "Saving..." : "Upload Photo"}
              </button>
              <button
                type="button"
                onClick={handlePhotoList}
                className="px-6 py-3 rounded-full text-[#202349] font-semibold bg-white border border-[#c8d4ff] hover:bg-indigo-50"
              >
                Refresh List
              </button>
            </div>
          </form>
          <Result state={photoState} />
          <Result state={photoListState} />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 04</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Drop app feedback</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Send feedback to the feedback microservice.</p>
          </div>
          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start" onSubmit={handleFeedback}>
            <label className={labelClass}>
              Author Profile ID
              <input
                name="author_profile_id"
                className={inputClass}
                value={feedbackForm.author_profile_id}
                onChange={onChange(setFeedbackForm)}
                placeholder={currentProfile?.id || "UUID (defaults to loaded profile)"}
              />
            </label>
            <label className={labelClass}>
              Overall*
              <select
                name="overall"
                className={selectClass}
                value={feedbackForm.overall}
                onChange={onChange(setFeedbackForm)}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            {["usability", "reliability", "performance", "support_experience"].map((name) => (
              <label key={name} className={labelClass}>
                {name.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                <select
                  name={name}
                  className={selectClass}
                  value={feedbackForm[name]}
                  onChange={onChange(setFeedbackForm)}
                >
                  <option value="">Not provided</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            ))}
            <label className={`${labelClass} md:col-span-2`}>
              Headline
              <input
                name="headline"
                className={inputClass}
                value={feedbackForm.headline}
                onChange={onChange(setFeedbackForm)}
                placeholder="Optional title"
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Comment
              <textarea
                name="comment"
                className={textareaClass}
                value={feedbackForm.comment}
                onChange={onChange(setFeedbackForm)}
                placeholder="Share what feels great or rough."
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Tags (comma separated)
              <input
                name="tags"
                className={inputClass}
                value={feedbackForm.tags}
                onChange={onChange(setFeedbackForm)}
                placeholder="delight, video-chat, onboarding"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#f6ae2d] via-[#ff6f91] to-[#c77dff] shadow-lg hover:opacity-90"
                disabled={feedbackState.loading}
              >
                {feedbackState.loading ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </form>
          <Result state={feedbackState} />
        </section>
      </div>
    </div>
  );
}
