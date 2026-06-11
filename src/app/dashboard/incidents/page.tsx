import { DashboardHeader } from "@/components/DashboardHeader";

export default function IncidentsPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Incidents" actionLabel="Report Incident" />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
