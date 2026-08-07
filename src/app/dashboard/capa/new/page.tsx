import { DashboardHeader } from "@/components/DashboardHeader";
import { CreateCapaContent } from "@/components/capa/create/CreateCapaContent";

/** Create CAPA — Figma 7123:41554 / Add Task modal 7123:41708. */
export default function CreateCapaPage() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Create CAPA" showSiteSwitcher />
      <CreateCapaContent />
    </div>
  );
}
