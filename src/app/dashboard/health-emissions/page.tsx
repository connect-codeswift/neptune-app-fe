import { DashboardHeader } from "@/components/DashboardHeader";

export default function HealthEmissionsPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Health Emissions" actionLabel="Log Record" />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
