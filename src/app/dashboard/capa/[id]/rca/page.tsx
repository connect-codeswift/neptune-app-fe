import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { CapaRcaContent } from "@/components/capa/detail/CapaRcaContent";
import { getCapaDetailById } from "@/components/capa/detail/capa-detail-data";

/** Horizontal Root Cause Analysis — Figma 5472:19820. */
export default async function CapaRcaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = getCapaDetailById(decodeURIComponent(id));

  if (!record) {
    notFound();
  }

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Root Cause Analysis" showSiteSwitcher />
      <CapaRcaContent record={record} />
    </div>
  );
}
