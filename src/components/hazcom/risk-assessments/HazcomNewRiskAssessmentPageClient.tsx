"use client";

import { useState } from "react";
import { HazcomModuleTabs, HazcomPageHeader } from "@/components/hazcom/shared";
import { HazcomRiskAssessmentForm } from "@/components/hazcom/risk-assessments/HazcomRiskAssessmentForm";
import { HazcomRiskLevelOutput } from "@/components/hazcom/risk-assessments/HazcomRiskLevelOutput";
import {
  INITIAL_RISK_ASSESSMENT_FORM_STATE,
  type HazcomRiskAssessmentFormState,
} from "@/components/hazcom/risk-assessments/risk-assessment-form-state";

export function HazcomNewRiskAssessmentPageClient() {
  const [form, setForm] = useState<HazcomRiskAssessmentFormState>(
    INITIAL_RISK_ASSESSMENT_FORM_STATE,
  );

  const updateForm = (patch: Partial<HazcomRiskAssessmentFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Risk Assessments"]}
        title="Chemical Risk Assessments"
        subtitle="All risk assessments for chemical exposure scenarios"
      />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <HazcomRiskAssessmentForm values={form} onChange={updateForm} />
        <HazcomRiskLevelOutput
          ratings={form.ratings}
          ppe={form.ppe}
          className="xl:sticky xl:top-4"
        />
      </div>
    </div>
  );
}
