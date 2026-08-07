import { DashboardHeader } from "@/components/DashboardHeader";
import { LotoEquipmentDetailContent } from "@/components/loto/equipment/LotoEquipmentDetailContent";

export type LotoEquipmentDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}>;

export default async function LotoEquipmentDetailPage(
  props: LotoEquipmentDetailPageProps,
) {
  const { id } = await props.params;
  const { tab } = await props.searchParams;

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />
      <LotoEquipmentDetailContent
        equipmentId={decodeURIComponent(id)}
        initialTab={tab}
      />
    </div>
  );
}
