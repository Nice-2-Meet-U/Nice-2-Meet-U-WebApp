"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authMe,
  createPhoto,
  createProfile,
  getMyProfile,
  listPhotos,
  updateProfile,
} from "../services/api";

const labelClass =
  "flex flex-col gap-1 text-xs sm:text-sm font-semibold text-slate-900 w-full";
const inputClass =
  "mt-1 h-10 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-200 w-full";
const selectClass = `${inputClass} cursor-pointer`;
const textareaClass =
  "mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[90px] w-full";
const cardClass =
  "bg-white/95 border border-white/60 rounded-3xl shadow-[0_22px_80px_rgba(0,0,0,0.35)] p-6 sm:p-8 space-y-6 backdrop-blur";

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

const genderOptions = ["Woman", "Man", "Non-binary", "Transgender", "Genderqueer", "Prefer not to say"];
const locationOptions = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Austin, TX",
  "Miami, FL",
  "Seattle, WA",
  "Remote/Other",
];

function Progress({ current }) {
  return (
    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700">
      {steps.map((step, idx) => {
        const active = idx === current;
        const done = idx < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center text-[10px] sm:text-xs font-semibold ${
                active
                  ? "bg-pink-500 text-white"
                  : done
                  ? "bg-pink-100 text-pink-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {idx + 1}
            </span>
            <span
              className={`hidden sm:inline ${
                active ? "text-pink-700" : "text-slate-400"
              }`}
            >
              {step}
            </span>
            {idx < steps.length - 1 ? (
              <span className="w-7 sm:w-10 h-px bg-slate-200" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Result({ state }) {
  if (state.loading) return null;
  if (state.error)
    return (
      <p className="text-[11px] text-red-500 font-medium mt-2">
        {state.error}
      </p>
    );
  return null;
}

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
  const [authState, setAuthState] = useState({
    checking: true,
    error: null,
  });

  const router = useRouter();
  const apiBase = useMemo(
    () =>
      process.env.NEXT_PUBLIC_PROFILE_BASE_URL ||
      process.env.NEXT_PUBLIC_USER_BASE_URL ||
      "http://localhost:8001",
    []
  );

  useEffect(() => {
    const verifyAndLoad = async () => {
      try {
        await authMe();
        setAuthState({ checking: false, error: null });
        await fetchMyProfile();
      } catch (err) {
        setAuthState({
          checking: false,
          error: err?.message || "Authentication required.",
        });
        router.replace("/auth/connect");
      }
    };
    verifyAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (typeof window !== "undefined") {
        localStorage.setItem("mockProfileId", data.id);
      }
      setCurrentStep((s) => Math.max(s, 1));
      await refreshPhotos(data.id);
    } catch (err) {
      const message = err?.message || "";
      if (message.toLowerCase().includes("not found")) {
        setProfileState({ loading: false, data: null, error: null });
      } else {
        setProfileState({
          loading: false,
          data: null,
          error: message || "Unable to load profile.",
        });
      }
    }
  };

  const refreshPhotos = async (id) => {
    setPhotoListState({ loading: true, data: null, error: null });
    try {
      const data = await listPhotos({ profile_id: id });
      setPhotoListState({ loading: false, data, error: null });
    } catch (err) {
      setPhotoListState({
        loading: false,
        data: null,
        error: err?.message || "Unable to load photos.",
      });
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
      if (typeof window !== "undefined") {
        localStorage.setItem("mockProfileId", data.id);
      }
      setProfileState({ loading: false, data, error: null });
      setCurrentStep(1);
    } catch (err) {
      setProfileState({
        loading: false,
        data: null,
        error: err?.message || "Unable to create profile.",
      });
      if ((err?.message || "").toLowerCase().includes("already exists")) {
        await fetchMyProfile();
      }
    }
  };

  const handlePhoto = async (event) => {
    event.preventDefault();
    if (!profileId) {
      setPhotoState({
        loading: false,
        data: null,
        error: "Create basics first.",
      });
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
      setPhotoState({
        loading: false,
        data: null,
        error: err?.message || "Unable to save photo.",
      });
    }
  };

  const handleStory = async (event) => {
    event.preventDefault();
    if (!profileId) {
      setStoryState({
        loading: false,
        data: null,
        error: "Create basics first.",
      });
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
      setStoryState({
        loading: false,
        data: null,
        error: err?.message || "Unable to update profile.",
      });
    }
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mockAuth", "true");
    }
    router.push("/profile");
  };

  const age = computeAge(basics.birth_date);
  const primaryPhotoUrl =
    (photoListState.data && photoListState.data[0]?.url) || photoForm.url || "";

  const displayBio = story.bio || basics.bio || "Add a short intro about you.";
  const displayLocation =
    story.location || basics.location || "Add your city";
  const displayGender = story.gender || basics.gender || "";

  const firstName = basics.first_name || "Your name";
  const lastInitial = basics.last_name
    ? `${basics.last_name.charAt(0).toUpperCase()}.`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#111827] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col gap-8 md:gap-10 md:flex-row md:items-stretch">
        {/* LEFT: Profile phone preview */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-xs sm:max-w-sm">
            {/* Glow */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-pink-500/30 via-rose-400/25 to-amber-300/20 blur-3xl opacity-70" />
            {/* Phone frame */}
            <div className="relative rounded-[2.5rem] bg-[#050816] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Status bar notch */}
              <div className="flex justify-center pt-4 pb-3">
                <div className="h-1.5 w-16 rounded-full bg-white/20" />
              </div>

              {/* Photo */}
              <div className="px-4 pb-4">
                <div className="relative overflow-hidden rounded-3xl h-64 sm:h-72 bg-slate-900">
                  {primaryPhotoUrl ? (
                    <Image
                      src={primaryPhotoUrl}
                      alt="Profile"
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 flex flex-col items-center justify-center gap-2 text-xs text-slate-300">
                      <span className="text-4xl">📷</span>
                      <p className="font-medium">
                        Add your first photo to see your card.
                      </p>
                    </div>
                  )}

                  {/* Name + age over photo bottom */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-xl font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                        {firstName} {lastInitial}
                        {age !== null && <span className="ml-1">{age}</span>}
                      </p>
                      {displayLocation && (
                        <p className="text-xs text-slate-100/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                          {displayLocation}
                        </p>
                      )}
                    </div>
                    {displayGender && (
                      <span className="rounded-full bg-black/40 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                        {displayGender}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content / prompts */}
              <div className="px-4 pb-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-pink-300/80">
                    Prompt
                  </p>
                  <p className="text-xs text-slate-200/90 rounded-2xl bg-white/5 border border-white/10 px-3 py-3 leading-relaxed">
                    {displayBio}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400/90">
                  <span>
                    Swipe preview •{" "}
                    <span className="text-slate-100/90 font-medium">
                      Live as you type
                    </span>
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-1 border border-white/10">
                    {steps[currentStep]} step
                  </span>
                </div>
              </div>
            </div>

            {/* Tiny dev hint */}
            <div className="mt-3 text-[10px] text-slate-400/80 text-center">
              API:{" "}
              <code className="bg-black/40 px-2 py-1 rounded-xl text-[9px]">
                {apiBase}
              </code>
            </div>
          </div>
        </div>

        {/* RIGHT: Create profile flow */}
        <div className="flex-1">
          <div className={cardClass}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.25em] text-pink-500">
                  Nice 2 Meet U
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                  Create your dating profile
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                  We&apos;ll use these details to build the card people see
                  when they match with you. You can edit everything later.
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-2">
                <Progress current={currentStep} />
                <div className="text-[11px] text-slate-500">
                  {authState.checking ? (
                    <span className="text-pink-500">
                      Verifying your session…
                    </span>
                  ) : authState.error ? (
                    <span className="text-red-500">{authState.error}</span>
                  ) : (
                    <span className="text-emerald-600">Session verified ✔</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Progress */}
            <div className="sm:hidden">
              <div className="mt-2 mb-1">
                <Progress current={currentStep} />
              </div>
              <div className="text-[11px] text-slate-500">
                {authState.checking ? (
                  <span className="text-pink-500">
                    Verifying your session…
                  </span>
                ) : authState.error ? (
                  <span className="text-red-500">{authState.error}</span>
                ) : (
                  <span className="text-emerald-600">Session verified ✔</span>
                )}
              </div>
            </div>

            {/* Step content */}
            {currentStep === 0 && (
              <section className="space-y-5">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-pink-500">
                    Step 1 • Your basics
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Your name, age, and city help us build the core of your
                    profile. We&apos;ll never show your email or phone
                    publicly.
                  </p>
                </div>
                <form
                  className="grid md:grid-cols-2 gap-4 auto-rows-max items-start"
                  onSubmit={handleBasics}
                >
                  {[
                    {
                      label: "First name*",
                      name: "first_name",
                      placeholder: "Ada",
                    },
                    {
                      label: "Last name*",
                      name: "last_name",
                      placeholder: "Lovelace",
                    },
                    {
                      label: "Email*",
                      name: "email",
                      type: "email",
                      placeholder: "ada@example.com",
                    },
                    {
                      label: "Phone",
                      name: "phone",
                      placeholder: "+1 212 555 0199",
                    },
                    {
                      label: "Birth date",
                      name: "birth_date",
                      type: "date",
                    },
                    {
                      label: "Gender",
                      name: "gender",
                      type: "select-gender",
                    },
                    {
                      label: "Location",
                      name: "location",
                      type: "select-location",
                    },
                  ].map(({ label, name, placeholder, type = "text" }) => (
                    <label key={name} className={labelClass}>
                      {label}
                      {type === "select-gender" ? (
                        <select
                          name={name}
                          className={selectClass}
                          value={basics[name]}
                          onChange={(e) =>
                            setBasics((prev) => ({
                              ...prev,
                              [name]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select gender</option>
                          {genderOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : type === "select-location" ? (
                        <select
                          name={name}
                          className={selectClass}
                          value={basics[name]}
                          onChange={(e) =>
                            setBasics((prev) => ({
                              ...prev,
                              [name]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select location</option>
                          {locationOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          name={name}
                          className={inputClass}
                          value={basics[name]}
                          onChange={(e) =>
                            setBasics((prev) => ({
                              ...prev,
                              [name]: e.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          required={label.includes("*")}
                        />
                      )}
                    </label>
                  ))}
                  <label className={`${labelClass} md:col-span-2`}>
                    Short intro
                    <textarea
                      name="bio"
                      className={textareaClass}
                      value={basics.bio}
                      onChange={(e) =>
                        setBasics((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      placeholder="Give people a feel for your vibe in a few sentences."
                    />
                  </label>
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 shadow-lg hover:brightness-110 active:scale-[0.99] transition"
                      disabled={profileState.loading}
                    >
                      {profileState.loading
                        ? "Saving..."
                        : "Save & continue to photos"}
                    </button>
                  </div>
                </form>
                <Result state={profileState} />
              </section>
            )}

            {currentStep === 1 && (
              <section className="space-y-5">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-pink-500">
                    Step 2 • Your first photo
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Great photos make all the difference. Add a clear photo of
                    you — no group shots as your first one.
                  </p>
                </div>
                <form
                  className="grid md:grid-cols-2 gap-4 auto-rows-max items-start"
                  onSubmit={handlePhoto}
                >
                  <label className={labelClass}>
                    Photo URL
                    <input
                      name="url"
                      className={inputClass}
                      value={photoForm.url}
                      onChange={(e) =>
                        setPhotoForm((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/photo.jpg"
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Set as main photo
                    <select
                      name="is_primary"
                      className={selectClass}
                      value={photoForm.is_primary}
                      onChange={(e) =>
                        setPhotoForm((prev) => ({
                          ...prev,
                          is_primary: e.target.value,
                        }))
                      }
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </label>
                  <label className={`${labelClass} md:col-span-2`}>
                    Caption (optional)
                    <input
                      name="description"
                      className={inputClass}
                      value={photoForm.description}
                      onChange={(e) =>
                        setPhotoForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Say something fun about this photo."
                    />
                  </label>
                  <div className="md:col-span-2 flex justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(0)}
                      className="px-6 py-3 rounded-full text-slate-700 text-sm font-semibold bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-[0.99] transition"
                    >
                      Back to basics
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 shadow-lg hover:brightness-110 active:scale-[0.99] transition"
                      disabled={photoState.loading}
                    >
                      {photoState.loading
                        ? "Uploading..."
                        : "Save & continue to story"}
                    </button>
                  </div>
                </form>
                <Result state={photoState} />
                <Result state={photoListState} />
              </section>
            )}

            {currentStep === 2 && (
              <section className="space-y-5">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-pink-500">
                    Step 3 • Your story
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    This is where you stand out. Think Hinge/Tinder prompts,
                    but in your own words.
                  </p>
                </div>
                <form
                  className="grid md:grid-cols-2 gap-4 auto-rows-max items-start"
                  onSubmit={handleStory}
                >
                  <label className={`${labelClass} md:col-span-2`}>
                    About you
                    <textarea
                      name="bio"
                      className={textareaClass}
                      value={story.bio}
                      onChange={(e) =>
                        setStory((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      placeholder="What are you into? What are you looking for?"
                    />
                  </label>
                  <label className={labelClass}>
                    Location
                    <input
                      name="location"
                      className={inputClass}
                      value={story.location}
                      onChange={(e) =>
                        setStory((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="City, Country"
                    />
                  </label>
                  <label className={labelClass}>
                    Gender
                    <input
                      name="gender"
                      className={inputClass}
                      value={story.gender}
                      onChange={(e) =>
                        setStory((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      placeholder="Your gender"
                    />
                  </label>
                  <div className="md:col-span-2 flex justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 rounded-full text-slate-700 text-sm font-semibold bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-[0.99] transition"
                    >
                      Back to photos
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 shadow-lg hover:brightness-110 active:scale-[0.99] transition"
                      disabled={storyState.loading}
                    >
                      {storyState.loading
                        ? "Saving..."
                        : "Save & preview profile"}
                    </button>
                  </div>
                </form>
                <Result state={storyState} />
              </section>
            )}

            {currentStep === 3 && (
              <section className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-pink-500">
                    Step 4 • You&apos;re ready
                  </p>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                    Your profile is live-ready
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                    You can always come back to tweak photos, change your bio,
                    or update prompts. For now, you&apos;re ready to start
                    matching.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 rounded-full text-slate-700 text-sm font-semibold bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-[0.99] transition"
                  >
                    Edit story
                  </button>
                  <button
                    onClick={handleFinish}
                    className="px-6 py-3 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 shadow-lg hover:brightness-110 active:scale-[0.99] transition"
                  >
                    Go to my profile
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
