import { DashboardHeader } from "@/components/DashboardHeader";

export default function PolicyMakerPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader
        title="Document Control"
        actionLabel="Upload a Document"
      />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
