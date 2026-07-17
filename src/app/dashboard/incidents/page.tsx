"use client";

import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function IncidentsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader
        title="Incidents"
        actionLabel="Report Incident"
        onActionClick={() => router.push("/incidents/report")}
      />
      <div className="flex-1 px-4 pb-8" />
    </div>
  );
}
