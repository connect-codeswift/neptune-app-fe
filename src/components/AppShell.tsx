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
    <div
      className="flex min-h-screen min-w-0 flex-col lg:ml-68 lg:flex-row"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 0% 0%, #cde9f5 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 100% 100%, #cde9f5 0%, transparent 70%), #f0f8fc",
      }}
    >
      {/* Mobile top navigation header */}
      <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[rgba(15,23,42,0.08)] bg-white/80 px-4 py-3.5 backdrop-blur-[14px] lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="text-ehs-gray hover:bg-ehs-light-bg inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(15,23,42,0.08)]"
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
          "bg-ehs-light-bg fixed top-0 left-0 z-50 h-full w-68 transition-transform duration-300 lg:block lg:translate-x-0",
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
