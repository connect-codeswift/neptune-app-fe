import { IncidentKpisDashboard } from "@/components/incidents/dashboard/IncidentKpisDashboard";
import { IncidentKpisHeader } from "@/components/incidents/dashboard/IncidentKpisHeader";
import { IncidentViewTabs } from "@/components/incidents/IncidentViewTabs";

export default function IncidentsDashboardPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <IncidentKpisHeader />
      <div className="flex flex-1 flex-col gap-5 px-4 pb-8">
        <IncidentViewTabs />
        <IncidentKpisDashboard />
      </div>
    </div>
  );
}
