import { DashboardHeader } from "@/components/DashboardHeader";

export default function LockoutTagoutPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Lockout/Tagout" actionLabel="New LOTO" />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
