"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { HazcomRiskAssessmentForm } from "@/components/hazcom/risk-assessments/HazcomRiskAssessmentForm";
import { HazcomRiskLevelOutput } from "@/components/hazcom/risk-assessments/HazcomRiskLevelOutput";
import {
  INITIAL_RISK_ASSESSMENT_FORM_STATE,
  type HazcomRiskAssessmentFormState,
} from "@/components/hazcom/risk-assessments/risk-assessment-form-state";

const ASSESSMENTS_HREF = "/dashboard/hazcom/risk-assessments";

const crumbMuted = "text8 text-ehs-muted-text";
const crumbLink =
  "text8 text-ehs-muted-text hover:text-ehs-gray transition-colors";

/**
 * New Risk Assessment — detail-style header + form / live score rail
 * (same shell as Training Log “new” / Chemical edit).
 */
export function HazcomNewRiskAssessmentPageClient() {
  const [form, setForm] = useState<HazcomRiskAssessmentFormState>(
    INITIAL_RISK_ASSESSMENT_FORM_STATE,
  );

  const updateForm = (patch: Partial<HazcomRiskAssessmentFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pt-4 pb-6 sm:gap-5 sm:px-4 sm:pb-8">
        <div className="rounded-4 backdrop-blur-2.5 before:rounded-4 relative flex w-full min-w-0 flex-col gap-1.5 border-b border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] px-3.5 py-3.5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-5.5">
          <nav
            aria-label="Breadcrumb"
            className="relative z-1 hidden min-w-0 flex-wrap items-center gap-1 md:flex"
          >
            <span className={crumbMuted}>Safety</span>
            <Icon
              icon="mdi:chevron-right"
              className="size-2.75 shrink-0 text-[#8892a3]"
              aria-hidden="true"
            />
            <Link href="/dashboard/hazcom/overview" className={crumbLink}>
              HazCom
            </Link>
            <Icon
              icon="mdi:chevron-right"
              className="size-2.75 shrink-0 text-[#8892a3]"
              aria-hidden="true"
            />
            <Link href={ASSESSMENTS_HREF} className={crumbLink}>
              Reports
            </Link>
            <Icon
              icon="mdi:chevron-right"
              className="size-2.75 shrink-0 text-[#8892a3]"
              aria-hidden="true"
            />
            <span className={crumbMuted}>New</span>
          </nav>

          <div className="relative z-1 flex min-w-0 items-start gap-2">
            <Link
              href={ASSESSMENTS_HREF}
              aria-label="Back to Reports"
              className="border-ehs-border text-ehs-dark-bg rounded-2.5 flex size-8 shrink-0 items-center justify-center border bg-white transition-colors hover:bg-slate-50 md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>

            <div className="flex min-w-0 flex-col gap-0.5">
              <Text as="h1" className="text1 text-ehs-darker">
                New Risk Assessment
              </Text>
              <Text as="p" className="text8 text-ehs-muted-text">
                Rate exposure hazards, recommend PPE, and submit for review
              </Text>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)]">
          <HazcomRiskAssessmentForm values={form} onChange={updateForm} />
          <HazcomRiskLevelOutput
            ratings={form.ratings}
            ppe={form.ppe}
            className="xl:sticky xl:top-4"
          />
        </div>
      </div>
    </div>
  );
}
