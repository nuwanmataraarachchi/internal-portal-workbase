"use client";

import { useEffect, useMemo, useState } from "react";

function pad(value) {
  return String(value).padStart(2, "0");
}

function defaultForm() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    id: null,
    title: "",
    body: "",
    startDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    endDate: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
    endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
    audienceType: "all",
    audienceIds: [],
    isActive: true,
  };
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatSchedule(announcement) {
  if (!announcement.scheduledStart || !announcement.scheduledEnd) return "No schedule set";
  return `${formatDateTime(announcement.scheduledStart)} - ${formatDateTime(announcement.scheduledEnd)}`;
}

function formFromAnnouncement(announcement) {
  const fallback = defaultForm();
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    startDate: announcement.startDate || fallback.startDate,
    startTime: announcement.startTime || fallback.startTime,
    endDate: announcement.endDate || fallback.endDate,
    endTime: announcement.endTime || fallback.endTime,
    audienceType: announcement.audienceType || "all",
    audienceIds: announcement.audienceIds || [],
    isActive: announcement.isActive,
  };
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="m16 16 4 4" />
    </svg>
  );
}

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [audiences, setAudiences] = useState({ users: [], teams: [] });
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(form.id);

  useEffect(() => {
    async function loadAnnouncements() {
      setPageError("");
      try {
        const [announcementResponse, audienceResponse] = await Promise.all([fetch("/api/announcements"), fetch("/api/audiences")]);
        const result = await announcementResponse.json();
        const audienceResult = await audienceResponse.json();
        if (!announcementResponse.ok) throw new Error(result.message || "Unable to load announcements.");
        if (!audienceResponse.ok) throw new Error(audienceResult.message || "Unable to load audiences.");
        setAnnouncements(result.announcements);
        setAudiences(audienceResult);
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "Unable to load announcements.");
      }
    }

    loadAnnouncements();
  }, []);

  const authors = useMemo(() => [...new Set(announcements.map((announcement) => announcement.authorName))], [announcements]);
  const filteredAnnouncements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = announcements.filter((announcement) => {
      const matchesSearch = !normalizedSearch || [announcement.title, announcement.body, announcement.authorName, announcement.audience || ""].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesAuthor = authorFilter === "all" || announcement.authorName === authorFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? announcement.isActive : !announcement.isActive);
      return matchesSearch && matchesAuthor && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.scheduledStart || a.createdAt).getTime();
      const dateB = new Date(b.scheduledStart || b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [announcements, search, authorFilter, statusFilter, sortOrder]);

  function openCreateModal() {
    setForm(defaultForm());
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(announcement) {
    setForm(formFromAnnouncement(announcement));
    setFormError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm(defaultForm());
    setFormError("");
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  function toggleRecipient(id) {
    setForm((current) => ({
      ...current,
      audienceIds: current.audienceIds.includes(id) ? current.audienceIds.filter((item) => item !== id) : [...current.audienceIds, id],
    }));
  }

  async function saveAnnouncement(event) {
    event.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/announcements", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setFormError(result.message || "Unable to save announcement.");
        return;
      }
      setAnnouncements((current) => isEditing ? current.map((announcement) => announcement.id === result.announcement.id ? result.announcement : announcement) : [result.announcement, ...current]);
      closeModal();
    } catch {
      setFormError("Unable to save announcement. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleAnnouncementStatus(announcement) {
    const payload = { ...formFromAnnouncement(announcement), isActive: !announcement.isActive };
    const response = await fetch("/api/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setPageError(result.message || "Unable to update announcement.");
      return;
    }
    setAnnouncements((current) => current.map((item) => item.id === result.announcement.id ? result.announcement : item));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <section>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">All Announcements</h2>
                <p className="text-xs text-slate-500">{announcements.length} {announcements.length === 1 ? "announcement" : "announcements"}</p>
              </div>
              <button type="button" onClick={openCreateModal} className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">New Announcement</button>
            </div>

            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-[1fr_160px_150px_140px]">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-3 text-slate-400"><SearchIcon /></span>
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search announcements..." className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5" />
              </div>
              <select value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none"><option value="all">All authors</option>{authors.map((author) => <option key={author} value={author}>{author}</option>)}</select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
            </div>
          </div>

          {pageError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

          <div className="mt-6 space-y-4">
            {filteredAnnouncements.length > 0 ? filteredAnnouncements.map((announcement) => (
              <article key={announcement.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{announcement.audience || "All Workbase"}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${announcement.isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{announcement.isActive ? "Active" : "Inactive"}</span></div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">{announcement.title}</h3>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{announcement.body}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400"><span className="font-medium text-slate-600">{announcement.authorName}</span><span aria-hidden="true">·</span><span>{formatSchedule(announcement)}</span></div>
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => openEditModal(announcement)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</button><button type="button" onClick={() => toggleAnnouncementStatus(announcement)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">{announcement.isActive ? "Deactivate" : "Activate"}</button></div>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><h3 className="text-sm font-semibold text-slate-900">No announcements found</h3><p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p></div>
            )}
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="announcement-form-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h2 id="announcement-form-title" className="text-lg font-semibold text-slate-900">{isEditing ? "Edit Announcement" : "Create Announcement"}</h2><p className="mt-1 text-sm text-slate-500">Set the audience and calendar schedule.</p></div><button type="button" onClick={closeModal} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">×</button></div>
              <form onSubmit={saveAnnouncement}>
                <div className="space-y-5 px-6 py-6">
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Title</span><input type="text" value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Enter announcement title" autoFocus className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Message</span><textarea value={form.body} onChange={(event) => updateForm("body", event.target.value)} placeholder="Write your announcement..." rows={5} className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label><span className="mb-2 block text-sm font-medium text-slate-700">Start date</span><input type="date" value={form.startDate} onChange={(event) => updateForm("startDate", event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></label>
                    <label><span className="mb-2 block text-sm font-medium text-slate-700">Start time</span><input type="time" value={form.startTime} onChange={(event) => updateForm("startTime", event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></label>
                    <label><span className="mb-2 block text-sm font-medium text-slate-700">End date</span><input type="date" value={form.endDate} onChange={(event) => updateForm("endDate", event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></label>
                    <label><span className="mb-2 block text-sm font-medium text-slate-700">End time</span><input type="time" value={form.endTime} onChange={(event) => updateForm("endTime", event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></label>
                  </div>

                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Status</span><select value={form.isActive ? "active" : "inactive"} onChange={(event) => updateForm("isActive", event.target.value === "active")} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>

                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-slate-700">Share with</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ value: "all", label: "Everyone" }, { value: "team", label: "Teams" }, { value: "individual", label: "Individuals" }].map((option) => <label key={option.value} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${form.audienceType === option.value ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><input type="radio" name="audience-type" value={option.value} checked={form.audienceType === option.value} onChange={() => setForm((current) => ({ ...current, audienceType: option.value, audienceIds: [] }))} className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />{option.label}</label>)}
                    </div>
                    {form.audienceType !== "all" && <div className="mt-3 max-h-36 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">{audiences[form.audienceType === "team" ? "teams" : "users"].length ? audiences[form.audienceType === "team" ? "teams" : "users"].map((recipient) => <label key={recipient.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.audienceIds.includes(recipient.id)} onChange={() => toggleRecipient(recipient.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600" /><span>{recipient.name}</span>{recipient.designation && <span className="text-xs text-slate-400">{recipient.designation}</span>}</label>) : <p className="text-sm text-slate-500">No {form.audienceType === "team" ? "teams" : "users"} available yet.</p>}</div>}
                  </fieldset>

                  {formError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{formError}</p>}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end"><button type="button" onClick={closeModal} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</button><button disabled={isSaving} type="submit" className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">{isSaving ? "Saving..." : isEditing ? "Save changes" : "Publish Announcement"}</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
