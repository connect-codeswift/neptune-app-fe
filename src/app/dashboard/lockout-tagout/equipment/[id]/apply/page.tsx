import { DashboardHeader } from "@/components/DashboardHeader";
import { LotoApplyLockoutContent } from "@/components/loto/lockout/LotoApplyLockoutContent";

export type ApplyLockoutPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function ApplyLockoutPage(props: ApplyLockoutPageProps) {
  const { id } = await props.params;

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="Apply Lockout" />
      <LotoApplyLockoutContent equipmentId={decodeURIComponent(id)} />
    </div>
  );
}
