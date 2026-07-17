import { DashboardHeader } from "@/components/DashboardHeader";

export default function EmissionsPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Emissions" actionLabel="Log Emission" />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
