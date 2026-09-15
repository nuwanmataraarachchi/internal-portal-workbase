"use client";

import { useMemo, useState } from "react";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function AnnouncementList({ initialAnnouncements, authorName }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const visibleAnnouncements = useMemo(() => {
    const filtered = announcements.filter((announcement) => authorFilter === "all" || announcement.authorName === authorName);
    return filtered.sort((first, second) => sortOrder === "newest" ? new Date(second.createdAt) - new Date(first.createdAt) : new Date(first.createdAt) - new Date(second.createdAt));
  }, [announcements, authorFilter, sortOrder, authorName]);

  async function publishAnnouncement(event) {
    event.preventDefault();
    setError("");
    setIsPublishing(true);

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Unable to publish announcement.");
        return;
      }

      setAnnouncements((current) => [result.announcement, ...current]);
      setTitle("");
      setBody("");
      setIsComposerOpen(false);
    } catch {
      setError("Unable to publish announcement. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <section aria-labelledby="announcement-feed-heading" className="max-w-4xl">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 id="announcement-feed-heading" className="text-lg font-semibold text-slate-900">Latest updates</h2><p className="mt-1 text-sm text-slate-500">{visibleAnnouncements.length} {visibleAnnouncements.length === 1 ? "announcement" : "announcements"}</p></div>
        <button type="button" onClick={() => setIsComposerOpen((current) => !current)} className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800">{isComposerOpen ? "Close composer" : "Add announcement"}</button>
      </div>

      {isComposerOpen && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold text-slate-900">New announcement</h3><p className="mt-1 text-sm text-slate-500">Share an update with everyone in Workbase.</p></div><span className="text-xs font-medium text-slate-400">Posting as {authorName}</span></div>
          <form className="mt-5 space-y-4" onSubmit={publishAnnouncement}>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Title</span><input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="What should the team know?" required /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Details</span><textarea className="min-h-28 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={body} onChange={(event) => setBody(event.target.value)} maxLength={1500} placeholder="Write a concise update…" required /></label>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setIsComposerOpen(false)} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button><button className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isPublishing}>{isPublishing ? "Publishing…" : "Publish announcement"}</button></div>
          </form>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="px-1 text-sm font-medium text-slate-700">Filter announcements</p>
        <div className="flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="author-filter">Author filter</label><select id="author-filter" value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="all">All authors</option><option value="mine">Posted by me</option></select><label className="sr-only" htmlFor="sort-order">Sort order</label><select id="sort-order" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>
      </div>

      <div className="mt-5 space-y-4">
        {visibleAnnouncements.length ? visibleAnnouncements.map((announcement) => <article key={announcement.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-base font-semibold text-slate-900">{announcement.title}</h3><time className="shrink-0 text-xs text-slate-400" dateTime={announcement.createdAt}>{formatDate(announcement.createdAt)}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{announcement.body}</p><p className="mt-4 text-xs font-medium text-slate-500">Posted by {announcement.authorName}</p></article>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><h3 className="font-semibold text-slate-900">No announcements found</h3><p className="mt-2 text-sm text-slate-500">Try a different filter or share a new update.</p></div>}
      </div>
    </section>
  );
}
