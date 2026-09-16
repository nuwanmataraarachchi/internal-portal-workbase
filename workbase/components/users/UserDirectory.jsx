"use client";

import { useMemo, useState } from "react";

const initialForm = { id: null, name: "", username: "", email: "", password: "", birthday: "", designation: "", role: "member", isActive: true };

function formFromUser(user) {
  return { id: user.id, name: user.name, username: user.username, email: user.email, password: "", birthday: user.birthday || "", designation: user.designation, role: user.role, isActive: user.isActive };
}

export default function UserDirectory({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [designation, setDesignation] = useState("all");
  const [status, setStatus] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(form.id);

  const designations = useMemo(() => [...new Set(users.map((user) => user.designation))].sort(), [users]);
  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesDesignation = designation === "all" || user.designation === designation;
      const matchesStatus = status === "all" || (status === "active" ? user.isActive : !user.isActive);
      const matchesSearch = !query || [user.name, user.username, user.email, user.designation].some((value) => value.toLowerCase().includes(query));
      return matchesDesignation && matchesStatus && matchesSearch;
    });
  }, [users, search, designation, status]);

  function openCreateForm() {
    setForm(initialForm);
    setError("");
    setIsFormOpen(true);
  }

  function openEditForm(user) {
    setForm(formFromUser(user));
    setError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setForm(initialForm);
    setError("");
  }

  async function saveUser(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/users", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Unable to save user.");
        return;
      }
      setUsers((current) => isEditing ? current.map((user) => user.id === result.user.id ? result.user : user) : [...current, result.user]);
      closeForm();
    } catch {
      setError("Unable to save user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleUserStatus(user) {
    setError("");
    const response = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formFromUser(user), isActive: !user.isActive }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Unable to update user.");
      return;
    }
    setUsers((current) => current.map((item) => item.id === result.user.id ? result.user : item));
  }

  async function deleteUser(user) {
    if (!window.confirm(`Delete ${user.name}? This removes the user from teams and targeted announcements.`)) return;
    setError("");
    const response = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Unable to delete user.");
      return;
    }
    setUsers((current) => current.filter((item) => item.id !== result.id));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-blue-600">PEOPLE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Users</h1><p className="mt-3 text-sm leading-6 text-slate-500">Manage team members, access status, and workplace details.</p></div><button type="button" onClick={openCreateForm} className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">Add user</button></header>

        {error && <p className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

        {isFormOpen && <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="user-form-heading"><div><h2 id="user-form-heading" className="font-semibold">{isEditing ? "Edit user" : "Add user"}</h2><p className="mt-1 text-sm text-slate-500">{isEditing ? "Leave password blank to keep the current password." : "A temporary password is required so the new user can sign in."}</p></div><form className="mt-5" onSubmit={saveUser}><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[["name", "Full name", "text", true], ["username", "Username", "text", true], ["email", "Email", "email", true], ["password", isEditing ? "New password" : "Temporary password", "password", !isEditing], ["birthday", "Birthday", "date", true], ["designation", "Designation", "text", true]].map(([field, label, type, required]) => <label key={field}><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><input required={required} type={type} value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>)}<label><span className="mb-1.5 block text-sm font-medium text-slate-700">Access role</span><select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"><option value="member">Member</option><option value="hr">HR</option><option value="admin">Admin</option></select></label><label><span className="mb-1.5 block text-sm font-medium text-slate-700">Status</span><select value={form.isActive ? "active" : "inactive"} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "active" }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={closeForm} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={isSaving} type="submit" className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? "Saving..." : isEditing ? "Save changes" : "Add user"}</button></div></form></section>}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[1fr_220px_180px]"><label><span className="sr-only">Search users</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, username, email, or designation" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label><label><span className="sr-only">Filter designation</span><select value={designation} onChange={(event) => setDesignation(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option value="all">All designations</option>{designations.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span className="sr-only">Filter status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div></section>

        <section className="mt-6" aria-labelledby="users-grid-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="users-grid-heading" className="text-lg font-semibold">User grid</h2>
            <span className="text-sm text-slate-500">{visibleUsers.length} {visibleUsers.length === 1 ? "user" : "users"}</span>
          </div>
          {visibleUsers.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleUsers.map((user) => (
                <article key={user.id} className="flex min-h-64 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-700">
                      {user.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-slate-900">{user.name}</h3>
                      <p className="mt-1 truncate text-sm text-slate-500">@{user.username}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{user.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt>
                      <dd className="mt-1 truncate text-slate-700">{user.email}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Designation</dt>
                        <dd className="mt-1 truncate text-slate-700">{user.designation}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Role</dt>
                        <dd className="mt-1 truncate capitalize text-slate-700">{user.role}</dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Birthday</dt>
                      <dd className="mt-1 text-slate-700">{user.birthday || "Not specified"}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <button type="button" onClick={() => openEditForm(user)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                    <button type="button" onClick={() => toggleUserStatus(user)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">{user.isActive ? "Deactivate" : "Activate"}</button>
                    <button type="button" onClick={() => deleteUser(user)} className="h-9 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <h2 className="font-semibold">No users found</h2>
              <p className="mt-2 text-sm text-slate-500">Try another filter or add a user.</p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
