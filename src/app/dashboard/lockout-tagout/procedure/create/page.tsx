import { DashboardHeader } from "@/components/DashboardHeader";
import { LotoProcedurePageContent } from "@/components/loto/procedure/LotoProcedurePageContent";

export default function CreateLotoProcedurePage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />
      <LotoProcedurePageContent mode="create" />
    </div>
  );
}
