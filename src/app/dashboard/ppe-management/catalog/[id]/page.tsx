import { PpeCatalogDetailPageClient } from "@/components/ppe/catalog/PpeCatalogDetailPageClient";

export type PpeCatalogDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function PpeCatalogDetailPage(
  props: PpeCatalogDetailPageProps,
) {
  const { id } = await props.params;

  return <PpeCatalogDetailPageClient itemId={decodeURIComponent(id)} />;
}
