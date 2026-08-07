"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_SDS_SECTIONS,
  HazcomBadge,
  HazcomErrorCard,
  HazcomGlassCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPictogramChip,
  sdsStatusTone,
} from "@/components/hazcom/shared";
import { SdsViewerSectionNav } from "@/components/hazcom/sds/SdsViewerSectionNav";
import { useSdsDetailQuery } from "@/hooks/use-hazcom-queries";

const FIRST_SECTION_NUMBER = 1;
const LAST_SECTION_NUMBER = 16;
const DEFAULT_SECTION_NUMBER = 2;
/** GHS section 2 is Hazard Identification — where the statements belong. */
const HAZARD_IDENTIFICATION_SECTION = 2;
const SDS_LIBRARY_ROUTE = "/dashboard/hazcom/sds";

export type SdsViewerPageClientProps = Readonly<{
  sdsIdParam: string;
}>;

export function SdsViewerPageClient(props: Readonly<SdsViewerPageClientProps>) {
  const { sdsIdParam } = props;
  const { detail, statements, isLoading, errorMessage, isNotFound, refetch } =
    useSdsDetailQuery(sdsIdParam);
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION_NUMBER);

  const containerClass =
    "flex min-h-screen min-w-0 flex-1 flex-col gap-4 px-3 pt-4 pb-8 sm:px-4";

  if (isLoading || errorMessage || isNotFound || !detail) {
    return (
      <div className={containerClass}>
        <HazcomModuleTabs />

        <HazcomPageHeader
          breadcrumb={["Safety", "HazCom", "SDS Library", sdsIdParam]}
          title="SDS Viewer"
        />

        {isLoading ? (
          <HazcomLoadingCard message="Loading SDS record…" variant="detail" />
        ) : null}

        {!isLoading && errorMessage ? (
          <HazcomErrorCard
            title="Couldn’t load this SDS record"
            message={errorMessage}
            onRetry={refetch}
          />
        ) : null}

        {!isLoading && !errorMessage ? (
          <HazcomGlassCard
            className="min-h-[280px] text-center"
            hazcomGlassCardClassName="items-center justify-center gap-2"
          >
            <Icon
              icon="mdi:file-question-outline"
              className="text-ehs-muted-text size-9"
              aria-hidden="true"
            />
            <Text as="p" className="text-ehs-darker text-sm font-bold">
              SDS record not found
            </Text>
            <Text as="p" className="text-ehs-muted-text max-w-md text-sm">
              {`No SDS record exists for ID "${sdsIdParam}". It may have been removed, or the link is incorrect.`}
            </Text>
            <Link href={SDS_LIBRARY_ROUTE}>
              <Button type="button" variant="secondary" className="mt-1">
                <Icon
                  icon="mdi:arrow-left"
                  className="text-base"
                  aria-hidden="true"
                />
                Back to SDS Library
              </Button>
            </Link>
          </HazcomGlassCard>
        ) : null}
      </div>
    );
  }

  const { record, pdfUrl } = detail;
  const section =
    HAZCOM_SDS_SECTIONS.find((item) => item.number === activeSection) ??
    HAZCOM_SDS_SECTIONS[0];
  const isFirstSection = activeSection <= FIRST_SECTION_NUMBER;
  const isLastSection = activeSection >= LAST_SECTION_NUMBER;
  const showsStatements = section.number === HAZARD_IDENTIFICATION_SECTION;

  return (
    <div className={containerClass}>
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "SDS Library", record.chemicalName]}
        title={`SDS Viewer — ${record.chemicalName}`}
        subtitle={[
          record.manufacturer,
          record.version,
          record.revisedOn ? `Revised ${record.revisedOn}` : "",
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <>
            <Button
              type="button"
              variant="tertiary"
              onClick={() => window.print()}
            >
              <Icon
                icon="mdi:printer-outline"
                className="text-base"
                aria-hidden="true"
              />
              Print
            </Button>
            {/* The record stores a URL; with no PDF attached there is
                nothing to download. */}
            {pdfUrl ? (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="primary">
                  <Icon
                    icon="mdi:tray-arrow-down"
                    className="text-base"
                    aria-hidden="true"
                  />
                  Download PDF
                </Button>
              </a>
            ) : (
              <Button type="button" variant="primary" disabled>
                <Icon
                  icon="mdi:tray-arrow-down"
                  className="text-base"
                  aria-hidden="true"
                />
                No PDF attached
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <SdsViewerSectionNav
          sections={HAZCOM_SDS_SECTIONS}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        <HazcomGlassCard
          paddingClassName="p-6"
          className="min-h-[520px]"
          hazcomGlassCardClassName="justify-between gap-6"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                {record.pictograms.map((pictogram) => (
                  <HazcomPictogramChip key={pictogram} pictogram={pictogram} />
                ))}
              </div>

              <div className="flex flex-col gap-0.5">
                <Text as="p" className="text-ehs-darker text-[15px] font-bold">
                  {record.chemicalName}
                </Text>
                <Text as="p" className="text-ehs-muted-text text-[12px]">
                  {[
                    record.casNumber ? `CAS ${record.casNumber}` : "",
                    record.manufacturer,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </div>

              <Text
                as="span"
                className={[
                  "text-[13px] font-bold uppercase",
                  record.signalWord === "Danger"
                    ? "text-ehs-red"
                    : "text-ehs-yellow",
                ].join(" ")}
              >
                {record.signalWord}
              </Text>

              <HazcomBadge
                label={record.status}
                tone={sdsStatusTone(record.status)}
                showDot
              />
            </div>

            <div className="border-ehs-border border-t pt-5">
              <Text as="h2" className="text-ehs-darker text-[17px] font-bold">
                {`${String(section.number)} - ${section.title}`}
              </Text>

              {/*
                Only the GHS statements come from the API — it stores a PDF
                URL and metadata, not the 16 section bodies. Section 2 renders
                the record's real statements; the rest keep the standard
                section scaffold text until a body endpoint exists.
              */}
              {showsStatements ? (
                <div className="mt-3 flex flex-col gap-2.5">
                  {statements.length === 0 ? (
                    <Text as="p" className="text-ehs-muted-text text-[13px]">
                      No GHS statements recorded on this sheet.
                    </Text>
                  ) : (
                    statements.map((statement) => (
                      <div
                        key={statement.code}
                        className="flex items-start gap-2.5"
                      >
                        <HazcomBadge
                          label={statement.code}
                          tone={
                            statement.code.toUpperCase().startsWith("H")
                              ? "danger"
                              : "warn"
                          }
                          className="mt-0.5 shrink-0"
                        />
                        <Text
                          as="p"
                          className="text-ehs-gray text-[13px] leading-[21px]"
                        >
                          {statement.text || statement.code}
                        </Text>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph, index) => (
                    <Text
                      key={`${String(section.number)}-${String(index)}`}
                      as="p"
                      className="text-ehs-gray text-[13px] leading-[21px]"
                    >
                      {paragraph}
                    </Text>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="tertiary"
              disabled={isFirstSection}
              onClick={() =>
                setActiveSection((current) =>
                  Math.max(FIRST_SECTION_NUMBER, current - 1),
                )
              }
            >
              <Icon
                icon="mdi:chevron-left"
                className="text-base"
                aria-hidden="true"
              />
              Previous Section
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isLastSection}
              onClick={() =>
                setActiveSection((current) =>
                  Math.min(LAST_SECTION_NUMBER, current + 1),
                )
              }
            >
              Next Section
              <Icon
                icon="mdi:chevron-right"
                className="text-base"
                aria-hidden="true"
              />
            </Button>
          </div>
        </HazcomGlassCard>
      </div>
    </div>
  );
}
