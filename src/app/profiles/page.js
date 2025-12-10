"use client";

import Link from "next/link";
import { useState } from "react";
import {
  createPhoto,
  createProfile,
  createVisibility,
  deletePhoto,
  deleteProfile,
  getPhoto,
  getProfile,
  getVisibilityByProfile,
  listPhotos,
  listProfiles,
  updatePhoto,
  updateProfile,
  updateVisibility,
} from "../services/api";
import { PROFILE_BASE_URL } from "../services/config";

const cardClass =
  "bg-white/90 border border-[#c8d4ff] rounded-3xl shadow-[0_18px_50px_rgba(61,54,122,0.14)] p-6 space-y-5 backdrop-blur";
const labelClass =
  "flex flex-col gap-1 text-sm font-semibold text-slate-900 w-full sm:w-[260px] mx-auto";
const inputClass =
  "mt-1 h-10 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full sm:w-[240px]";
const selectClass = `${inputClass} cursor-pointer`;
const textareaClass =
  "mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[90px] w-full sm:w-[320px] mx-auto";

const emptyState = { loading: false, data: null, error: null };

const initialProfileCreate = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  birth_date: "",
  gender: "",
  location: "",
  bio: "",
};

const initialProfileUpdate = {
  profile_id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  birth_date: "",
  gender: "",
  location: "",
  bio: "",
};

const initialProfileList = {
  first_name: "",
  last_name: "",
  email: "",
  location: "",
  gender: "",
  limit: "10",
  cursor: "",
};

const initialPhotoCreate = {
  profile_id: "",
  url: "",
  is_primary: "true",
  description: "",
};

const initialPhotoUpdate = {
  photo_id: "",
  url: "",
  is_primary: "",
  description: "",
};

const initialPhotoFilters = {
  profile_id: "",
  is_primary: "",
  limit: "10",
};

const initialVisibilityCreate = {
  profile_id: "",
  is_visible: "true",
  visibility_scope: "normal",
};

const initialVisibilityUpdate = {
  visibility_id: "",
  is_visible: "",
  visibility_scope: "",
};

const badge = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] bg-indigo-50 text-indigo-700";

function ResultPanel({ state }) {
  if (state.loading) return <p className="text-indigo-600 font-medium">Working...</p>;
  if (state.error) return <p className="text-red-600 font-medium">{state.error}</p>;
  if (!state.data) return <p className="text-slate-500">Nothing yet. Run an action above.</p>;
  return (
    <pre className="mt-3 text-xs sm:text-sm bg-[#0f172a] text-white/90 p-4 rounded-2xl overflow-auto shadow-inner">
      {JSON.stringify(state.data, null, 2)}
    </pre>
  );
}

function normalizeOptional(value, transform = (val) => val) {
  if (value === undefined || value === null || value === "") return undefined;
  return transform(value);
}

function parseBool(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function ProfilesPage() {
  const apiBase = PROFILE_BASE_URL;

  const [profileCreate, setProfileCreate] = useState(initialProfileCreate);
  const [profileCreateState, setProfileCreateState] = useState(emptyState);

  const [profileUpdate, setProfileUpdate] = useState(initialProfileUpdate);
  const [profileReadId, setProfileReadId] = useState("");
  const [profileDeleteId, setProfileDeleteId] = useState("");
  const [profileReadState, setProfileReadState] = useState(emptyState);
  const [profileUpdateState, setProfileUpdateState] = useState(emptyState);
  const [profileDeleteState, setProfileDeleteState] = useState(emptyState);

  const [profileListFilters, setProfileListFilters] = useState(initialProfileList);
  const [profileListState, setProfileListState] = useState(emptyState);

  const [photoCreate, setPhotoCreate] = useState(initialPhotoCreate);
  const [photoCreateState, setPhotoCreateState] = useState(emptyState);
  const [photoUpdate, setPhotoUpdate] = useState(initialPhotoUpdate);
  const [photoGetId, setPhotoGetId] = useState("");
  const [photoGetState, setPhotoGetState] = useState(emptyState);
  const [photoUpdateState, setPhotoUpdateState] = useState(emptyState);
  const [photoDeleteState, setPhotoDeleteState] = useState(emptyState);
  const [photoFilters, setPhotoFilters] = useState(initialPhotoFilters);
  const [photoListState, setPhotoListState] = useState(emptyState);

  const [visibilityCreate, setVisibilityCreate] = useState(initialVisibilityCreate);
  const [visibilityUpdate, setVisibilityUpdate] = useState(initialVisibilityUpdate);
  const [visibilityLookupProfile, setVisibilityLookupProfile] = useState("");
  const [visibilityCreateState, setVisibilityCreateState] = useState(emptyState);
  const [visibilityGetState, setVisibilityGetState] = useState(emptyState);
  const [visibilityUpdateState, setVisibilityUpdateState] = useState(emptyState);

  const onChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileCreate = async (event) => {
    event.preventDefault();
    if (!profileCreate.first_name || !profileCreate.last_name || !profileCreate.email) {
      setProfileCreateState({ loading: false, data: null, error: "First name, last name, and email are required." });
      return;
    }
    setProfileCreateState({ loading: true, data: null, error: null });
    try {
      const payload = {
        first_name: profileCreate.first_name,
        last_name: profileCreate.last_name,
        email: profileCreate.email,
        phone: profileCreate.phone || null,
        birth_date: profileCreate.birth_date || null,
        gender: profileCreate.gender || null,
        location: profileCreate.location || null,
        bio: profileCreate.bio || null,
      };
      const data = await createProfile(payload);
      setProfileCreateState({ loading: false, data, error: null });
    } catch (err) {
      setProfileCreateState({ loading: false, data: null, error: err.message || "Unable to create profile." });
    }
  };

  const handleProfileRead = async (event) => {
    event.preventDefault();
    if (!profileReadId) {
      setProfileReadState({ loading: false, data: null, error: "Profile ID is required." });
      return;
    }
    setProfileReadState({ loading: true, data: null, error: null });
    try {
      const data = await getProfile(profileReadId);
      setProfileReadState({ loading: false, data, error: null });
    } catch (err) {
      setProfileReadState({ loading: false, data: null, error: err.message || "Unable to fetch profile." });
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    if (!profileUpdate.profile_id) {
      setProfileUpdateState({ loading: false, data: null, error: "Profile ID is required." });
      return;
    }
    const payload = {
      first_name: normalizeOptional(profileUpdate.first_name),
      last_name: normalizeOptional(profileUpdate.last_name),
      email: normalizeOptional(profileUpdate.email),
      phone: normalizeOptional(profileUpdate.phone),
      birth_date: normalizeOptional(profileUpdate.birth_date),
      gender: normalizeOptional(profileUpdate.gender),
      location: normalizeOptional(profileUpdate.location),
      bio: normalizeOptional(profileUpdate.bio),
    };
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    if (!Object.keys(cleaned).length) {
      setProfileUpdateState({ loading: false, data: null, error: "Add at least one field to update." });
      return;
    }
    setProfileUpdateState({ loading: true, data: null, error: null });
    try {
      const data = await updateProfile(profileUpdate.profile_id, cleaned);
      setProfileUpdateState({ loading: false, data, error: null });
    } catch (err) {
      setProfileUpdateState({ loading: false, data: null, error: err.message || "Unable to update profile." });
    }
  };

  const handleProfileDelete = async (event) => {
    event.preventDefault();
    if (!profileDeleteId) {
      setProfileDeleteState({ loading: false, data: null, error: "Profile ID is required." });
      return;
    }
    setProfileDeleteState({ loading: true, data: null, error: null });
    try {
      const data = await deleteProfile(profileDeleteId);
      setProfileDeleteState({ loading: false, data, error: null });
    } catch (err) {
      setProfileDeleteState({ loading: false, data: null, error: err.message || "Unable to delete profile." });
    }
  };

  const handleProfileList = async (event) => {
    event.preventDefault();
    setProfileListState({ loading: true, data: null, error: null });
    try {
      const query = {
        first_name: normalizeOptional(profileListFilters.first_name),
        last_name: normalizeOptional(profileListFilters.last_name),
        email: normalizeOptional(profileListFilters.email),
        location: normalizeOptional(profileListFilters.location),
        gender: normalizeOptional(profileListFilters.gender),
        limit: normalizeOptional(profileListFilters.limit, (val) => Number(val)),
        cursor: normalizeOptional(profileListFilters.cursor),
      };
      const data = await listProfiles(query);
      setProfileListState({ loading: false, data, error: null });
    } catch (err) {
      setProfileListState({ loading: false, data: null, error: err.message || "Unable to list profiles." });
    }
  };

  const handlePhotoCreate = async (event) => {
    event.preventDefault();
    if (!photoCreate.profile_id || !photoCreate.url) {
      setPhotoCreateState({ loading: false, data: null, error: "Profile ID and photo URL are required." });
      return;
    }
    setPhotoCreateState({ loading: true, data: null, error: null });
    try {
      const payload = {
        profile_id: photoCreate.profile_id,
        url: photoCreate.url,
        is_primary: photoCreate.is_primary === "true",
        description: photoCreate.description || null,
      };
      const data = await createPhoto(payload);
      setPhotoCreateState({ loading: false, data, error: null });
    } catch (err) {
      setPhotoCreateState({ loading: false, data: null, error: err.message || "Unable to upload photo." });
    }
  };

  const handlePhotoRead = async (event) => {
    event.preventDefault();
    if (!photoGetId) {
      setPhotoGetState({ loading: false, data: null, error: "Photo ID is required." });
      return;
    }
    setPhotoGetState({ loading: true, data: null, error: null });
    try {
      const data = await getPhoto(photoGetId);
      setPhotoGetState({ loading: false, data, error: null });
    } catch (err) {
      setPhotoGetState({ loading: false, data: null, error: err.message || "Unable to fetch photo." });
    }
  };

  const handlePhotoUpdate = async (event) => {
    event.preventDefault();
    if (!photoUpdate.photo_id) {
      setPhotoUpdateState({ loading: false, data: null, error: "Photo ID is required." });
      return;
    }
    const payload = {
      url: normalizeOptional(photoUpdate.url),
      is_primary: normalizeOptional(photoUpdate.is_primary, parseBool),
      description: normalizeOptional(photoUpdate.description),
    };
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    if (!Object.keys(cleaned).length) {
      setPhotoUpdateState({ loading: false, data: null, error: "Add at least one field to update." });
      return;
    }
    setPhotoUpdateState({ loading: true, data: null, error: null });
    try {
      const data = await updatePhoto(photoUpdate.photo_id, cleaned);
      setPhotoUpdateState({ loading: false, data, error: null });
    } catch (err) {
      setPhotoUpdateState({ loading: false, data: null, error: err.message || "Unable to update photo." });
    }
  };

  const handlePhotoDelete = async (event) => {
    event.preventDefault();
    if (!photoUpdate.photo_id) {
      setPhotoDeleteState({ loading: false, data: null, error: "Photo ID is required to delete." });
      return;
    }
    setPhotoDeleteState({ loading: true, data: null, error: null });
    try {
      const data = await deletePhoto(photoUpdate.photo_id);
      setPhotoDeleteState({ loading: false, data, error: null });
    } catch (err) {
      setPhotoDeleteState({ loading: false, data: null, error: err.message || "Unable to delete photo." });
    }
  };

  const handlePhotoList = async (event) => {
    event.preventDefault();
    setPhotoListState({ loading: true, data: null, error: null });
    try {
      const query = {
        profile_id: normalizeOptional(photoFilters.profile_id),
        is_primary: normalizeOptional(photoFilters.is_primary, parseBool),
        limit: normalizeOptional(photoFilters.limit, (val) => Number(val)),
      };
      const data = await listPhotos(query);
      setPhotoListState({ loading: false, data, error: null });
    } catch (err) {
      setPhotoListState({ loading: false, data: null, error: err.message || "Unable to list photos." });
    }
  };

  const handleVisibilityCreate = async (event) => {
    event.preventDefault();
    if (!visibilityCreate.profile_id) {
      setVisibilityCreateState({ loading: false, data: null, error: "Profile ID is required." });
      return;
    }
    setVisibilityCreateState({ loading: true, data: null, error: null });
    try {
      const payload = {
        profile_id: visibilityCreate.profile_id,
        is_visible: visibilityCreate.is_visible === "true",
        visibility_scope: visibilityCreate.visibility_scope || null,
      };
      const data = await createVisibility(payload);
      setVisibilityCreateState({ loading: false, data, error: null });
    } catch (err) {
      setVisibilityCreateState({ loading: false, data: null, error: err.message || "Unable to create visibility." });
    }
  };

  const handleVisibilityGet = async (event) => {
    event.preventDefault();
    if (!visibilityLookupProfile) {
      setVisibilityGetState({ loading: false, data: null, error: "Profile ID is required." });
      return;
    }
    setVisibilityGetState({ loading: true, data: null, error: null });
    try {
      const data = await getVisibilityByProfile(visibilityLookupProfile);
      setVisibilityGetState({ loading: false, data, error: null });
    } catch (err) {
      setVisibilityGetState({ loading: false, data: null, error: err.message || "Unable to fetch visibility." });
    }
  };

  const handleVisibilityUpdate = async (event) => {
    event.preventDefault();
    if (!visibilityUpdate.visibility_id) {
      setVisibilityUpdateState({ loading: false, data: null, error: "Visibility ID is required." });
      return;
    }
    const payload = {
      is_visible: normalizeOptional(visibilityUpdate.is_visible, parseBool),
      visibility_scope: normalizeOptional(visibilityUpdate.visibility_scope),
    };
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    if (!Object.keys(cleaned).length) {
      setVisibilityUpdateState({ loading: false, data: null, error: "Add at least one field to update." });
      return;
    }
    setVisibilityUpdateState({ loading: true, data: null, error: null });
    try {
      const data = await updateVisibility(visibilityUpdate.visibility_id, cleaned);
      setVisibilityUpdateState({ loading: false, data, error: null });
    } catch (err) {
      setVisibilityUpdateState({ loading: false, data: null, error: err.message || "Unable to update visibility." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f8fbff] to-white py-10 px-4 sm:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="rounded-3xl bg-white/90 border border-[#c8d4ff] shadow-[0_15px_45px_rgba(61,54,122,0.12)] p-6 space-y-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Link href="/" className="underline underline-offset-4 decoration-indigo-400">Home</Link>
            <span>›</span>
            <span className="text-slate-900 font-medium">Profiles</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-[#202349]">User Profile Studio</span>
            <span className={badge}>New</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Exercise the user microservice in one place: ship profile creation, manage gallery photos, and toggle visibility flags without leaving your browser.
          </p>
          <div className="text-xs text-slate-500">
            API base: <code className="bg-indigo-50 text-indigo-800 rounded-xl px-2 py-1">{apiBase}</code>
          </div>
        </header>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 01</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Create a Profile</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Mirror the payload of your FastAPI models.</p>
          </div>
          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start justify-center" onSubmit={handleProfileCreate}>
            {[
              { label: "First Name*", name: "first_name", placeholder: "Ada" },
              { label: "Last Name*", name: "last_name", placeholder: "Lovelace" },
              { label: "Email*", name: "email", placeholder: "ada@example.com", type: "email" },
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
                  value={profileCreate[name]}
                  onChange={onChange(setProfileCreate)}
                  placeholder={placeholder}
                  required={label.includes("*")}
                />
              </label>
            ))}
            <label className={`${labelClass} md:col-span-2`}>
              Bio
              <textarea
                name="bio"
                className={textareaClass}
                value={profileCreate.bio}
                onChange={onChange(setProfileCreate)}
                placeholder="Short biography or description."
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#5b8def] via-[#6c7bff] to-[#7f5af0] shadow-lg hover:opacity-90"
                disabled={profileCreateState.loading}
              >
                {profileCreateState.loading ? "Creating..." : "Create Profile"}
              </button>
            </div>
          </form>
          <ResultPanel state={profileCreateState} />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 02</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Read, Update, Delete</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Probe individual records quickly.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 auto-rows-max">
            <form className="space-y-3" onSubmit={handleProfileRead}>
              <label className={labelClass}>
                Profile ID
                <input
                  className={inputClass}
                  value={profileReadId}
                  onChange={(e) => setProfileReadId(e.target.value)}
                  placeholder="UUID"
                />
              </label>
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-white font-semibold bg-[#202349] hover:bg-[#2b2f5c]"
                disabled={profileReadState.loading}
              >
                {profileReadState.loading ? "Fetching..." : "Fetch Profile"}
              </button>
              <ResultPanel state={profileReadState} />
            </form>

            <form className="space-y-3" onSubmit={handleProfileDelete}>
              <label className={labelClass}>
                Profile ID
                <input
                  className={inputClass}
                  value={profileDeleteId}
                  onChange={(e) => setProfileDeleteId(e.target.value)}
                  placeholder="UUID"
                />
              </label>
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-white font-semibold bg-rose-500 hover:bg-rose-600"
                disabled={profileDeleteState.loading}
              >
                {profileDeleteState.loading ? "Deleting..." : "Delete Profile"}
              </button>
              <ResultPanel state={profileDeleteState} />
            </form>
          </div>

          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start" onSubmit={handleProfileUpdate}>
            <label className={labelClass}>
              Profile ID*
              <input
                name="profile_id"
                className={inputClass}
                value={profileUpdate.profile_id}
                onChange={onChange(setProfileUpdate)}
                placeholder="UUID"
                required
              />
            </label>
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
                  value={profileUpdate[name]}
                  onChange={onChange(setProfileUpdate)}
                  placeholder="Optional"
                />
              </label>
            ))}
            <label className={`${labelClass} md:col-span-2`}>
              Bio
              <textarea
                name="bio"
                className={textareaClass}
                value={profileUpdate.bio}
                onChange={onChange(setProfileUpdate)}
                placeholder="Only send if you change it."
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#20a4f3] to-[#7f5af0] hover:opacity-90"
                disabled={profileUpdateState.loading}
              >
                {profileUpdateState.loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
          <ResultPanel state={profileUpdateState} />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 03</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Search Profiles</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Quick filters for QA or support.</p>
          </div>
          <form className="grid md:grid-cols-3 gap-4 auto-rows-max items-start" onSubmit={handleProfileList}>
            {[
              { label: "First Name", name: "first_name", placeholder: "Grace" },
              { label: "Last Name", name: "last_name", placeholder: "Hopper" },
              { label: "Email", name: "email", placeholder: "grace@example.com", type: "email" },
              { label: "Location", name: "location", placeholder: "NYC" },
              { label: "Gender", name: "gender", placeholder: "female" },
              { label: "Limit", name: "limit", type: "number", min: 1, max: 100 },
              { label: "Cursor", name: "cursor", placeholder: "next_cursor token" },
            ].map(({ label, name, placeholder, type = "text", min, max }) => (
              <label key={name} className={labelClass}>
                {label}
                <input
                  type={type}
                  name={name}
                  min={min}
                  max={max}
                  className={inputClass}
                  value={profileListFilters[name]}
                  onChange={onChange(setProfileListFilters)}
                  placeholder={placeholder}
                />
              </label>
            ))}
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-[#202349] hover:bg-[#2b2f5c]"
                disabled={profileListState.loading}
              >
                {profileListState.loading ? "Searching..." : "Run Query"}
              </button>
            </div>
          </form>
          <ResultPanel state={profileListState} />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 04</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Manage Photos</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Set the hero image or upload alternates.</p>
          </div>

          <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start" onSubmit={handlePhotoCreate}>
            <label className={labelClass}>
              Profile ID*
              <input
                name="profile_id"
                className={inputClass}
                value={photoCreate.profile_id}
                onChange={onChange(setPhotoCreate)}
                placeholder="UUID"
                required
              />
            </label>
            <label className={labelClass}>
              Photo URL*
              <input
                name="url"
                className={inputClass}
                value={photoCreate.url}
                onChange={onChange(setPhotoCreate)}
                placeholder="https://example.com/photo.jpg"
                required
              />
            </label>
            <label className={labelClass}>
              Is Primary
              <select
                name="is_primary"
                className={selectClass}
                value={photoCreate.is_primary}
                onChange={onChange(setPhotoCreate)}
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
                value={photoCreate.description}
                onChange={onChange(setPhotoCreate)}
                placeholder="Optional caption"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#6dd3ff] to-[#7f5af0] hover:opacity-90"
                disabled={photoCreateState.loading}
              >
                {photoCreateState.loading ? "Saving..." : "Create Photo"}
              </button>
            </div>
          </form>
          <ResultPanel state={photoCreateState} />

          <div className="grid md:grid-cols-2 gap-4 auto-rows-max">
            <form className="space-y-3" onSubmit={handlePhotoRead}>
              <label className={labelClass}>
                Photo ID
                <input
                  className={inputClass}
                  value={photoGetId}
                  onChange={(e) => setPhotoGetId(e.target.value)}
                  placeholder="UUID"
                />
              </label>
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-white font-semibold bg-[#202349] hover:bg-[#2b2f5c]"
                disabled={photoGetState.loading}
              >
                {photoGetState.loading ? "Fetching..." : "Fetch Photo"}
              </button>
              <ResultPanel state={photoGetState} />
            </form>

            <form className="space-y-3" onSubmit={handlePhotoUpdate}>
              <label className={labelClass}>
                Photo ID*
                <input
                  name="photo_id"
                  className={inputClass}
                  value={photoUpdate.photo_id}
                  onChange={onChange(setPhotoUpdate)}
                  placeholder="UUID"
                  required
                />
              </label>
              <label className={labelClass}>
                URL
                <input
                  name="url"
                  className={inputClass}
                  value={photoUpdate.url}
                  onChange={onChange(setPhotoUpdate)}
                  placeholder="New URL"
                />
              </label>
              <label className={labelClass}>
                Is Primary
                <select
                  name="is_primary"
                  className={selectClass}
                  value={photoUpdate.is_primary}
                  onChange={onChange(setPhotoUpdate)}
                >
                  <option value="">No change</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </label>
              <label className={labelClass}>
                Description
                <input
                  name="description"
                  className={inputClass}
                  value={photoUpdate.description}
                  onChange={onChange(setPhotoUpdate)}
                  placeholder="Updated caption"
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-white font-semibold bg-[#20a4f3] hover:bg-[#1a8ed1]"
                  disabled={photoUpdateState.loading}
                >
                  {photoUpdateState.loading ? "Updating..." : "Update Photo"}
                </button>
                <button
                  type="button"
                  onClick={handlePhotoDelete}
                  className="px-4 py-2 rounded-full text-white font-semibold bg-rose-500 hover:bg-rose-600"
                  disabled={photoDeleteState.loading}
                >
                  {photoDeleteState.loading ? "Deleting..." : "Delete Photo"}
                </button>
              </div>
              <ResultPanel state={photoUpdateState} />
              {photoDeleteState.data || photoDeleteState.error ? <ResultPanel state={photoDeleteState} /> : null}
            </form>
          </div>

          <form className="grid md:grid-cols-3 gap-4 auto-rows-max items-start" onSubmit={handlePhotoList}>
            <label className={labelClass}>
              Profile ID
              <input
                name="profile_id"
                className={inputClass}
                value={photoFilters.profile_id}
                onChange={onChange(setPhotoFilters)}
                placeholder="UUID"
              />
            </label>
            <label className={labelClass}>
              Is Primary
              <select
                name="is_primary"
                className={selectClass}
                value={photoFilters.is_primary}
                onChange={onChange(setPhotoFilters)}
              >
                <option value="">Any</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </label>
            <label className={labelClass}>
              Limit
              <input
                type="number"
                min={1}
                max={100}
                name="limit"
                className={inputClass}
                value={photoFilters.limit}
                onChange={onChange(setPhotoFilters)}
              />
            </label>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-[#202349] hover:bg-[#2b2f5c]"
                disabled={photoListState.loading}
              >
                {photoListState.loading ? "Searching..." : "List Photos"}
              </button>
            </div>
          </form>
          <ResultPanel state={photoListState} />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 05</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Visibility Toggles</h2>
            </div>
            <p className="text-sm text-slate-500 sm:ml-auto">Simulate the hide/unhide controls in the microservice.</p>
          </div>
          <form className="grid md:grid-cols-3 gap-4 auto-rows-max items-start" onSubmit={handleVisibilityCreate}>
            <label className={labelClass}>
              Profile ID*
              <input
                name="profile_id"
                className={inputClass}
                value={visibilityCreate.profile_id}
                onChange={onChange(setVisibilityCreate)}
                placeholder="UUID"
                required
              />
            </label>
            <label className={labelClass}>
              Is Visible
              <select
                name="is_visible"
                className={selectClass}
                value={visibilityCreate.is_visible}
                onChange={onChange(setVisibilityCreate)}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </label>
            <label className={labelClass}>
              Scope
              <input
                name="visibility_scope"
                className={inputClass}
                value={visibilityCreate.visibility_scope}
                onChange={onChange(setVisibilityCreate)}
                placeholder="close | normal | wide"
              />
            </label>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#6dd3ff] to-[#20a4f3] hover:opacity-90"
                disabled={visibilityCreateState.loading}
              >
                {visibilityCreateState.loading ? "Saving..." : "Create Visibility"}
              </button>
            </div>
          </form>
          <ResultPanel state={visibilityCreateState} />

          <div className="grid md:grid-cols-2 gap-4 auto-rows-max">
            <form className="space-y-3" onSubmit={handleVisibilityGet}>
              <label className={labelClass}>
                Profile ID
                <input
                  className={inputClass}
                  value={visibilityLookupProfile}
                  onChange={(e) => setVisibilityLookupProfile(e.target.value)}
                  placeholder="UUID"
                />
              </label>
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-white font-semibold bg-[#202349] hover:bg-[#2b2f5c]"
                disabled={visibilityGetState.loading}
              >
                {visibilityGetState.loading ? "Fetching..." : "Fetch Visibility"}
              </button>
              <ResultPanel state={visibilityGetState} />
            </form>

            <form className="space-y-3" onSubmit={handleVisibilityUpdate}>
              <label className={labelClass}>
                Visibility ID*
                <input
                  name="visibility_id"
                  className={inputClass}
                  value={visibilityUpdate.visibility_id}
                  onChange={onChange(setVisibilityUpdate)}
                  placeholder="UUID"
                  required
                />
              </label>
              <label className={labelClass}>
                Is Visible
                <select
                  name="is_visible"
                  className={selectClass}
                  value={visibilityUpdate.is_visible}
                  onChange={onChange(setVisibilityUpdate)}
                >
                  <option value="">No change</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </label>
              <label className={labelClass}>
                Scope
                <input
                  name="visibility_scope"
                  className={inputClass}
                  value={visibilityUpdate.visibility_scope}
                  onChange={onChange(setVisibilityUpdate)}
                  placeholder="close | normal | wide"
                />
              </label>
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-white font-semibold bg-[#20a4f3] hover:bg-[#1a8ed1]"
                disabled={visibilityUpdateState.loading}
              >
                {visibilityUpdateState.loading ? "Updating..." : "Update Visibility"}
              </button>
              <ResultPanel state={visibilityUpdateState} />
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
