import { DashboardHeader } from "@/components/DashboardHeader";
import { CapaVerificationContent } from "@/components/capa/detail/CapaVerificationContent";

/** CAPA Verification — Figma 846:6031. */
export default async function CapaVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="CAPA Verification" showSiteSwitcher />
      <CapaVerificationContent capaId={id} />
    </div>
  );
}
