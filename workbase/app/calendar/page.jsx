import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ensureTeamSchema } from "@/lib/team-data";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTimeRange(start, end) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function formatDateRange(start, end) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const sameDay = start.toDateString() === end.toDateString();
  return sameDay ? `${dateFormatter.format(start)} · ${formatTimeRange(start, end)}` : `${dateFormatter.format(start)} - ${dateFormatter.format(end)} · ${formatTimeRange(start, end)}`;
}

function datesForCurrentMonth(start, end, month, year) {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const cursor = new Date(Math.max(start.getTime(), monthStart.getTime()));
  const last = new Date(Math.min(end.getTime(), monthEnd.getTime()));
  const days = [];

  cursor.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  while (cursor <= last) {
    days.push(cursor.getDate());
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  await ensureTeamSchema();

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const result = await db().query(
    `SELECT a.id, a.title, COALESCE(a.scheduled_start, a.created_at) AS scheduled_start, COALESCE(a.scheduled_end, a.scheduled_start, a.created_at) AS scheduled_end
     FROM announcements a
     WHERE a.is_active = TRUE
       AND COALESCE(a.scheduled_start, a.created_at) <= $2
       AND COALESCE(a.scheduled_end, a.scheduled_start, a.created_at) >= $1
       AND (
         NOT EXISTS (SELECT 1 FROM announcement_targets targets WHERE targets.announcement_id = a.id)
         OR a.author_user_id = $3
         OR EXISTS (SELECT 1 FROM announcement_targets targets WHERE targets.announcement_id = a.id AND targets.target_type = 'individual' AND targets.target_id = $3)
         OR EXISTS (SELECT 1 FROM announcement_targets targets JOIN team_members tm ON tm.team_id = targets.target_id WHERE targets.announcement_id = a.id AND targets.target_type = 'team' AND tm.user_id = $3)
       )
     ORDER BY COALESCE(a.scheduled_start, a.created_at) ASC, a.id ASC`,
    [monthStart, monthEnd, session.userId],
  );

  const announcementEvents = result.rows.map((announcement) => {
    const start = new Date(announcement.scheduled_start);
    const end = new Date(announcement.scheduled_end);
    return {
      id: `announcement-${announcement.id}`,
      title: announcement.title,
      start,
      end,
      days: datesForCurrentMonth(start, end, month, year),
      time: formatTimeRange(start, end),
      dateRange: formatDateRange(start, end),
      color: "bg-rose-100 text-rose-700",
    };
  });

  const days = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => index + 1);
  const cells = [...Array(new Date(year, month, 1).getDay()).fill(null), ...days];
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-blue-600">WORKSPACE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Calendar</h1><p className="mt-3 text-sm leading-6 text-slate-500">Active announcements scheduled for this month.</p></div><button type="button" className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">Today</button></header>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="month-heading">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6"><span className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300" aria-hidden="true">‹</span><h2 id="month-heading" className="text-lg font-semibold">{monthLabel}</h2><span className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300" aria-hidden="true">›</span></div>
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">{weekdays.map((day) => <div key={day} className="py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs"><span className="hidden sm:inline">{day}</span><span className="sm:hidden">{day.slice(0, 3)}</span></div>)}</div>
          <div className="grid grid-cols-7">{cells.map((day, index) => { const dayEvents = day ? announcementEvents.filter((event) => event.days.includes(day)) : []; const isToday = day === now.getDate(); return <div key={`${day ?? "blank"}-${index}`} className={`min-h-24 border-b border-r border-slate-100 p-1.5 last:border-r-0 sm:min-h-32 sm:p-2 ${day ? "bg-white" : "bg-slate-50/50"}`}><div className="flex justify-end"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-blue-600 text-white" : "text-slate-600"}`}>{day}</span></div><div className="mt-1 space-y-1">{dayEvents.slice(0, 3).map((event) => <div key={`${event.id}-${day}`} className={`hidden truncate rounded px-1.5 py-1 text-[10px] font-medium sm:block ${event.color}`} title={`${event.time} ${event.title}`}>{event.time} {event.title}</div>)}{dayEvents.length > 0 && <span className="mx-auto block h-1.5 w-1.5 rounded-full bg-blue-500 sm:hidden" />}</div></div>; })}</div>
        </section>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="upcoming-heading"><h2 id="upcoming-heading" className="font-semibold">This month</h2>{announcementEvents.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{announcementEvents.map((event) => <article key={event.id} className="flex items-start gap-3"><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${event.color.split(" ")[0]}`} /><div><p className="text-sm font-medium text-slate-800">{event.title}</p><p className="mt-1 text-xs text-slate-500">{event.dateRange}</p></div></article>)}</div> : <p className="mt-4 text-sm text-slate-500">No active announcements scheduled this month.</p>}</section>
      </div>
    </main>
  );
}
