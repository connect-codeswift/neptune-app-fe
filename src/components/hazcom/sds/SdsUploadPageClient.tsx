"use client";

import { HazcomFormLayout, HazcomPageHeader } from "@/components/hazcom/shared";
import { HazcomSdsUploadForm } from "@/components/hazcom/sds/HazcomSdsUploadForm";

/** Upload SDS — POST /api/hazcom/sds. */
export function SdsUploadPageClient() {
  return (
    <HazcomFormLayout>
      <HazcomPageHeader
        breadcrumb={[
          "Safety",
          { label: "HazCom", href: "/dashboard/hazcom/overview" },
          { label: "SDS Library", href: "/dashboard/hazcom/sds" },
          "Upload",
        ]}
        title="Upload Safety Data Sheet"
        subtitle="Upload a PDF and enter GHS metadata for the SDS record"
      />

      <HazcomSdsUploadForm />
    </HazcomFormLayout>
  );
}
