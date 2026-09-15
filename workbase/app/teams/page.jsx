"use client";

import { useState } from "react";

const people = [
  { id: "nuwan", name: "Nuwan Mataraarachchi", role: "Senior Software Engineer", initials: "NM" },
  { id: "kasun", name: "Kasun Perera", role: "Product Designer", initials: "KP" },
  { id: "sarah", name: "Sarah Fernando", role: "Product Manager", initials: "SF" },
  { id: "dilan", name: "Dilan Silva", role: "Frontend Engineer", initials: "DS" },
  { id: "amal", name: "Amal Jayasinghe", role: "QA Engineer", initials: "AJ" },
  { id: "maya", name: "Maya Wickramasinghe", role: "UX Researcher", initials: "MW" },
];

const initialTeams = [
  { id: 1, name: "Product", description: "Owns product direction and customer experience.", memberIds: ["sarah", "kasun", "maya"] },
  { id: 2, name: "Engineering", description: "Builds and maintains the internal platform.", memberIds: ["nuwan", "dilan", "amal"] },
];

function peopleForTeam(memberIds) {
  return people.filter((person) => memberIds.includes(person.id));
}

export default function TeamsPage() {
  const [teams, setTeams] = useState(initialTeams);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const [error, setError] = useState("");

  function toggleMember(personId) {
    setMemberIds((current) => current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId]);
  }

  function closeForm() {
    setIsFormOpen(false);
    setName("");
    setDescription("");
    setMemberIds([]);
    setError("");
  }

  function addTeam(event) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a team name.");
    if (!memberIds.length) return setError("Select at least one team member.");
    setTeams((current) => [...current, { id: Date.now(), name: name.trim(), description: description.trim() || "A newly created team.", memberIds }]);
    closeForm();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8"><div className="mx-auto max-w-6xl"><header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-blue-600">WORKSPACE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Teams</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">See who is working together and create a team from the people in your workspace.</p></div><button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">Add team</button></header>
      {isFormOpen && <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="new-team-heading"><div><h2 id="new-team-heading" className="font-semibold">Create a new team</h2><p className="mt-1 text-sm text-slate-500">Choose the members who belong to this team.</p></div><form className="mt-5" onSubmit={addTeam}><div className="grid gap-4 md:grid-cols-2"><label><span className="mb-1.5 block text-sm font-medium text-slate-700">Team name</span><input value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="e.g. Platform" /></label><label><span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span><input value={description} onChange={(event) => setDescription(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="What does this team own?" /></label></div><fieldset className="mt-5"><legend className="text-sm font-medium text-slate-700">Select people</legend><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{people.map((person) => <label key={person.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${memberIds.includes(person.id) ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}><input type="checkbox" checked={memberIds.includes(person.id)} onChange={() => toggleMember(person.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{person.initials}</span><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-800">{person.name}</span><span className="block truncate text-xs text-slate-500">{person.role}</span></span></label>)}</div></fieldset>{error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}<div className="mt-5 flex justify-end gap-3"><button type="button" onClick={closeForm} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">Create team</button></div></form></section>}
      <section aria-labelledby="teams-heading"><div className="mb-4 flex items-center justify-between"><h2 id="teams-heading" className="text-lg font-semibold">Existing teams</h2><span className="text-sm text-slate-500">{teams.length} teams</span></div><div className="grid gap-5 md:grid-cols-2">{teams.map((team) => { const members = peopleForTeam(team.memberIds); return <article key={team.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="text-base font-semibold">{team.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{team.description}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{members.length} members</span></div><div className="mt-5 border-t border-slate-100 pt-4">{members.map((person) => <div key={person.id} className="flex items-center gap-3 py-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">{person.initials}</span><span><span className="block text-sm font-medium text-slate-800">{person.name}</span><span className="block text-xs text-slate-500">{person.role}</span></span></div>)}</div></article>; })}</div></section>
    </div></main>
  );
}
