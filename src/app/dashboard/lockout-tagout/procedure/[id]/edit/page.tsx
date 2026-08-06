import { DashboardHeader } from "@/components/DashboardHeader";
import { LotoProcedurePageContent } from "@/components/loto/procedure/LotoProcedurePageContent";

export type EditLotoProcedurePageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditLotoProcedurePage(
  props: EditLotoProcedurePageProps,
) {
  const { id } = await props.params;

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs…"
        searchonleft
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />
      <LotoProcedurePageContent mode="edit" equipmentId={id} />
    </div>
  );
}
