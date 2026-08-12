import { DashboardHeader } from "@/components/DashboardHeader";
import { MyCapasContent } from "@/components/capa/mine/MyCapasContent";

/** My CAPAs — Figma 838:3105. */
export default function MyCapasPage() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="My CAPAs" showSiteSwitcher />
      <MyCapasContent />
    </div>
  );
}
