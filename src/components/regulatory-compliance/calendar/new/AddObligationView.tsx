"use client";

import { CompliancePageHeader } from "@/components/regulatory-compliance/CompliancePageHeader";
import { AddObligationHeaderCard } from "./AddObligationHeaderCard";
import { AddObligationForm } from "./AddObligationForm";

export function AddObligationView() {
  return (
    <div className="bg-ehs-light-bg flex flex-1 flex-col px-4 pb-6">
      <CompliancePageHeader showTitle={false} showDateRangeCalendarIcon={false} />

      <AddObligationHeaderCard className="mt-0" />

      <div className="mt-[14px] flex w-full min-w-0 justify-center">
        <AddObligationForm />
      </div>
    </div>
  );
}
