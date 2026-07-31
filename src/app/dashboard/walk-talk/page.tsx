import { DashboardHeader } from "@/components/DashboardHeader";

export default function WalkAndTalkPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Walk & Talk" actionLabel="Start Walk & Talk" />
      <div className="flex-1 px-4 pb-8"></div>
    </div>
  );
}
