import { DashboardHeader } from "@/components/DashboardHeader";
import { CapaRcaContent } from "@/components/capa/detail/CapaRcaContent";

/** Horizontal Root Cause Analysis — Figma 5472:19820. */
export default async function CapaRcaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Root Cause Analysis" showSiteSwitcher />
      <CapaRcaContent capaId={id} />
    </div>
  );
}
