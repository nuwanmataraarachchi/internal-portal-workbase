"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const announcements = [
  { id: 1, title: "Engineering Team Meeting", author: "Nuwan Mataraarachchi", date: "Today, 9:30 AM", audience: "Engineering" },
  { id: 2, title: "New Code Review Guidelines", author: "Kasun Perera", date: "Yesterday", audience: "All Workbase" },
  { id: 3, title: "Office Holiday Notice", author: "Sarah Fernando", date: "Sep 13", audience: "All Workbase" },
];

const upcomingEvents = [
  { day: "16", month: "SEP", title: "Sprint planning", time: "9:30 AM · Engineering" },
  { day: "18", month: "SEP", title: "Office holiday", time: "All day · Workbase" },
  { day: "22", month: "SEP", title: "Design review", time: "2:00 PM · Product" },
];

const initialNotifications = [
  { id: 1, title: "New announcement from Kasun", detail: "New Code Review Guidelines", time: "12 min ago", read: false },
  { id: 2, title: "Event reminder", detail: "Sprint planning starts today at 9:30 AM", time: "1 hour ago", read: false },
  { id: 3, title: "Team update", detail: "You were added to Engineering", time: "Yesterday", read: true },
];

export default function DashboardContent({ name }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  function toggleRead(notificationId) {
    setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, read: !notification.read } : notification));
  }

  function markAllRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-blue-600">YOUR WORKSPACE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Good to see you, {name}.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Here&apos;s a clear view of what needs your attention today.</p></div><p className="text-sm font-medium text-slate-500">Tuesday, September 16</p></header>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Workspace overview">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">Unread notifications</p><div className="mt-3 flex items-end justify-between"><p className="text-3xl font-semibold tracking-tight">{unreadCount}</p><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Needs attention</span></div></article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">Upcoming events</p><div className="mt-3 flex items-end justify-between"><p className="text-3xl font-semibold tracking-tight">{upcomingEvents.length}</p><Link href="/calendar" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View calendar</Link></div></article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">Latest announcements</p><div className="mt-3 flex items-end justify-between"><p className="text-3xl font-semibold tracking-tight">{announcements.length}</p><Link href="/announcements" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Open feed</Link></div></article>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="announcements-heading"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 id="announcements-heading" className="font-semibold">Latest announcements</h2><p className="mt-1 text-xs text-slate-500">Recent updates from your workspace</p></div><Link href="/announcements" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all</Link></div><div className="divide-y divide-slate-100">{announcements.map((announcement) => <article key={announcement.id} className="px-5 py-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-sm font-semibold text-slate-800">{announcement.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{announcement.audience}</span></div><p className="mt-2 text-xs text-slate-500">{announcement.author} · {announcement.date}</p></article>)}</div></section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="notifications-heading"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 id="notifications-heading" className="font-semibold">Notifications</h2><p className="mt-1 text-xs text-slate-500">{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p></div>{unreadCount > 0 && <button type="button" onClick={markAllRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Mark all read</button>}</div><div className="divide-y divide-slate-100">{notifications.map((notification) => <button type="button" key={notification.id} onClick={() => toggleRead(notification.id)} className={`flex w-full gap-3 px-5 py-4 text-left transition hover:bg-slate-50 ${notification.read ? "" : "bg-blue-50/40"}`}><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-slate-200" : "bg-blue-600"}`} /><span className="min-w-0 flex-1"><span className={`block text-sm ${notification.read ? "font-medium text-slate-600" : "font-semibold text-slate-900"}`}>{notification.title}</span><span className="mt-1 block truncate text-xs text-slate-500">{notification.detail}</span><span className="mt-1.5 block text-[11px] text-slate-400">{notification.time} · {notification.read ? "Read" : "Unread"}</span></span></button>)}</div></section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="events-heading"><div className="flex items-center justify-between"><div><h2 id="events-heading" className="font-semibold">Upcoming events</h2><p className="mt-1 text-xs text-slate-500">Your next team moments</p></div><Link href="/calendar" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Open calendar</Link></div><div className="mt-5 grid gap-4 md:grid-cols-3">{upcomingEvents.map((event) => <article key={event.title} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm"><span className="text-base font-semibold leading-none">{event.day}</span><span className="mt-1 text-[9px] font-semibold tracking-wider text-slate-400">{event.month}</span></div><div><h3 className="text-sm font-semibold text-slate-800">{event.title}</h3><p className="mt-1 text-xs text-slate-500">{event.time}</p></div></article>)}</div></section>
      </div>
    </main>
  );
}
