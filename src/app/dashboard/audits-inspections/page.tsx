import { DashboardHeader } from "@/components/DashboardHeader";

export default function AuditsInspectionsPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader
        title="Audits & Inspections"
        actionLabel="Schedule Audit"
      />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
