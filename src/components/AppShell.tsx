"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { getAccessToken } from "@/lib/axios";

export type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell(props: Readonly<AppShellProps>) {
  const { children } = props;
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="bg-ehs-light-bg ml-68 flex min-h-screen min-w-0">
      <div className="bg-ehs-light-bg fixed top-0 left-0 w-68">
        <DashboardSidebar />
      </div>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
