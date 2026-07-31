import { DashboardHeader } from "@/components/DashboardHeader";

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Reports" actionLabel="Generate Report" />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
