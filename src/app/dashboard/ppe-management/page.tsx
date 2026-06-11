import { DashboardHeader } from "@/components/DashboardHeader";

export default function PpeManagementPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="PPE Management" actionLabel="Assign PPE" />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
