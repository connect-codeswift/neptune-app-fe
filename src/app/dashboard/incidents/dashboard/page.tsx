import {
  IncidentKpisDashboard,
  IncidentKpisHeader,
} from "@/components/incidents/dashboard";
import { IncidentViewTabs } from "@/components/incidents/shared";

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
