import { LotoProcedurePageContent } from "@/components/loto/procedure/LotoProcedurePageContent";

export default function CreateLotoProcedurePage() {
  return (
    <div className="flex flex-1 flex-col pt-4">
      <LotoProcedurePageContent mode="create" />
    </div>
  );
}
