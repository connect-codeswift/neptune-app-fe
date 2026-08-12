"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HazcomBadge,
  HazcomErrorCard,
  HazcomGlassCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPictogramChip,
  chemicalStatusTone,
  type HazcomStatementCode,
} from "@/components/hazcom/shared";
import { ChemicalNotFound } from "@/components/hazcom/chemicals/ChemicalNotFound";
import { useChemicalDetailQuery } from "@/hooks/use-hazcom-queries";

export type ChemicalDetailViewProps = Readonly<{
  chemicalIdParam: string;
  className?: string;
}>;

export function ChemicalDetailView(props: Readonly<ChemicalDetailViewProps>) {
  const { chemicalIdParam, className = "" } = props;
  const { chemical, isLoading, errorMessage, isNotFound, refetch } =
    useChemicalDetailQuery(chemicalIdParam);

  const containerClass = ["flex min-w-0 flex-col gap-5", className]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <div className={containerClass}>
        <HazcomModuleTabs />
        <HazcomPageHeader
          breadcrumb={["Safety", "HazCom", "Chemical Inventory"]}
          title="Chemical"
        />
        <HazcomLoadingCard message="Loading chemical…" variant="detail" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={containerClass}>
        <HazcomModuleTabs />
        <HazcomPageHeader
          breadcrumb={["Safety", "HazCom", "Chemical Inventory"]}
          title="Chemical"
        />
        <HazcomErrorCard
          title="Couldn’t load this chemical"
          message={errorMessage}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (isNotFound || !chemical) {
    return (
      <div className={containerClass}>
        <HazcomModuleTabs />
        <HazcomPageHeader
          breadcrumb={["Safety", "HazCom", "Chemical Inventory", "Not Found"]}
          title="Chemical Not Found"
        />
        <ChemicalNotFound chemicalId={chemicalIdParam} />
      </div>
    );
  }

  /**
   * `linkToSdsRecord` is free text on the wire (a file name or URL), so it
   * only becomes a link when the row also carries an SDS id to point at.
   */
  const sdsValue: ReactNode = chemical.sdsFileName ? (
    chemical.sdsRecordId ? (
      <Link
        href={`/dashboard/hazcom/sds/${chemical.sdsRecordId}`}
        className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover inline-flex items-center gap-1.5 underline underline-offset-2"
      >
        <Icon
          icon="mdi:file-document-outline"
          className="size-3.5"
          aria-hidden="true"
        />
        {chemical.sdsFileName}
      </Link>
    ) : (
      <span className="inline-flex items-center gap-1.5">
        <Icon
          icon="mdi:file-document-outline"
          className="text-ehs-muted-text size-3.5"
          aria-hidden="true"
        />
        {chemical.sdsFileName}
      </span>
    )
  ) : (
    <Text as="span" className="text4 text-ehs-muted-text">
      Not linked
    </Text>
  );

  return (
    <div
      className={["flex min-w-0 flex-col gap-5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Chemical Inventory", chemical.name]}
        title={chemical.name}
        subtitle={`CAS ${chemical.casNumber} · ${chemical.hazardClass} · ${chemical.location}`}
        actions={
          <>
            <Link href={`/dashboard/hazcom/chemicals/${chemical.id}/edit`}>
              <Button
                type="button"
                variant="tertiary"
                className="text4 rounded-lg px-4 py-2"
              >
                <Icon
                  icon="mdi:pencil-outline"
                  className="size-4"
                  aria-hidden="true"
                />
                Edit
              </Button>
            </Link>
            <Link href="/dashboard/hazcom/labels">
              <Button
                type="button"
                variant="primary"
                className="text4 rounded-lg px-4 py-2"
              >
                <Icon
                  icon="mdi:printer-outline"
                  className="size-4"
                  aria-hidden="true"
                />
                Generate Label
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-5">
          <HazcomGlassCard>
            <Text
              as="h2"
              className="text3 text-ehs-darker mb-3"
            >
              Inventory Details
            </Text>
            <dl className="flex flex-col">
              <DetailRow
                label="Chemical / Substance Name"
                value={chemical.name}
              />
              <DetailRow label="CAS Number" value={chemical.casNumber} />
              <DetailRow label="Hazard Class" value={chemical.hazardClass} />
              <DetailRow
                label="Location / Work Area"
                value={chemical.location}
              />
              <DetailRow
                label="Dispose Location"
                value={chemical.disposeLocation ?? "Not recorded"}
              />
              <DetailRow label="Current Quantity" value={chemical.quantity} />
              <DetailRow label="GHS Signal Word" value={chemical.signalWord} />
              <DetailRow label="Link to SDS Record" value={sdsValue} />
              <DetailRow
                label="Status"
                value={
                  <HazcomBadge
                    label={chemical.status}
                    tone={chemicalStatusTone(chemical.status)}
                  />
                }
                isLast
              />
            </dl>
          </HazcomGlassCard>

          <HazcomGlassCard>
            <Text
              as="h2"
              className="text3 text-ehs-darker mb-3"
            >
              Storage &amp; Additional Information
            </Text>
            <Text
              as="p"
              className="text6 text-ehs-muted-text mb-2"
            >
              Storage &amp; Handling Notes
            </Text>
            <div className="border-ehs-border rounded-2.5 border bg-white/60 p-3.5">
              <Text
                as="p"
                className={
                  chemical.storageNotes
                    ? "text4 text-ehs-darker"
                    : "text4 text-ehs-muted-text"
                }
              >
                {chemical.storageNotes || "No notes recorded."}
              </Text>
            </div>
          </HazcomGlassCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <HazcomGlassCard>
            <Text
              as="h2"
              className="text3 text-ehs-darker mb-1"
            >
              GHS Hazard Identification
            </Text>
            <Text as="p" className="text6 text-ehs-muted-text mb-3">
              Associated GHS Pictograms
            </Text>
            <div className="flex flex-wrap gap-2">
              {chemical.pictograms.length === 0 ? (
                <Text as="p" className="text4 text-ehs-muted-text">
                  No pictograms recorded.
                </Text>
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
          </HazcomGlassCard>

          <StatementsCard
            title="Hazard Statements (H-Codes)"
            tone="danger"
            statements={chemical.hazardStatements}
          />
          <StatementsCard
            title="Precautionary Statements (P-Codes)"
            tone="warn"
            statements={chemical.precautionaryStatements}
          />
        </div>
      </div>
    </div>
  );
}

type DetailRowProps = Readonly<{
  label: string;
  value: ReactNode;
  isLast?: boolean;
}>;

function DetailRow(props: Readonly<DetailRowProps>) {
  const { label, value, isLast = false } = props;

  return (
    <div
      className={[
        "flex items-center justify-between gap-4 py-2.5",
        isLast ? "" : "border-b border-[rgba(15,23,42,0.06)]",
      ].join(" ")}
    >
      <dt className="text8 text-ehs-muted-text shrink-0">{label}</dt>
      <dd className="text4 text-ehs-darker text-right">{value}</dd>
    </div>
  );
}

type StatementsCardProps = Readonly<{
  title: string;
  tone: "danger" | "warn";
  statements: readonly HazcomStatementCode[];
}>;

function StatementsCard(props: Readonly<StatementsCardProps>) {
  const { title, tone, statements } = props;

  return (
    <HazcomGlassCard>
      <Text as="h2" className="text3 text-ehs-darker mb-3">
        {title}
      </Text>
      <div className="flex flex-col gap-2.5">
        {/*
          GET /chemical/{id} returns no statement lists today — the schema has
          no field for them — so this is the usual case, not an edge case.
        */}
        {statements.length === 0 ? (
          <Text as="p" className="text4 text-ehs-muted-text">
            None recorded for this chemical.
          </Text>
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
    </HazcomGlassCard>
  );
}
