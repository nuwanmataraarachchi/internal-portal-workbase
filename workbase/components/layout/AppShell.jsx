"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const publicRoutes = ["/login", "/auth/signin"];

export default function AppShell({ children }) {
  const pathname = usePathname();

  if (publicRoutes.includes(pathname)) {
    return children;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div><p className="text-sm font-semibold text-slate-900">Good morning, Nuwan</p><p className="text-xs text-slate-500">Here&apos;s what&apos;s happening across Workbase.</p></div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700" aria-label="Nuwan Mataraarachchi">NM</div>
        </header>
        {children}
      </div>
    </div>
  );
}
