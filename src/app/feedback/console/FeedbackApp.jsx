"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createAppFeedback,
  createProfileFeedback,
  deleteAppFeedback,
  deleteProfileFeedback,
  fetchAppFeedbackStats,
  fetchProfileFeedbackStats,
  listAppFeedback,
  listProfileFeedback,
  updateAppFeedback,
  updateProfileFeedback,
} from "../../services/api";

const relativeTimeFromNow = (dateString) => {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

const truncateId = (id) => {
  if (!id) return "";
  return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
};

const RatingStars = ({ value = 0, size = "text-base" }) => (
  <div className={`flex items-center gap-1 ${size}`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={
          star <= Math.round(value)
            ? "text-yellow-400"
            : "text-slate-300 dark:text-slate-600"
        }
      >
        ★
      </span>
    ))}
  </div>
);

const TagChips = ({ tags = [] }) => {
  if (!tags.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
};

const Toast = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-4 inset-x-0 flex justify-center z-50 px-4">
      <div className="bg-slate-900 text-white text-sm px-4 py-3 rounded-full shadow-lg">
        {message}
      </div>
      <button className="sr-only" onClick={onClose}>
        Close toast
      </button>
    </div>
  );
};

const TabBar = ({ active, onChange }) => {
  const tabs = [
    { key: "app", label: "App Feedback" },
    { key: "profile", label: "Profile Feedback" },
  ];
  return (
    <div className="grid grid-cols-2 bg-white rounded-full p-1 shadow-inner text-sm font-medium">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`py-2 rounded-full transition ${
            active === tab.key
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const SummaryBar = ({ loading, title, stats, facets, subtitle }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-4 shadow animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-slate-200 rounded" />
          <div className="h-6 w-16 bg-slate-200 rounded" />
          <div className="h-6 w-16 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-3xl p-4 shadow space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center justify-between">
        <RatingStars value={stats.avg} />
        <p className="text-sm text-slate-600">
          {stats.avg?.toFixed(1) || "–"} / 5 · {stats.count} responses
        </p>
      </div>
      {facets?.length ? (
        <div className="flex flex-wrap gap-2">
          {facets.map(({ label, value }) => (
            <span
              key={label}
              className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600"
            >
              {label}: {value ?? "–"}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const FeedbackCard = ({ item, type = "app", onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const tags = item?.tags || [];
  const comment = item?.comment || "";
  const displayComment =
    comment.length > 220 && !expanded ? `${comment.slice(0, 220)}…` : comment;

  const rating = type === "app" ? item?.overall : item?.overall_experience;

  const meta =
    type === "app"
      ? relativeTimeFromNow(item?.created_at)
      : `${truncateId(item?.reviewer_profile_id)} → ${truncateId(
          item?.reviewee_profile_id
        )}`;

  const headline =
    item?.headline || (type === "app" ? "App Feedback" : "Profile Feedback");

  return (
    <div className="bg-white rounded-2xl p-4 shadow space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-400">{meta}</p>
          <h3 className="text-base font-semibold text-slate-900">{headline}</h3>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => onEdit?.(item)}
            className="text-slate-400 hover:text-slate-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete?.(item)}
            className="text-rose-500 hover:text-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
      <RatingStars value={rating} size="text-sm" />
      {comment ? (
        <p className="text-sm text-slate-600 leading-relaxed">
          {displayComment}
          {comment.length > 220 && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="ml-2 text-slate-900 font-semibold"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </p>
      ) : null}
      <TagChips tags={tags} />
    </div>
  );
};

const FeedbackFormModal = ({
  open,
  onClose,
  onSubmit,
  type = "app",
  initialValues,
}) => {
  const [form, setForm] = useState(
    initialValues ||
      (type === "app"
        ? { overall: 5, headline: "", comment: "", tags: "" }
        : {
            reviewer_profile_id: "",
            reviewee_profile_id: "",
            match_id: "",
            overall_experience: 5,
            would_meet_again: false,
            safety_feeling: "",
            respectfulness: "",
            headline: "",
            comment: "",
            tags: "",
          })
  );

  useEffect(() => {
    setForm(
      initialValues ||
        (type === "app"
          ? { overall: 5, headline: "", comment: "", tags: "" }
          : {
              reviewer_profile_id: "",
              reviewee_profile_id: "",
              match_id: "",
              overall_experience: 5,
              would_meet_again: false,
              safety_feeling: "",
              respectfulness: "",
              headline: "",
              comment: "",
              tags: "",
            })
    );
  }, [initialValues, type, open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const ratings = [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40">
      <div className="bg-white rounded-t-3xl p-4 space-y-4 max-h-[90vh] overflow-y-auto transition transform translate-y-0">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {initialValues ? "Edit feedback" : "New feedback"}
          </h2>
          <button onClick={onClose} className="text-slate-500">
            Close
          </button>
        </div>

        {type === "app" ? (
          <>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Rating</p>
              <div className="flex gap-2">
                {ratings.map((score) => (
                  <button
                    key={score}
                    onClick={() => handleChange("overall", score)}
                    className={`flex-1 py-2 rounded-xl border ${
                      form.overall === score
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Headline
              <input
                className="h-10 rounded-xl border border-slate-200 px-3"
                value={form.headline || ""}
                onChange={(e) => handleChange("headline", e.target.value)}
                placeholder="Optional title"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Comment*
              <textarea
                className="rounded-xl border border-slate-200 px-3 py-2 min-h-[100px]"
                value={form.comment || ""}
                onChange={(e) => handleChange("comment", e.target.value)}
                placeholder="Share your thoughts"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Tags
              <input
                className="h-10 rounded-xl border border-slate-200 px-3"
                value={form.tags || ""}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="performance, ui, crash"
              />
            </label>
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Reviewer Profile ID
              <input
                className="h-10 rounded-xl border border-slate-200 px-3"
                value={form.reviewer_profile_id || ""}
                onChange={(e) =>
                  handleChange("reviewer_profile_id", e.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Reviewee Profile ID
              <input
                className="h-10 rounded-xl border border-slate-200 px-3"
                value={form.reviewee_profile_id || ""}
                onChange={(e) =>
                  handleChange("reviewee_profile_id", e.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Match ID
              <input
                className="h-10 rounded-xl border border-slate-200 px-3"
                value={form.match_id || ""}
                onChange={(e) => handleChange("match_id", e.target.value)}
              />
            </label>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Overall Experience
              </p>
              <div className="flex gap-2">
                {ratings.map((score) => (
                  <button
                    key={score}
                    onClick={() => handleChange("overall_experience", score)}
                    className={`flex-1 py-2 rounded-xl border ${
                      form.overall_experience === score
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={!!form.would_meet_again}
                onChange={(e) => handleChange("would_meet_again", e.target.checked)}
              />
              Would meet again
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["safety_feeling", "respectfulness"].map((field) => (
                <label key={field} className="flex flex-col gap-1 text-sm text-slate-600">
                  {field.replace("_", " ")}
                  <select
                    className="h-10 rounded-xl border border-slate-200 px-3"
                    value={form[field] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                  >
                    <option value="">–</option>
                    {ratings.map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Headline
              <input
                className="h-10 rounded-xl border border-slate-200 px-3"
                value={form.headline || ""}
                onChange={(e) => handleChange("headline", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Comment
              <textarea
                className="rounded-xl border border-slate-200 px-3 py-2 min-h-[100px]"
                value={form.comment || ""}
                onChange={(e) => handleChange("comment", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Tags
              <input
                className="h-10 rounded-xl border border-slate-200 px-3"
                value={form.tags || ""}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="thoughtful, foodie"
              />
            </label>
          </>
        )}
        <button
          onClick={() => onSubmit(form)}
          className="w-full py-3 rounded-2xl bg-slate-900 text-white font-semibold"
        >
          {initialValues ? "Save changes" : "Submit"}
        </button>
      </div>
    </div>
  );
};

const AppFeedbackView = ({ showToast }) => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [minRatingFilter, setMinRatingFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showLocalToast = (msg) => {
    setToastMessage(msg);
    showToast?.(msg);
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await fetchAppFeedbackStats();
      setStats({
        count: data?.count_total || 0,
        avg: data?.avg_overall || 0,
        facets: data?.facet_averages || {},
      });
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchList = async ({ reset = false, cursor } = {}) => {
    try {
      if (reset) {
        setListLoading(true);
        setItems([]);
        setNextCursor(null);
      }
      const query = {
        limit: 20,
        order: "desc",
        sort: "created_at",
        cursor: cursor || undefined,
        tags: tagFilter.trim() || undefined,
        min_overall: minRatingFilter ? Number(minRatingFilter) : undefined,
        search: searchQuery.trim() || undefined,
      };
      const data = await listAppFeedback(query);
      if (reset) {
        setItems(data?.items || []);
      } else {
        setItems((prev) => [...prev, ...(data?.items || [])]);
      }
      setNextCursor(data?.next_cursor || null);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchList({ reset: true });
  }, [minRatingFilter, tagFilter]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const text = `${item?.headline || ""} ${item?.comment || ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [items, searchQuery]);

  const handleSubmit = async (form) => {
    try {
      if (!form.comment || (form.overall ?? 0) < 1) {
        throw new Error("Rating and comment are required.");
      }
      const payload = {
        overall: Number(form.overall),
        usability: null,
        reliability: null,
        performance: null,
        support_experience: null,
        headline: form.headline || null,
        comment: form.comment,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : null,
      };

      if (editingItem) {
        const data = await updateAppFeedback(editingItem.id, payload);
        setItems((prev) => prev.map((item) => (item.id === data.id ? data : item)));
        showLocalToast("Feedback updated.");
      } else {
        const data = await createAppFeedback(payload);
        setItems((prev) => [data, ...prev]);
        showLocalToast("Thanks for your feedback!");
      }
      setModalOpen(false);
      setEditingItem(null);
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
    };

    const handleDelete = async (item) => {
      if (!window.confirm("Delete this feedback?")) return;
      try {
        await deleteAppFeedback(item.id);
        setItems((prev) => prev.filter((entry) => entry.id !== item.id));
        fetchStats();
        showLocalToast("Feedback removed");
      } catch (err) {
        alert(err.message);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <SummaryBar
        loading={statsLoading}
        title="App sentiment"
        subtitle="Live pulse of the product"
        stats={{ count: stats?.count || 0, avg: stats?.avg || 0 }}
        facets={
          stats
            ? Object.entries(stats.facets || {}).map(([key, val]) => ({
                label: key.replace("_", " "),
                value: val ? Number(val).toFixed(1) : "–",
              }))
            : []
        }
      />

      <div className="bg-white rounded-3xl p-4 shadow space-y-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-500">Minimum rating</label>
          <select
            className="h-10 rounded-2xl border border-slate-200 px-3 text-sm"
            value={minRatingFilter}
            onChange={(e) => setMinRatingFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5 only</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-500">Search text</label>
          <input
            className="h-10 rounded-2xl border border-slate-200 px-3 text-sm"
            placeholder="headline or comment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-500">Tags filter</label>
          <input
            className="h-10 rounded-2xl border border-slate-200 px-3 text-sm"
            placeholder="ios, android"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {listLoading && !items.length ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 shadow animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-full" />
            </div>
          ))
        ) : filteredItems.length ? (
          filteredItems.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              type="app"
              onEdit={(entry) => {
                setEditingItem(entry);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center text-sm text-slate-500">
            No app feedback yet. Be the first to leave a review.
          </div>
        )}
      </div>

      {nextCursor && (
        <button
          onClick={() => fetchList({ cursor: nextCursor })}
          className="w-full py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold"
        >
          Load more
        </button>
      )}

      <button
        onClick={() => {
          setEditingItem(null);
          setModalOpen(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-slate-900 text-white text-3xl flex items-center justify-center shadow-2xl"
      >
        +
      </button>

      <FeedbackFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        type="app"
        initialValues={
          editingItem
            ? {
                overall: editingItem.overall,
                headline: editingItem.headline || "",
                comment: editingItem.comment || "",
                tags: (editingItem.tags || []).join(", "),
              }
            : null
        }
      />
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </div>
  );
};

const ProfileFeedbackView = ({ showToast }) => {
  const [revieweeId, setRevieweeId] = useState("");
  const [since, setSince] = useState("");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadProfileData = async () => {
    if (!revieweeId) {
      alert("Reviewee profile ID is required.");
      return;
    }
    try {
      setLoadingStats(true);
      setListLoading(true);
      const statsRes = await fetchProfileFeedbackStats({
        reviewee_profile_id: revieweeId,
        since: since ? new Date(since).toISOString() : undefined,
      });
      setStats(statsRes);

      const listRes = await listProfileFeedback({
        reviewee_profile_id: revieweeId,
        limit: 20,
        since: since ? new Date(since).toISOString() : undefined,
      });
      setItems(listRes?.items || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingStats(false);
      setListLoading(false);
    }
  };

  const handleSubmit = async (form) => {
    try {
      if (!form.reviewer_profile_id || !form.reviewee_profile_id) {
        throw new Error("Reviewer and reviewee IDs are required.");
      }
      const payload = {
        reviewer_profile_id: form.reviewer_profile_id,
        reviewee_profile_id: form.reviewee_profile_id,
        match_id: form.match_id || null,
        overall_experience: Number(form.overall_experience || 0),
        would_meet_again:
          typeof form.would_meet_again === "boolean" ? form.would_meet_again : null,
        safety_feeling: form.safety_feeling ? Number(form.safety_feeling) : null,
        respectfulness: form.respectfulness ? Number(form.respectfulness) : null,
        headline: form.headline || null,
        comment: form.comment || null,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : null,
      };

      if (editingItem) {
        const data = await updateProfileFeedback(editingItem.id, payload);
        setItems((prev) => prev.map((entry) => (entry.id === data.id ? data : entry)));
        showToast?.("Profile feedback updated.");
      } else {
        const data = await createProfileFeedback(payload);
        setItems((prev) => [data, ...prev]);
        showToast?.("Profile feedback added.");
      }
      setModalOpen(false);
      setEditingItem(null);
      loadProfileData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await deleteProfileFeedback(item.id);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      showToast?.("Profile feedback deleted.");
      loadProfileData();
    } catch (err) {
      alert(err.message);
    }
  };

  const ratingDistribution =
    stats?.distribution_overall_experience || stats?.distribution_overall || {};

  return (
    <div className="space-y-4 pb-16">
      <div className="bg-white rounded-3xl p-4 shadow space-y-3">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Reviewee profile ID
          <input
            className="h-10 rounded-2xl border border-slate-200 px-3 text-sm"
            value={revieweeId}
            onChange={(e) => setRevieweeId(e.target.value)}
            placeholder="uuid"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Since
          <input
            type="date"
            className="h-10 rounded-2xl border border-slate-200 px-3 text-sm"
            value={since}
            onChange={(e) => setSince(e.target.value)}
          />
        </label>
        <button
          onClick={loadProfileData}
          className="w-full py-3 rounded-2xl bg-slate-900 text-white font-semibold"
        >
          Load feedback
        </button>
      </div>

      {stats ? (
        <SummaryBar
          loading={loadingStats}
          title="Profile sentiment"
          subtitle="Per-user trust & vibe"
          stats={{
            count: stats?.count_total || 0,
            avg: stats?.avg_overall_experience || 0,
          }}
          facets={[
            {
              label: "Safety",
              value: stats?.facet_averages?.safety_feeling
                ? Number(stats?.facet_averages?.safety_feeling).toFixed(1)
                : "–",
            },
            {
              label: "Respect",
              value: stats?.facet_averages?.respectfulness
                ? Number(stats?.facet_averages?.respectfulness).toFixed(1)
                : "–",
            },
          ]}
        />
      ) : null}

      {stats ? (
        <div className="bg-white rounded-3xl p-4 shadow space-y-3">
          <p className="text-sm font-semibold text-slate-700">Overall distribution</p>
          <div className="space-y-2 text-sm text-slate-600">
            {[1, 2, 3, 4, 5].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="w-6">{rating}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((ratingDistribution?.[rating] || 0) /
                          (stats?.count_total || 1)) *
                          100
                      ).toFixed(0)}%`,
                    }}
                  />
                </div>
                <span className="w-10 text-right">{ratingDistribution?.[rating] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {listLoading && !items.length ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 shadow animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-full" />
            </div>
          ))
        ) : items.length ? (
          items.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              type="profile"
              onEdit={(entry) => {
                setEditingItem(entry);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center text-sm text-slate-500">
            No profile feedback yet. Load a user to see reviews.
          </div>
        )}
      </div>

      <button
        onClick={() => {
          setEditingItem(null);
          setModalOpen(true);
        }}
        className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold"
      >
        Add profile feedback
      </button>

      <FeedbackFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        type="profile"
        initialValues={
          editingItem
            ? {
                reviewer_profile_id: editingItem.reviewer_profile_id || "",
                reviewee_profile_id: editingItem.reviewee_profile_id || "",
                match_id: editingItem.match_id || "",
                overall_experience: editingItem.overall_experience || 5,
                would_meet_again: editingItem.would_meet_again || false,
                safety_feeling: editingItem.safety_feeling || "",
                respectfulness: editingItem.respectfulness || "",
                headline: editingItem.headline || "",
                comment: editingItem.comment || "",
                tags: (editingItem.tags || []).join(", "),
              }
            : null
        }
      />
    </div>
  );
};

const FeedbackApp = () => {
  const [activeTab, setActiveTab] = useState("app");
  const [toastMessage, setToastMessage] = useState("");

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <header className="sticky top-0 bg-slate-50 z-30 py-4 space-y-2">
          <p className="text-sm font-semibold text-slate-900">Feedback Console</p>
          <p className="text-xs text-slate-500">Backed by the FastAPI feedback microservice</p>
          <TabBar active={activeTab} onChange={setActiveTab} />
        </header>

        {activeTab === "app" ? (
          <AppFeedbackView showToast={setToastMessage} />
        ) : (
          <ProfileFeedbackView showToast={setToastMessage} />
        )}
      </div>
    </div>
  );
};

export default FeedbackApp;
