import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const result = await db().query(
    "SELECT id, username, email, name, role, details FROM users WHERE id = $1 LIMIT 1",
    [session.userId],
  );
  const user = result.rows[0];
  if (!user) redirect("/auth/signin");

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-600">YOUR PROFILE</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{user.name}</h1>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Username</dt><dd className="mt-1 text-sm text-slate-700">{user.username}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt><dd className="mt-1 text-sm text-slate-700">{user.email}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Role</dt><dd className="mt-1 text-sm capitalize text-slate-700">{user.role.replaceAll("_", " ")}</dd></div>
          {Object.entries(user.details ?? {}).map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 text-sm text-slate-700">{String(value)}</dd></div>)}
        </dl>
      </div>
    </main>
  );
}
