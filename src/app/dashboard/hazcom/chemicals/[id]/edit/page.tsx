import { ChemicalEditView } from "@/components/hazcom/chemicals";

export default async function HazcomChemicalEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ChemicalEditView chemicalIdParam={decodeURIComponent(id)} />;
}
