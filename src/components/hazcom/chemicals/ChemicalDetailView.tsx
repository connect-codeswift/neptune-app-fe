"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import {
  HazcomBadge,
  HazcomPictogramChip,
  type HazcomChemical,
  type HazcomStatementCode,
} from "@/components/hazcom/shared";
import { ChemicalDetailHeader } from "@/components/hazcom/chemicals/ChemicalDetailHeader";
import { ChemicalNotFound } from "@/components/hazcom/chemicals/ChemicalNotFound";
import { useChemicalDetailQuery } from "@/hooks/use-hazcom-queries";

export type ChemicalDetailViewProps = Readonly<{
  chemicalIdParam: string;
  className?: string;
}>;

const CHEMICALS_HREF = "/dashboard/hazcom/chemicals";
const sectionHeadingClass = "text3 text-ehs-darker";

function MetaField(props: Readonly<{ label: string; value: ReactNode }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      <div className="text4 text-ehs-darker min-w-0">{value}</div>
    </div>
  );
}

function SdsLink(props: Readonly<{ chemical: HazcomChemical }>) {
  const { chemical } = props;

  if (!chemical.sdsFileName) {
    return (
      <Text as="span" className="text4 text-ehs-muted-text">
        Not linked
      </Text>
    );
  }

  if (chemical.sdsRecordId) {
    return (
      <Link
        href={`/dashboard/hazcom/sds/${encodeURIComponent(chemical.sdsRecordId)}`}
        className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover inline-flex min-w-0 items-center gap-1.5 underline underline-offset-2"
      >
        <Icon
          icon="mdi:file-document-outline"
          className="size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span className="truncate">{chemical.sdsFileName}</span>
      </Link>
    );
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon
        icon="mdi:file-document-outline"
        className="text-ehs-muted-text size-3.5 shrink-0"
        aria-hidden="true"
      />
      <Text as="span" className="text4 text-ehs-darker truncate">
        {chemical.sdsFileName}
      </Text>
    </span>
  );
}

function StatementsCard(
  props: Readonly<{
    title: string;
    tone: "danger" | "warn";
    statements: readonly HazcomStatementCode[];
  }>,
) {
  const { title, tone, statements } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <Text as="h3" className={sectionHeadingClass}>
        {title}
      </Text>
      <div className="flex flex-col gap-2.5">
        {statements.length === 0 ? (
          <EmptyState
            variant="inline"
            icon="mdi:alert-octagon-outline"
            title="No hazard statements recorded"
          />
        ) : null}
        {statements.map((statement) => (
          <div key={statement.code} className="flex items-start gap-2.5">
            <HazcomBadge
              label={statement.code}
              tone={tone}
              className="mt-0.5 shrink-0"
            />
            <Text as="p" className="text4 text-ehs-darker">
              {statement.text}
            </Text>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}

function ChemicalDetailBody(props: Readonly<{ chemical: HazcomChemical }>) {
  const { chemical } = props;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <ChemicalDetailHeader chemical={chemical} />

      <div className="grid min-w-0 grid-rows-[auto_auto] gap-3.5">
        <IncidentGlassCard
          paddingClassName="p-4 sm:p-4.5"
          className="min-w-0"
          incidentGlassCardClassName="gap-3"
        >
          <Text as="h3" className={sectionHeadingClass}>
            Inventory details
          </Text>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
            <MetaField label="CAS number" value={chemical.casNumber || "—"} />
            <MetaField label="Quantity" value={chemical.quantity || "—"} />
            <MetaField label="Location" value={chemical.location || "—"} />
            <MetaField
              label="Dispose location"
              value={chemical.disposeLocation ?? "Not recorded"}
            />
            <MetaField
              label="Hazard class"
              value={chemical.hazardClass || "—"}
            />
            <MetaField label="Signal word" value={chemical.signalWord || "—"} />
            <MetaField label="Added" value={chemical.addedOn || "—"} />
            <MetaField
              label="Chemical ID"
              value={
                <Text as="span" className="text7 text-ehs-muted-text">
                  {chemical.id}
                </Text>
              }
            />
            <MetaField
              label="SDS record"
              value={<SdsLink chemical={chemical} />}
            />
          </div>

          <div className="border-ehs-border border-t pt-3">
            <Text as="p" className="text9 text-ehs-muted-text mb-1.5">
              GHS pictograms
            </Text>
            <div className="flex flex-wrap gap-2">
              {chemical.pictograms.length === 0 ? (
                <EmptyState
                  variant="inline"
                  icon="mdi:hazard-lights"
                  title="No pictograms recorded"
                />
              ) : (
                chemical.pictograms.map((pictogram) => (
                  <HazcomPictogramChip
                    key={pictogram}
                    pictogram={pictogram}
                    selected
                  />
                ))
              )}
            </div>
          </div>

          <div className="border-ehs-border border-t pt-3">
            <Text as="p" className="text9 text-ehs-muted-text mb-1.5">
              Storage &amp; handling
            </Text>
            <Text
              as="p"
              className={[
                "text4",
                chemical.storageNotes
                  ? "text-ehs-darker"
                  : "text-ehs-muted-text",
              ].join(" ")}
            >
              {chemical.storageNotes || "No notes recorded."}
            </Text>
          </div>
        </IncidentGlassCard>

        <div className="grid min-w-0 grid-cols-1 gap-3.5 lg:grid-cols-2">
          <StatementsCard
            title="Hazard statements"
            tone="danger"
            statements={chemical.hazardStatements}
          />
          <StatementsCard
            title="Precautionary statements"
            tone="warn"
            statements={chemical.precautionaryStatements}
          />
        </div>
      </div>
    </div>
  );
}

export function ChemicalDetailView(props: Readonly<ChemicalDetailViewProps>) {
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
        <SkeletonDetailPage />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={shellClass}>
        <IncidentGlassCard
          paddingClassName="p-6"
          className="min-w-0"
          incidentGlassCardClassName="items-start gap-2"
        >
          <Text as="h1" className="text1 text-ehs-darker">
            Couldn’t load this chemical
          </Text>
          <Text as="p" className="text4 text-ehs-muted-text">
            {errorMessage}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={refetch}
            className="mt-2"
          >
            Retry
          </Button>
        </IncidentGlassCard>
      </div>
    );
  }

  if (isNotFound || !chemical) {
    return (
      <div className={shellClass}>
        <IncidentGlassCard
          paddingClassName="px-4 py-3 md:px-5"
          className="min-w-0"
        >
          <nav
            aria-label="Breadcrumb"
            className="mb-1.5 flex min-w-0 flex-wrap items-center gap-1"
          >
            <Text as="span" className="text8 text-ehs-muted-text">
              Safety
            </Text>
            <Icon
              icon="mdi:chevron-right"
              className="text-ehs-muted-text size-2.75 shrink-0"
              aria-hidden="true"
            />
            <Link
              href={CHEMICALS_HREF}
              className="text8 text-ehs-muted-text hover:text-ehs-gray transition-colors"
            >
              Chemical Inventory
            </Link>
            <Icon
              icon="mdi:chevron-right"
              className="text-ehs-muted-text size-2.75 shrink-0"
              aria-hidden="true"
            />
            <Text as="span" className="text8 text-ehs-muted-text">
              Not Found
            </Text>
          </nav>
          <Text as="h1" className="text1 text-ehs-darker">
            Chemical Not Found
          </Text>
        </IncidentGlassCard>
        <ChemicalNotFound chemicalId={chemicalIdParam} />
      </div>
    );
  }

  return (
    <div className={[shellClass, "min-h-0"].join(" ")}>
      <ChemicalDetailBody chemical={chemical} />
    </div>
  );
}
