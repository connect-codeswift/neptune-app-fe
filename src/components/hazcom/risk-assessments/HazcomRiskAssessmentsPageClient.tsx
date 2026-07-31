"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_RISK_ASSESSMENTS,
  HazcomModuleTabs,
  HazcomPageHeader,
} from "@/components/hazcom/shared";
import { HazcomRiskAssessmentsTable } from "@/components/hazcom/risk-assessments/HazcomRiskAssessmentsTable";

export function HazcomRiskAssessmentsPageClient() {
  const [search, setSearch] = useState("");

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return HAZCOM_RISK_ASSESSMENTS;
    }

    return HAZCOM_RISK_ASSESSMENTS.filter((assessment) =>
      [
        assessment.id,
        assessment.chemical,
        assessment.exposureScenario,
        assessment.reviewer,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Risk Assessments"]}
        title="Chemical Risk Assessments"
        subtitle="All risk assessments for chemical exposure scenarios"
        actions={
          <Link href="/dashboard/hazcom/risk-assessments/new">
            <Button type="button" variant="primary">
              <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
              New Assessment
            </Button>
          </Link>
        }
      />

      <div className="border-ehs-border flex items-center gap-2 rounded-2xl border bg-white/70 px-4 py-3">
        <Icon
          icon="mdi:magnify"
          className="text-ehs-muted-text text-base"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by chemical, scenario, or reviewer…"
          aria-label="Search risk assessments"
          className="text-ehs-darker placeholder:text-ehs-muted-text w-full min-w-0 bg-transparent text-[13px] outline-none"
        />
        <Text
          as="span"
          className="text-ehs-muted-text hidden shrink-0 text-xs sm:inline"
        >
          {`${filteredAssessments.length} assessment${filteredAssessments.length === 1 ? "" : "s"}`}
        </Text>
      </div>

      <HazcomRiskAssessmentsTable assessments={filteredAssessments} />
    </div>
  );
}
