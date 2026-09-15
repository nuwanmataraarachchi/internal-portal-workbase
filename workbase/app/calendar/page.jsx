const events = [
  { date: 16, title: "Sprint planning", time: "9:30 AM", color: "bg-blue-100 text-blue-700" },
  { date: 18, title: "Office holiday", time: "All day", color: "bg-amber-100 text-amber-700" },
  { date: 22, title: "Design review", time: "2:00 PM", color: "bg-violet-100 text-violet-700" },
  { date: 25, title: "Team lunch", time: "12:30 PM", color: "bg-emerald-100 text-emerald-700" },
];

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const days = Array.from({ length: 30 }, (_, index) => index + 1);
const cells = [...Array(2).fill(null), ...days, ...Array(3).fill(null)];

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-blue-600">WORKSPACE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Calendar</h1><p className="mt-3 text-sm leading-6 text-slate-500">A shared view of upcoming team moments. Sample events are shown for now.</p></div><button type="button" className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">Today</button></header>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="month-heading">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6"><button type="button" aria-label="Previous month" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg></button><h2 id="month-heading" className="text-lg font-semibold">September 2026</h2><button type="button" aria-label="Next month" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></button></div>
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">{weekdays.map((day) => <div key={day} className="py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs"><span className="hidden sm:inline">{day}</span><span className="sm:hidden">{day.slice(0, 3)}</span></div>)}</div>
          <div className="grid grid-cols-7">{cells.map((day, index) => { const dayEvents = day ? events.filter((event) => event.date === day) : []; const isToday = day === 16; return <div key={`${day ?? "blank"}-${index}`} className={`min-h-24 border-b border-r border-slate-100 p-1.5 last:border-r-0 sm:min-h-32 sm:p-2 ${day ? "bg-white" : "bg-slate-50/50"}`}><div className="flex justify-end"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-blue-600 text-white" : "text-slate-600"}`}>{day}</span></div><div className="mt-1 space-y-1">{dayEvents.map((event) => <div key={event.title} className={`hidden truncate rounded px-1.5 py-1 text-[10px] font-medium sm:block ${event.color}`} title={`${event.title}, ${event.time}`}>{event.time} {event.title}</div>)}{dayEvents.length > 0 && <span className="mx-auto block h-1.5 w-1.5 rounded-full bg-blue-500 sm:hidden" />}</div></div>; })}</div>
        </section>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="upcoming-heading"><h2 id="upcoming-heading" className="font-semibold">Upcoming events</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{events.map((event) => <article key={event.title} className="flex items-start gap-3"><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${event.color.split(" ")[0]}`} /><div><p className="text-sm font-medium text-slate-800">{event.title}</p><p className="mt-1 text-xs text-slate-500">Sep {event.date} · {event.time}</p></div></article>)}</div></section>
      </div>
    </main>
  );
}
