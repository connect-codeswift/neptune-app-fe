import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HazcomBadge,
  HazcomGlassCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPictogramChip,
  chemicalStatusTone,
  findHazcomChemical,
  type HazcomStatementCode,
} from "@/components/hazcom/shared";
import { ChemicalNotFound } from "@/components/hazcom/chemicals/ChemicalNotFound";

export type ChemicalDetailViewProps = Readonly<{
  chemicalIdParam: string;
  className?: string;
}>;

export function ChemicalDetailView(props: Readonly<ChemicalDetailViewProps>) {
  const { chemicalIdParam, className = "" } = props;
  const chemical = findHazcomChemical(chemicalIdParam);

  if (!chemical) {
    return (
      <div
        className={["flex min-w-0 flex-col gap-5", className]
          .filter(Boolean)
          .join(" ")}
      >
        <HazcomModuleTabs />
        <HazcomPageHeader
          breadcrumb={["Safety", "HazCom", "Chemical Inventory", "Not Found"]}
          title="Chemical Not Found"
        />
        <ChemicalNotFound chemicalId={chemicalIdParam} />
      </div>
    );
  }

  const sdsValue: ReactNode =
    chemical.sdsFileName && chemical.sdsRecordId ? (
      <Link
        href={`/hazcom/sds/${chemical.sdsRecordId}`}
        className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover inline-flex items-center gap-1.5 font-semibold underline underline-offset-2"
      >
        <Icon
          icon="mdi:file-document-outline"
          className="size-3.5"
          aria-hidden="true"
        />
        {chemical.sdsFileName}
      </Link>
    ) : (
      <Text as="span" className="text-ehs-muted-text">
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
            <Link href={`/hazcom/chemicals/${chemical.id}/edit`}>
              <Button
                type="button"
                variant="tertiary"
                className="rounded-lg px-4 py-2 text-[13px]"
              >
                <Icon
                  icon="mdi:pencil-outline"
                  className="text-base"
                  aria-hidden="true"
                />
                Edit
              </Button>
            </Link>
            <Link href="/hazcom/labels">
              <Button
                type="button"
                variant="primary"
                className="rounded-lg px-4 py-2 text-[13px]"
              >
                <Icon
                  icon="mdi:printer-outline"
                  className="text-base"
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
            <Text as="h2" className="text-ehs-darker mb-3 text-[15px] font-bold">
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
            <Text as="h2" className="text-ehs-darker mb-3 text-[15px] font-bold">
              Storage &amp; Additional Information
            </Text>
            <Text
              as="p"
              className="text-ehs-muted-text mb-2 text-[11px] font-bold tracking-[0.6px] uppercase"
            >
              Storage &amp; Handling Notes
            </Text>
            <div className="border-ehs-border rounded-[10px] border bg-white/60 p-3.5">
              <Text
                as="p"
                className="text-ehs-darker text-[13px] leading-[19.5px]"
              >
                {chemical.storageNotes}
              </Text>
            </div>
          </HazcomGlassCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <HazcomGlassCard>
            <Text as="h2" className="text-ehs-darker mb-1 text-[15px] font-bold">
              GHS Hazard Identification
            </Text>
            <Text
              as="p"
              className="text-ehs-muted-text mb-3 text-[11px] font-bold tracking-[0.6px] uppercase"
            >
              Associated GHS Pictograms
            </Text>
            <div className="flex flex-wrap gap-2">
              {chemical.pictograms.map((pictogram) => (
                <HazcomPictogramChip
                  key={pictogram}
                  pictogram={pictogram}
                  selected
                />
              ))}
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
      <dt className="text-ehs-muted-text shrink-0 text-[13px]">{label}</dt>
      <dd className="text-ehs-darker text-right text-[13px] font-semibold">
        {value}
      </dd>
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
      <Text as="h2" className="text-ehs-darker mb-3 text-[15px] font-bold">
        {title}
      </Text>
      <div className="flex flex-col gap-2.5">
        {statements.map((statement) => (
          <div key={statement.code} className="flex items-start gap-2.5">
            <HazcomBadge
              label={statement.code}
              tone={tone}
              className="mt-0.5 shrink-0"
            />
            <Text
              as="p"
              className="text-ehs-darker text-[13px] leading-[19.5px]"
            >
              {statement.text}
            </Text>
          </div>
        ))}
      </div>
    </HazcomGlassCard>
  );
}
