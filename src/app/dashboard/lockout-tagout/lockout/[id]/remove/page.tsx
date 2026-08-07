import { DashboardHeader } from "@/components/DashboardHeader";
import { LotoRemoveLockoutContent } from "@/components/loto/lockout/LotoRemoveLockoutContent";

export type RemoveLockoutPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function RemoveLockoutPage(props: RemoveLockoutPageProps) {
  const { id } = await props.params;

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />
      <LotoRemoveLockoutContent lockoutId={decodeURIComponent(id)} />
    </div>
  );
}
