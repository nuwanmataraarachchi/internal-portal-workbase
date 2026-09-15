"use client";

import { useMemo, useState } from "react";

const dummyAnnouncements = [
  {
    id: 1,
    title: "Engineering Team Meeting",
    body: "The monthly engineering team meeting will take place this Friday at 10:00 AM. Please make sure your project updates are ready.",
    authorName: "Nuwan Mataraarachchi",
    createdAt: "2026-09-15T09:30:00",
  },
  {
    id: 2,
    title: "New Code Review Guidelines",
    body: "We have updated our pull request and code review guidelines. Please follow the new process for all upcoming changes.",
    authorName: "Kasun Perera",
    createdAt: "2026-09-14T14:15:00",
  },
  {
    id: 3,
    title: "Office Holiday Notice",
    body: "The office will be closed on September 18. Normal operations will resume on September 19.",
    authorName: "Sarah Fernando",
    createdAt: "2026-09-13T11:00:00",
  },
  {
    id: 4,
    title: "Product Release Update",
    body: "Version 2.4 of the internal platform has been successfully released. Thank you to everyone involved in the release.",
    authorName: "Dilan Silva",
    createdAt: "2026-09-12T16:45:00",
  },
  {
    id: 5,
    title: "Team Lunch",
    body: "The team lunch has been scheduled for next Wednesday. More details about the location will be shared soon.",
    authorName: "Nuwan Mataraarachchi",
    createdAt: "2026-09-11T10:20:00",
  },
  {
    id: 6,
    title: "Security Awareness Reminder",
    body: "Please remember to keep your passwords secure and enable multi-factor authentication on all company accounts.",
    authorName: "Kasun Perera",
    createdAt: "2026-09-10T08:40:00",
  },
];

const audienceOptions = {
  team: ["Engineering", "Product", "Design", "Operations"],
  individual: ["Kasun Perera", "Sarah Fernando", "Dilan Silva", "Amal Jayasinghe"],
};

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
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

function MegaphoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 11.5a2 2 0 0 1 2-2h3l9-4v13l-9-4H5a2 2 0 0 1-2-2v-1Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 14.5 9.5 20h3L11 15"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9.5a4 4 0 0 1 0 5"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 5v14M5 12h14"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path
        strokeLinecap="round"
        d="m16 16 4 4"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        d="M6 6l12 12M18 6 6 18"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6 9 6 6 6-6"
      />
    </svg>
  );
}

export default function AnnouncementList({ authorName = "Nuwan Mataraarachchi" }) {
  const [announcements, setAnnouncements] = useState(dummyAnnouncements);

  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState("team");
  const [audience, setAudience] = useState("Engineering");
  const [formError, setFormError] = useState("");

  const authors = useMemo(() => {
    return [...new Set(announcements.map((announcement) => announcement.authorName))];
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = announcements.filter((announcement) => {
      const matchesSearch =
        !normalizedSearch ||
        announcement.title.toLowerCase().includes(normalizedSearch) ||
        announcement.body.toLowerCase().includes(normalizedSearch) ||
        announcement.authorName.toLowerCase().includes(normalizedSearch);

      const matchesAuthor =
        authorFilter === "all" ||
        announcement.authorName === authorFilter;

      return matchesSearch && matchesAuthor;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });
  }, [announcements, search, authorFilter, sortOrder]);

  function openModal() {
    setTitle("");
    setBody("");
    setAudienceType("team");
    setAudience("Engineering");
    setFormError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setTitle("");
    setBody("");
    setAudienceType("team");
    setAudience("Engineering");
    setFormError("");
  }

  function handleCreateAnnouncement(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      setFormError("Please enter an announcement title.");
      return;
    }

    if (!trimmedBody) {
      setFormError("Please enter an announcement message.");
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title: trimmedTitle,
      body: trimmedBody,
      authorName,
      createdAt: new Date().toISOString(),
      audience: `${audienceType === "team" ? "Team" : "Individual"}: ${audience}`,
    };

    setAnnouncements((current) => [
      newAnnouncement,
      ...current,
    ]);

    closeModal();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
      <section>
        {/* Toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <MegaphoneIcon />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    All Announcements
                  </h2>

                  <p className="text-xs text-slate-500">
                    {announcements.length}{" "}
                    {announcements.length === 1
                      ? "announcement"
                      : "announcements"}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              <PlusIcon />
              New Announcement
            </button>
          </div>

          {/* Filters */}
          <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <SearchIcon />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search announcements..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
              />
            </div>

            <label className="relative">
              <span className="sr-only">Filter by author</span>

              <select
                value={authorFilter}
                onChange={(event) => setAuthorFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 md:min-w-44"
              >
                <option value="all">All authors</option>

                {authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>

              <ChevronDownIcon className="pointer-events-none absolute right-3 top-3" />
            </label>

            <label className="relative">
              <span className="sr-only">Sort announcements</span>

              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 md:min-w-40"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>

              <ChevronDownIcon className="pointer-events-none absolute right-3 top-3" />
            </label>
          </div>
        </div>

        {/* Announcement list */}
        <div className="mt-6 space-y-4">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{announcement.audience || "All Workbase"}</span></div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                      {announcement.title}
                    </h3>

                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {announcement.body}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-600">
                      {announcement.authorName}
                    </span>

                    <span aria-hidden="true">·</span>

                    <time dateTime={announcement.createdAt}>
                      {formatDateTime(announcement.createdAt)}
                    </time>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <SearchIcon />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No announcements found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-announcement-title"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="create-announcement-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Create Announcement
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Share an update with your team.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement}>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <label
                    htmlFor="announcement-title"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Title
                  </label>

                  <input
                    id="announcement-title"
                    type="text"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setFormError("");
                    }}
                    placeholder="Enter announcement title"
                    autoFocus
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="announcement-body"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Message
                  </label>

                  <textarea
                    id="announcement-body"
                    value={body}
                    onChange={(event) => {
                      setBody(event.target.value);
                      setFormError("");
                    }}
                    placeholder="Write your announcement..."
                    rows={5}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-slate-700">Share with</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ value: "team", label: "A team" }, { value: "individual", label: "An individual" }].map((option) => <label key={option.value} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${audienceType === option.value ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><input type="radio" name="audience-type" value={option.value} checked={audienceType === option.value} onChange={() => { setAudienceType(option.value); setAudience(audienceOptions[option.value][0]); }} className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />{option.label}</label>)}
                  </div>
                  <label className="mt-3 block"><span className="sr-only">Choose recipient</span><select value={audience} onChange={(event) => setAudience(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10">{audienceOptions[audienceType].map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                </fieldset>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600"
                  >
                    {formError}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
