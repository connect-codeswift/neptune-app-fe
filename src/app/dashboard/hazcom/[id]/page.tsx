import { redirect } from "next/navigation";

export default async function HazcomDashboardDetailStubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/hazcom/chemicals/${encodeURIComponent(id)}`);
}
