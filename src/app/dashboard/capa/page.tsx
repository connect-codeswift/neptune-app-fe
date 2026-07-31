import { DashboardHeader } from "@/components/DashboardHeader";

export default function CapaPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="CAPA" actionLabel="Create CAPA" />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
