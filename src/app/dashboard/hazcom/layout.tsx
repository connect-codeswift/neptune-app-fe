import { DashboardHeader } from "@/components/DashboardHeader";

export default function HazcomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col pb-4">
      <DashboardHeader
        title="HazCom Overview"
        dateRangeLabel="March 25 — April 24, 2026"      />

      <main>{children}</main> 
    </div>
  );
}
