"use client";

import {
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
} from "@/components/hazcom/shared";
import { ChemicalForm } from "@/components/hazcom/chemicals/ChemicalForm";
import { ChemicalNotFound } from "@/components/hazcom/chemicals/ChemicalNotFound";
import { useChemicalDetailQuery } from "@/hooks/use-hazcom-queries";

export type ChemicalEditViewProps = Readonly<{
  chemicalIdParam: string;
  className?: string;
}>;

const BREADCRUMB = ["Safety", "HazCom", "Chemical Inventory", "Edit"];

export function ChemicalEditView(props: Readonly<ChemicalEditViewProps>) {
  const { chemicalIdParam, className = "" } = props;
  const { chemical, isLoading, errorMessage, isNotFound, refetch } =
    useChemicalDetailQuery(chemicalIdParam);

  return (
    <div
      className={["flex min-w-0 flex-col gap-5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={BREADCRUMB}
        title={chemical ? `Edit Chemical — ${chemical.name}` : "Edit Chemical"}
        subtitle={
          chemical
            ? "Update this chemical's inventory record"
            : "Loading the chemical record…"
        }
      />

      {isLoading ? <HazcomLoadingCard message="Loading chemical…" /> : null}

      {!isLoading && errorMessage ? (
        <HazcomErrorCard
          title="Couldn’t load this chemical"
          message={errorMessage}
          onRetry={refetch}
        />
      ) : null}

      {!isLoading && !errorMessage && isNotFound ? (
        <ChemicalNotFound chemicalId={chemicalIdParam} />
      ) : null}

      {/*
        The form seeds its fields from props on mount, so it is rendered only
        once the record is in hand — mounting it earlier would leave every
        input blank.
      */}
      {chemical ? (
        <ChemicalForm key={chemical.id} mode="edit" chemical={chemical} />
      ) : null}
    </div>
  );
}
