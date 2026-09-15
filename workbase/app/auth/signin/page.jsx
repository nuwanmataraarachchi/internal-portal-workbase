"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("TeamBaseDemo123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "We could not sign you in. Please try again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-indigo-200/45 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>
      <section className="relative w-full max-w-[440px] rounded-3xl border border-white/80 bg-white/90 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur sm:p-10">
        <div className="mb-9"><div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 shadow-lg shadow-slate-900/20"><span className="text-lg font-bold tracking-tight text-white">W</span></div><p className="text-sm font-semibold tracking-wide text-blue-600">WORKBASE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Welcome back</h1><p className="mt-2 text-sm leading-6 text-slate-500">Sign in to access your team&apos;s internal workspace.</p></div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Work email</span><input className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Password</span><input className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{error}</p>}
          <button className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in to Workbase"}</button>
        </form>
        <div className="mt-7 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500"><span className="font-semibold text-slate-700">Demo access</span> &middot; admin@example.com / TeamBaseDemo123!</div>
      </section>
    </main>
  );
}
