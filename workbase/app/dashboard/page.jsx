import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  const cards = [["Announcements", "Share what the team needs to know."], ["Team directory", "Find people and their roles."], ["Resources", "Keep essential links in one place."]];
  return <main className="min-h-screen bg-slate-50 p-5 text-slate-900 sm:p-8"><div className="mx-auto max-w-6xl"><header className="flex items-center justify-between border-b border-slate-200 pb-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">W</div><span className="font-semibold tracking-tight">Workbase</span></div><form action="/api/auth/logout" method="post"><button className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950">Sign out</button></form></header><section className="py-14 sm:py-20"><p className="text-sm font-semibold text-blue-600">YOUR WORKSPACE</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Good to see you, {session.name}.</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-500">Your internal portal is ready. Announcements, docs, and team resources will live here.</p><div className="mt-10 grid gap-4 sm:grid-cols-3">{cards.map(([title, description]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></article>)}</div></section></div></main>;
}
