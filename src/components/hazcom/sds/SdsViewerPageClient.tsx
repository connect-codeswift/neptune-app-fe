"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import {
  HAZCOM_SDS_SECTIONS,
  HazcomBadge,
  type HazcomSdsRecord,
  type HazcomStatementCode,
} from "@/components/hazcom/shared";
import { SdsDetailHeader } from "@/components/hazcom/sds/SdsDetailHeader";
import { SdsViewerSectionNav } from "@/components/hazcom/sds/SdsViewerSectionNav";
import { useSdsDetailQuery } from "@/hooks/use-hazcom-queries";

const FIRST_SECTION_NUMBER = 1;
const LAST_SECTION_NUMBER = 16;
const DEFAULT_SECTION_NUMBER = 2;
/** GHS section 2 is Hazard Identification — where the statements belong. */
const HAZARD_IDENTIFICATION_SECTION = 2;
const SDS_LIBRARY_HREF = "/dashboard/hazcom/sds";
const sectionHeadingClass = "text3 text-ehs-darker";

export type SdsViewerPageClientProps = Readonly<{
  sdsIdParam: string;
  className?: string;
}>;

function SdsViewerBody(
  props: Readonly<{
    record: HazcomSdsRecord;
    pdfUrl: string;
    statements: readonly HazcomStatementCode[];
  }>,
) {
  const { record, pdfUrl, statements } = props;
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION_NUMBER);

  const section =
    HAZCOM_SDS_SECTIONS.find((item) => item.number === activeSection) ??
    HAZCOM_SDS_SECTIONS[0];
  const isFirstSection = activeSection <= FIRST_SECTION_NUMBER;
  const isLastSection = activeSection >= LAST_SECTION_NUMBER;
  const showsStatements = section.number === HAZARD_IDENTIFICATION_SECTION;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <SdsDetailHeader record={record} pdfUrl={pdfUrl || null} />

      <div className="grid min-w-0 grid-cols-1 items-start gap-3.5 lg:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)]">
        <SdsViewerSectionNav
          sections={HAZCOM_SDS_SECTIONS}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        <IncidentGlassCard
          paddingClassName="p-4 sm:p-5"
          className="h-fit min-w-0"
          incidentGlassCardClassName="gap-5"
        >
          <div className="flex min-w-0 flex-col gap-4">
            <Text as="h2" className={sectionHeadingClass}>
              {`${String(section.number)} – ${section.title}`}
            </Text>

            {/*
              Only the GHS statements come from the API — it stores a PDF
              URL and metadata, not the 16 section bodies. Section 2 renders
              the record's real statements; the rest keep the standard
              section scaffold text until a body endpoint exists.
            */}
            {showsStatements ? (
              <div className="flex flex-col gap-2.5">
                {statements.length === 0 ? (
                  <Text as="p" className="text4 text-ehs-muted-text">
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
                      <Text as="p" className="text4 text-ehs-darker">
                        {statement.text || statement.code}
                      </Text>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/*
                  Labelled explicitly. The scaffold below describes what the
                  standard requires this section to cover; it is not this
                  product's own text. The attached PDF is the authoritative sheet.
                */}
                <div className="border-ehs-yellow/40 bg-ehs-yellow/8 rounded-2.5 flex items-start gap-2 border px-3 py-2.5">
                  <Icon
                    icon="mdi:information-outline"
                    className="text-ehs-yellow mt-px size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <Text as="p" className="text8 text-ehs-gray">
                    This section isn’t stored on the record — what follows
                    describes what the GHS standard requires here. Refer to the
                    attached PDF for this product’s own text.
                  </Text>
                </div>

                {section.body.map((paragraph, index) => (
                  <Text
                    key={`${String(section.number)}-${String(index)}`}
                    as="p"
                    className="text4 text-ehs-gray"
                  >
                    {paragraph}
                  </Text>
                ))}
              </div>
            )}
          </div>

          <div className="border-ehs-border flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <Button
              type="button"
              variant="tertiary"
              disabled={isFirstSection}
              onClick={() =>
                setActiveSection((current) =>
                  Math.max(FIRST_SECTION_NUMBER, current - 1),
                )
              }
              className="text4 rounded-2.5 h-9 px-3"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-4"
                aria-hidden="true"
              />
              Previous
            </Button>
            <Text as="span" className="text8 text-ehs-muted-text tabular-nums">
              {`${String(activeSection)} / ${String(LAST_SECTION_NUMBER)}`}
            </Text>
            <Button
              type="button"
              variant="primary"
              disabled={isLastSection}
              onClick={() =>
                setActiveSection((current) =>
                  Math.min(LAST_SECTION_NUMBER, current + 1),
                )
              }
              className="text4 rounded-2.5 h-9 px-3"
            >
              Next
              <Icon
                icon="mdi:chevron-right"
                className="size-4"
                aria-hidden="true"
              />
            </Button>
          </div>
        </IncidentGlassCard>
      </div>
    </div>
  );
}

export function SdsViewerPageClient(props: Readonly<SdsViewerPageClientProps>) {
  const { sdsIdParam, className = "" } = props;
  const { detail, statements, isLoading, errorMessage, isNotFound, refetch } =
    useSdsDetailQuery(sdsIdParam);

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
            Couldn’t load this SDS record
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

  if (isNotFound || !detail) {
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
              className="size-2.75 shrink-0 text-ehs-muted-text"
              aria-hidden="true"
            />
            <Link
              href={SDS_LIBRARY_HREF}
              className="text8 text-ehs-muted-text hover:text-ehs-gray transition-colors"
            >
              SDS Library
            </Link>
            <Icon
              icon="mdi:chevron-right"
              className="size-2.75 shrink-0 text-ehs-muted-text"
              aria-hidden="true"
            />
            <Text as="span" className="text8 text-ehs-muted-text">
              Not Found
            </Text>
          </nav>
          <Text as="h1" className="text1 text-ehs-darker">
            SDS Record Not Found
          </Text>
        </IncidentGlassCard>

        <IncidentGlassCard
          paddingClassName="p-6"
          className="min-w-0"
          incidentGlassCardClassName="items-center justify-center gap-2 text-center"
        >
          <Icon
            icon="mdi:file-question-outline"
            className="text-ehs-muted-text size-9"
            aria-hidden="true"
          />
          <Text as="p" className="text4 text-ehs-muted-text max-w-md">
            {`No SDS record exists for ID "${sdsIdParam}". It may have been removed, or the link is incorrect.`}
          </Text>
          <Link href={SDS_LIBRARY_HREF}>
            <Button type="button" variant="secondary" className="mt-1">
              <Icon
                icon="mdi:arrow-left"
                className="size-4"
                aria-hidden="true"
              />
              Back to SDS Library
            </Button>
          </Link>
        </IncidentGlassCard>
      </div>
    );
  }

  return (
    <div className={[shellClass, "min-h-0"].join(" ")}>
      <SdsViewerBody
        record={detail.record}
        pdfUrl={detail.pdfUrl}
        statements={statements}
      />
    </div>
  );
}
