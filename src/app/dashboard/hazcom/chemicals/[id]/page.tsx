import { ChemicalDetailView } from "@/components/hazcom/chemicals";

export default async function HazcomChemicalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ChemicalDetailView chemicalIdParam={decodeURIComponent(id)} />;
}
