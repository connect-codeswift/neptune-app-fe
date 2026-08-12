"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  PpeCatalogDetailContent,
  PpeCatalogNotFound,
} from "@/components/ppe/catalog/PpeCatalogDetailContent";
import { PpeCatalogDetailSkeleton } from "@/components/ppe/PpeSkeletons";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { usePpeItemDetailQuery } from "@/hooks/use-ppe-queries";

export type PpeCatalogDetailPageProps = Readonly<{
  itemId: string;
}>;

export function PpeCatalogDetailPageClient(
  props: Readonly<PpeCatalogDetailPageProps>,
) {
  const { itemId } = props;
  const { item, isLoading, errorMessage, isNotFound, refetch } =
    usePpeItemDetailQuery(itemId);

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="PPE Catalog" showSiteSwitcher={false} />

      {isLoading ? <PpeCatalogDetailSkeleton /> : null}

      {!isLoading && errorMessage ? (
        <div className="px-4 pb-8">
          <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
            <Text as="p" className="text5 text-ehs-darker tracking-normal">
              Couldn&apos;t load this PPE item
            </Text>
            <Text as="p" className="text4 text-ehs-muted-text mt-1">
              {errorMessage}
            </Text>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={refetch}
            >
              Try again
            </Button>
          </IncidentGlassCard>
        </div>
      ) : null}

      {!isLoading && !errorMessage && (isNotFound || !item) ? (
        <PpeCatalogNotFound itemId={itemId} />
      ) : null}

      {!isLoading && !errorMessage && item ? (
        <PpeCatalogDetailContent item={item} />
      ) : null}
    </div>
  );
}
