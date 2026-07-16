import { IncidentKpisDashboard } from "@/components/incidents/IncidentKpisDashboard";
import { IncidentKpisHeader } from "@/components/incidents/IncidentKpisHeader";

export default function IncidentsPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <IncidentKpisHeader />
      <div className="flex flex-1 flex-col px-4 pb-8">
        <IncidentKpisDashboard />
      </div>
    </div>
  );
}
