"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";

export type HazcomShellProps = Readonly<{
  children: ReactNode;
}>;

/**
 * List/overview pages keep the HazCom site header. Detail-like routes use
 * their own breadcrumb header instead (same pattern as PPE / Policy Maker).
 */
function shouldHideTopHeader(pathname: string): boolean {
  return (
    /^\/dashboard\/hazcom\/chemicals\/[^/]+/.test(pathname) ||
    /^\/dashboard\/hazcom\/sds\/[^/]+/.test(pathname) ||
    pathname === "/dashboard/hazcom/training/new" ||
    pathname === "/dashboard/hazcom/risk-assessments/new"
  );
}

export function HazcomShell(props: Readonly<HazcomShellProps>) {
  const { children } = props;
  const pathname = usePathname();
  const hideTopHeader = shouldHideTopHeader(pathname);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      {hideTopHeader ? null : <DashboardHeader title="HazCom" />}
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
