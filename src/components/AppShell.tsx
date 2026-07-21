"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { getAccessToken } from "@/lib/axios";
import { Icon } from "@iconify/react";

export type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell(props: Readonly<AppShellProps>) {
  const { children } = props;
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="bg-ehs-light-bg lg:ml-68 flex min-h-screen min-w-0 flex-col lg:flex-row">
      {/* Mobile top navigation header */}
      <header className="border-[rgba(15,23,42,0.08)] bg-white/80 px-4 py-3.5 backdrop-blur-[14px] flex h-14 shrink-0 items-center gap-3 border-b lg:hidden z-30">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(15,23,42,0.08)] text-ehs-gray hover:bg-ehs-light-bg"
          aria-label="Open navigation menu"
        >
          <Icon icon="mdi:menu" className="text-xl" />
        </button>
        <div className="text-ehs-dark-bg text-sm font-bold">Neptune EHS</div>
      </header>

      {/* Backdrop for mobile slide-out sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div
        className={[
          "bg-ehs-light-bg fixed top-0 left-0 w-68 h-full z-50 transition-transform duration-300 lg:translate-x-0 lg:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <DashboardSidebar />
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
