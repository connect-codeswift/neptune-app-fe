"use client";

import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { SkeletonFormPage } from "@/components/ui/skeletons";
import { ChemicalEditHeader } from "@/components/hazcom/chemicals/ChemicalEditHeader";
import { ChemicalForm } from "@/components/hazcom/chemicals/ChemicalForm";
import { ChemicalNotFound } from "@/components/hazcom/chemicals/ChemicalNotFound";
import { useChemicalDetailQuery } from "@/hooks/use-hazcom-queries";

export type ChemicalEditViewProps = Readonly<{
  chemicalIdParam: string;
  className?: string;
}>;

export function ChemicalEditView(props: Readonly<ChemicalEditViewProps>) {
  const { chemicalIdParam, className = "" } = props;
  const { chemical, isLoading, errorMessage, isNotFound, refetch } =
    useChemicalDetailQuery(chemicalIdParam);

  const shellClass = [
    "flex min-h-0 min-w-0 flex-1 flex-col gap-3.5 px-4 pt-4 pb-8",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <div className={shellClass}>
        <ChemicalEditHeader />
        <div className="mx-auto w-full max-w-4xl">
          <SkeletonFormPage fields={8} />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={shellClass}>
        <ChemicalEditHeader />
        <div className="mx-auto w-full max-w-4xl">
          <IncidentGlassCard
            paddingClassName="p-6"
            className="min-w-0"
            incidentGlassCardClassName="items-start gap-2"
          >
            <Text as="h2" className="text3 text-ehs-darker">
              Couldn’t load this chemical
            </Text>
            <Text as="p" className="text4 text-ehs-muted-text">
              {errorMessage}
            </Text>
            <Button
              type="button"
              variant="secondary"
              onClick={refetch}
              className="text4 rounded-2.5 mt-1 px-4 py-2"
            >
              Retry
            </Button>
          </IncidentGlassCard>
        </div>
      </div>
    );
  }

  if (isNotFound || !chemical) {
    return (
      <div className={shellClass}>
        <ChemicalEditHeader chemicalId={chemicalIdParam} />
        <div className="mx-auto w-full max-w-4xl">
          <ChemicalNotFound chemicalId={chemicalIdParam} />
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <ChemicalEditHeader
        chemicalId={chemical.id}
        chemicalName={chemical.name}
      />

      {/*
        The form seeds its fields from props on mount, so it is rendered only
        once the record is in hand — mounting it earlier would leave every
        input blank.
      */}
      <div className="mx-auto w-full max-w-4xl">
        <ChemicalForm key={chemical.id} mode="edit" chemical={chemical} />
      </div>
    </div>
  );
}
