"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    section: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Announcements",
    href: "/announcements",
    section: "Workspace",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5v-14Z" />
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M8 7h8M8 11h6" />
      </svg>
    ),
  },
  {
    label: "Calendar",
    href: "/calendar",
    section: "Workspace",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Teams",
    href: "/teams",
    section: "Workspace",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M16 5.5a2.5 2.5 0 0 1 0 5M18.5 20a4.5 4.5 0 0 0-2.7-4.12" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkSidebar, setIsDarkSidebar] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const sidebarColors = isDarkSidebar
    ? "border-slate-800 bg-slate-950 text-slate-100"
    : "border-slate-200 bg-white text-slate-900";
  const borderColor = isDarkSidebar ? "border-slate-800" : "border-slate-100";
  const mutedText = isDarkSidebar ? "text-slate-500" : "text-slate-400";
  const inactiveLink = isDarkSidebar
    ? "text-slate-400 hover:bg-slate-900 hover:text-white"
    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950";
  const activeLink = isDarkSidebar ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-950";
  const dangerLink = isDarkSidebar ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" : "text-red-600 hover:bg-red-50 hover:text-red-700";

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

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r transition-[width,background-color,border-color] duration-200 ease-out ${sidebarColors} ${isCollapsed ? "w-16" : "w-60"}`}
      aria-label="Primary navigation"
    >
      <div className={`flex h-20 items-center border-b ${borderColor} ${isCollapsed ? "justify-center" : "px-5"}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">W</div>
        {!isCollapsed && <span className="ml-3 whitespace-nowrap text-sm font-semibold tracking-[0.12em]">WORKBASE</span>}
      </div>

      <nav className="flex-1 px-3 py-6">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const showSection = index === 0 || navigation[index - 1].section !== item.section;
          return (
            <div key={item.href} className="mb-6 last:mb-0">
              {!isCollapsed && showSection && <p className={`mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider ${mutedText}`}>{item.section}</p>}
              <Link
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex h-10 items-center rounded-lg text-sm font-medium transition-colors ${isCollapsed ? "justify-center" : "px-3"} ${isActive ? activeLink : inactiveLink}`}
              >
                <span className="h-5 w-5 shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                {isCollapsed && <span role="tooltip" className="pointer-events-none absolute left-12 z-10 hidden whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white shadow-sm group-hover:block group-focus:block">{item.label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className={`border-t p-3 ${borderColor}`}>
        <Link href="/settings" title={isCollapsed ? "Settings" : undefined} className={`group relative mb-1 flex h-10 items-center rounded-lg text-sm font-medium transition-colors ${isCollapsed ? "justify-center" : "px-3"} ${inactiveLink}`}>
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56v.08h-3v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.56-1.04h-.08v-3h.08A1.7 1.7 0 0 0 7 9.92a1.7 1.7 0 0 0-.34-1.88L6.6 7.98 8.72 5.86l.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56v-.08h3v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.08v3h-.08A1.7 1.7 0 0 0 19.4 15Z" /></svg>
          {!isCollapsed && <span className="ml-3 whitespace-nowrap">Settings</span>}
          {isCollapsed && <span role="tooltip" className="pointer-events-none absolute left-12 z-10 hidden whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white shadow-sm group-hover:block group-focus:block">Settings</span>}
        </Link>
        <button
          type="button"
          onClick={() => setIsDarkSidebar((current) => !current)}
          className={`mb-1 flex h-10 w-full items-center rounded-lg text-sm font-medium transition-colors ${isCollapsed ? "justify-center" : "px-3"} ${inactiveLink}`}
          aria-label={isDarkSidebar ? "Use light sidebar" : "Use dark sidebar"}
          title={isCollapsed ? (isDarkSidebar ? "Use light sidebar" : "Use dark sidebar") : undefined}
        >
          {isDarkSidebar ? <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg> : <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.4 15.5A8.5 8.5 0 0 1 8.5 3.6 8.5 8.5 0 1 0 20.4 15.5Z" /></svg>}
          {!isCollapsed && <span className="ml-3 whitespace-nowrap">{isDarkSidebar ? "Light sidebar" : "Dark sidebar"}</span>}
        </button>
        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          className={`flex h-10 w-full items-center rounded-lg text-sm font-medium transition-colors ${isCollapsed ? "justify-center" : "px-3"} ${inactiveLink}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          {!isCollapsed && <span className="ml-3 whitespace-nowrap">Collapse</span>}
        </button>
        <button type="button" onClick={signOut} disabled={isSigningOut} title={isCollapsed ? "Sign out" : undefined} className={`group relative mt-1 flex h-10 w-full items-center rounded-lg text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${isCollapsed ? "justify-center" : "px-3"} ${dangerLink}`}>
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3" /><path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" /></svg>
            {!isCollapsed && <span className="ml-3 whitespace-nowrap">{isSigningOut ? "Signing out…" : "Sign out"}</span>}
            {isCollapsed && <span role="tooltip" className="pointer-events-none absolute left-12 z-10 hidden whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white shadow-sm group-hover:block group-focus:block">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
