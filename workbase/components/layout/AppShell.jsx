"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "./Sidebar";

const publicRoutes = ["/login", "/auth/signin"];

function getInitials(name) {
  return name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "WB";
}

export default function AppShell({ children, session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (publicRoutes.includes(pathname)) {
    return children;
  }

  async function signOut() {
    setIsSigningOut(true);
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      router.replace("/auth/signin");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  const displayName = session?.name || "Workbase user";
  const firstName = displayName.split(" ")[0] || displayName;
  const initials = getInitials(displayName);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session?.role} />
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div><p className="text-sm font-semibold text-slate-900">Good morning, {firstName}</p><p className="text-xs text-slate-500">Here&apos;s what&apos;s happening across Workbase.</p></div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 transition hover:bg-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
              aria-label={`${displayName} account menu`}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              {initials}
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg" role="menu">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  {session?.email && <p className="mt-0.5 truncate text-xs text-slate-500">{session.email}</p>}
                </div>
                <Link href="/user/profile" onClick={() => setIsMenuOpen(false)} className="mt-1 flex h-9 items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-50" role="menuitem">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  disabled={isSigningOut}
                  className="flex h-9 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                  role="menuitem"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
