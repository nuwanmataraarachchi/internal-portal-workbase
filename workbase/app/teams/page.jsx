"use client";

import { useEffect, useState } from "react";

const initialForm = { id: null, name: "", description: "", memberIds: [] };

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(form.id);

  useEffect(() => {
    async function loadTeams() {
      setError("");
      setIsLoading(true);
      try {
        const [teamsResponse, audiencesResponse] = await Promise.all([fetch("/api/teams"), fetch("/api/audiences")]);
        const [teamsData, audiencesData] = await Promise.all([teamsResponse.json(), audiencesResponse.json()]);

        if (!teamsResponse.ok) throw new Error(teamsData.message || "Unable to load teams.");
        if (!audiencesResponse.ok) throw new Error(audiencesData.message || "Unable to load users.");

        setTeams(teamsData.teams);
        setUsers(audiencesData.users);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load teams.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTeams();
  }, []);

  function closeForm() {
    setIsFormOpen(false);
    setForm(initialForm);
    setError("");
  }

  function openCreateForm() {
    setForm(initialForm);
    setError("");
    setIsFormOpen(true);
  }

  function openEditForm(team) {
    setForm({ id: team.id, name: team.name, description: team.description || "", memberIds: team.members.map((member) => member.id) });
    setError("");
    setIsFormOpen(true);
  }

  function toggleMember(id) {
    setForm((current) => ({
      ...current,
      memberIds: current.memberIds.includes(id) ? current.memberIds.filter((memberId) => memberId !== id) : [...current.memberIds, id],
    }));
  }

  async function saveTeam(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/teams", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Unable to create team.");
        return;
      }
      setTeams((current) => (isEditing ? current.map((team) => team.id === result.team.id ? result.team : team) : [...current, result.team]).sort((first, second) => first.name.localeCompare(second.name)));
      closeForm();
    } catch {
      setError("Unable to create team. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">WORKSPACE</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Teams</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Create teams from real workspace users. Teams can be selected when publishing announcements.</p>
          </div>
          <button type="button" onClick={openCreateForm} className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">
            Add team
          </button>
        </header>

        {error && <p className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {isFormOpen && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">{isEditing ? "Edit team" : "Create a new team"}</h2>
            <form className="mt-5" onSubmit={saveTeam}>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-sm font-medium">Team name</span>
                  <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium">Description</span>
                  <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </label>
              </div>
              <fieldset className="mt-5">
                <legend className="text-sm font-medium">Select users</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {users.map((user) => (
                    <label key={user.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${form.memberIds.includes(user.id) ? "border-blue-300 bg-blue-50" : "border-slate-200"}`}>
                      <input type="checkbox" checked={form.memberIds.includes(user.id)} onChange={() => toggleMember(user.id)} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800">{user.name}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{user.designation}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={closeForm} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button disabled={isSaving} className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-60">
                  {isSaving ? "Saving..." : isEditing ? "Save changes" : "Create team"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Existing teams</h2>
            <span className="text-sm text-slate-500">{teams.length} teams</span>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">Loading teams...</div>
          ) : teams.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {teams.map((team) => (
                <article key={team.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold">{team.name}</h3>
                    <button type="button" onClick={() => openEditForm(team)} className="h-8 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{team.description || "No description provided."}</p>
                  <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="font-medium text-slate-700">{member.name}</span>
                        <span className="truncate text-xs text-slate-500">{member.designation}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <h3 className="font-semibold">No teams yet</h3>
              <p className="mt-2 text-sm text-slate-500">Create a team from the users in your workspace.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
