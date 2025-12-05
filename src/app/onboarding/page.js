"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authMe, createPhoto, createProfile, getMyProfile, listPhotos, updateProfile } from "../services/api";

const labelClass =
  "flex flex-col gap-1 text-sm font-semibold text-slate-900 w-full sm:w-[260px] mx-auto";
const inputClass =
  "mt-1 h-10 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full sm:w-[240px]";
const selectClass = `${inputClass} cursor-pointer`;
const textareaClass =
  "mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[90px] w-full sm:w-[320px] mx-auto";
const cardClass =
  "bg-white/90 border border-[#c8d4ff] rounded-3xl shadow-[0_18px_50px_rgba(61,54,122,0.14)] p-6 space-y-5 backdrop-blur";

const steps = ["Basics", "Photos", "Story", "Finish"];

const emptyState = { loading: false, data: null, error: null };

const initialBasics = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  birth_date: "",
  gender: "",
  location: "",
  bio: "",
};

const initialPhoto = { url: "", description: "", is_primary: "true" };

const initialStory = { bio: "", location: "", gender: "" };

function Progress({ current }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">
      {steps.map((step, idx) => {
        const active = idx === current;
        const done = idx < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full grid place-items-center text-xs font-semibold ${
                active
                  ? "bg-indigo-600 text-white"
                  : done
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {idx + 1}
            </span>
            <span className={`${active ? "text-indigo-700" : "text-slate-500"}`}>{step}</span>
            {idx < steps.length - 1 ? <span className="w-10 h-px bg-slate-200" /> : null}
          </div>
        );
      })}
    </div>
  );
}

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

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [basics, setBasics] = useState(initialBasics);
  const [photoForm, setPhotoForm] = useState(initialPhoto);
  const [story, setStory] = useState(initialStory);

  const [profileId, setProfileId] = useState("");
  const [profileState, setProfileState] = useState(emptyState);
  const [photoState, setPhotoState] = useState(emptyState);
  const [photoListState, setPhotoListState] = useState(emptyState);
  const [storyState, setStoryState] = useState(emptyState);
  const [authState, setAuthState] = useState({ checking: true, error: null });

  const router = useRouter();
  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_PROFILE_BASE_URL || process.env.NEXT_PUBLIC_USER_BASE_URL || "http://localhost:8001",
    []
  );

  useEffect(() => {
    const verifyAndLoad = async () => {
      try {
        await authMe();
        setAuthState({ checking: false, error: null });
        await fetchMyProfile();
      } catch (err) {
        setAuthState({ checking: false, error: err.message || "Authentication required." });
        router.replace("/auth/connect");
      }
    };
    verifyAndLoad();
  }, []);

  const fetchMyProfile = async () => {
    setProfileState({ loading: true, data: null, error: null });
    try {
      const data = await getMyProfile();
      setProfileState({ loading: false, data, error: null });
      setBasics((prev) => ({
        ...prev,
        ...data,
      }));
      setStory((prev) => ({
        ...prev,
        bio: data.bio || "",
        location: data.location || "",
        gender: data.gender || "",
      }));
      setProfileId(data.id);
      localStorage.setItem("mockProfileId", data.id);
      setCurrentStep((s) => Math.max(s, 1));
      await refreshPhotos(data.id);
    } catch (err) {
      if (err.message?.toLowerCase().includes("not found")) {
        setProfileState({ loading: false, data: null, error: null });
      } else {
        setProfileState({ loading: false, data: null, error: err.message || "Unable to load profile." });
      }
    }
  };

  const refreshPhotos = async (id) => {
    setPhotoListState({ loading: true, data: null, error: null });
    try {
      const data = await listPhotos({ profile_id: id });
      setPhotoListState({ loading: false, data, error: null });
    } catch (err) {
      setPhotoListState({ loading: false, data: null, error: err.message || "Unable to load photos." });
    }
  };

  const handleBasics = async (event) => {
    event.preventDefault();
    setProfileState({ loading: true, data: null, error: null });
    try {
      const payload = {
        first_name: basics.first_name,
        last_name: basics.last_name,
        email: basics.email,
        phone: basics.phone || null,
        birth_date: basics.birth_date || null,
        gender: basics.gender || null,
        location: basics.location || null,
        bio: basics.bio || null,
      };
      const data = await createProfile(payload);
      setProfileId(data.id);
      localStorage.setItem("mockProfileId", data.id);
      setProfileState({ loading: false, data, error: null });
      setCurrentStep(1);
    } catch (err) {
      setProfileState({ loading: false, data: null, error: err.message || "Unable to create profile." });
      if ((err.message || "").toLowerCase().includes("already exists")) {
        await fetchMyProfile();
      }
    }
  };

  const handlePhoto = async (event) => {
    event.preventDefault();
    if (!profileId) {
      setPhotoState({ loading: false, data: null, error: "Create basics first." });
      return;
    }
    setPhotoState({ loading: true, data: null, error: null });
    try {
      const payload = {
        profile_id: profileId,
        url: photoForm.url,
        is_primary: photoForm.is_primary === "true",
        description: photoForm.description || null,
      };
      const data = await createPhoto(payload);
      setPhotoState({ loading: false, data, error: null });
      await refreshPhotos(profileId);
      setCurrentStep(2);
    } catch (err) {
      setPhotoState({ loading: false, data: null, error: err.message || "Unable to save photo." });
    }
  };

  const handleStory = async (event) => {
    event.preventDefault();
    if (!profileId) {
      setStoryState({ loading: false, data: null, error: "Create basics first." });
      return;
    }
    setStoryState({ loading: true, data: null, error: null });
    try {
      const payload = {
        bio: story.bio || null,
        location: story.location || null,
        gender: story.gender || null,
      };
      const data = await updateProfile(undefined, payload);
      setStoryState({ loading: false, data, error: null });
      setCurrentStep(3);
    } catch (err) {
      setStoryState({ loading: false, data: null, error: err.message || "Unable to update profile." });
    }
  };

  const handleFinish = () => {
    localStorage.setItem("mockAuth", "true");
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f8fbff] to-white py-10 px-4 sm:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="rounded-3xl bg-white/90 border border-[#c8d4ff] shadow-[0_15px_45px_rgba(61,54,122,0.12)] p-6 space-y-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Link href="/" className="underline underline-offset-4 decoration-indigo-400">Home</Link>
            <span>›</span>
            <span className="text-slate-900 font-medium">Onboarding</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-[#202349]">Create your profile</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Four quick steps: basics, a photo, a short story, and you’re in. We’ll remember your profile across the flow.
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
          <Progress current={currentStep} />
        </header>

        {currentStep === 0 && (
          <section className={cardClass}>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 1</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Basics</h2>
              <p className="text-sm text-slate-500">We’ll create your profile record with these details.</p>
            </div>
            <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start" onSubmit={handleBasics}>
              {[
                { label: "First Name*", name: "first_name", placeholder: "Ada" },
                { label: "Last Name*", name: "last_name", placeholder: "Lovelace" },
                { label: "Email*", name: "email", type: "email", placeholder: "ada@example.com" },
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
                    value={basics[name]}
                    onChange={(e) => setBasics((prev) => ({ ...prev, [name]: e.target.value }))}
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
                  value={basics.bio}
                  onChange={(e) => setBasics((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Short intro"
                />
              </label>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#5b8def] via-[#6c7bff] to-[#7f5af0] shadow-lg hover:opacity-90"
                  disabled={profileState.loading}
                >
                  {profileState.loading ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </form>
            <Result state={profileState} />
          </section>
        )}

        {currentStep === 1 && (
          <section className={cardClass}>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 2</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Add a photo</h2>
              <p className="text-sm text-slate-500">Upload one to start; add more later from your profile.</p>
            </div>
            <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start" onSubmit={handlePhoto}>
              <label className={labelClass}>
                Photo URL
                <input
                  name="url"
                  className={inputClass}
                  value={photoForm.url}
                  onChange={(e) => setPhotoForm((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/photo.jpg"
                  required
                />
              </label>
              <label className={labelClass}>
                Is Primary
                <select
                  name="is_primary"
                  className={selectClass}
                  value={photoForm.is_primary}
                  onChange={(e) => setPhotoForm((prev) => ({ ...prev, is_primary: e.target.value }))}
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
                  onChange={(e) => setPhotoForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Caption (optional)"
                />
              </label>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(0)}
                  className="px-6 py-3 rounded-full text-[#202349] font-semibold bg-white border border-[#c8d4ff] hover:bg-indigo-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#6dd3ff] to-[#7f5af0] hover:opacity-90"
                  disabled={photoState.loading}
                >
                  {photoState.loading ? "Uploading..." : "Save & Continue"}
                </button>
              </div>
            </form>
            <Result state={photoState} />
            <Result state={photoListState} />
          </section>
        )}

        {currentStep === 2 && (
          <section className={cardClass}>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 3</p>
              <h2 className="text-2xl font-semibold text-[#202349]">Tell your story</h2>
              <p className="text-sm text-slate-500">Prompts, bio, and where you’re based.</p>
            </div>
            <form className="grid md:grid-cols-2 gap-4 auto-rows-max items-start" onSubmit={handleStory}>
              <label className={`${labelClass} md:col-span-2`}>
                Bio
                <textarea
                  name="bio"
                  className={textareaClass}
                  value={story.bio}
                  onChange={(e) => setStory((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Share a bit about yourself"
                />
              </label>
              <label className={labelClass}>
                Location
                <input
                  name="location"
                  className={inputClass}
                  value={story.location}
                  onChange={(e) => setStory((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </label>
              <label className={labelClass}>
                Gender
                <input
                  name="gender"
                  className={inputClass}
                  value={story.gender}
                  onChange={(e) => setStory((prev) => ({ ...prev, gender: e.target.value }))}
                  placeholder="Your gender"
                />
              </label>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-full text-[#202349] font-semibold bg-white border border-[#c8d4ff] hover:bg-indigo-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#20a4f3] to-[#7f5af0] hover:opacity-90"
                  disabled={storyState.loading}
                >
                  {storyState.loading ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </form>
            <Result state={storyState} />
          </section>
        )}

        {currentStep === 3 && (
          <section className={cardClass}>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Step 4</p>
              <h2 className="text-2xl font-semibold text-[#202349]">All set</h2>
              <p className="text-sm text-slate-500">
                Your profile is ready. Jump to your profile page to review, edit, and browse feedback.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-full text-[#202349] font-semibold bg-white border border-[#c8d4ff] hover:bg-indigo-50"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#f6ae2d] via-[#ff6f91] to-[#c77dff] shadow-lg hover:opacity-90"
              >
                Go to Profile
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
