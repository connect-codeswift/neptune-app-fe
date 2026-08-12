import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { CapaDetailContent } from "@/components/capa/detail/CapaDetailContent";
import { getCapaDetailById } from "@/components/capa/detail/capa-detail-data";

/** CAPA detail — Figma 1366:2947 / 1370:3490 / 1370:4062 / 1370:4681. */
export default async function CapaDetailPage({
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
      <DashboardHeader title="CAPA Detail" showSiteSwitcher />
      <CapaDetailContent record={record} />
    </div>
  );
}
