"use client";

import { useRouter } from "next/navigation";
import {
  CAPA_VERIFICATION_FORM_ID,
  CAPA_VERIFICATION_SCHEMA,
  createCapaVerificationInitialValues,
} from "@/components/capa/detail/capa-verification-schema";
import { CapaVerificationHeader } from "@/components/capa/detail/CapaVerificationHeader";
import type { CapaDetailRecord } from "@/components/capa/detail/capa-detail-data";
import { FormBuilder } from "@/components/form-builder";
import { Text } from "@/components/Text";
import { toast } from "@/lib/toast";

export type CapaVerificationContentProps = Readonly<{
  record: CapaDetailRecord;
}>;

const glassCardClass =
  "relative overflow-hidden rounded-2xl border border-white/90 bg-white/62 px-5.25 pt-5.25 pb-5 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']";

/** CAPA Verification page — Figma 846:6031. */
export function CapaVerificationContent(props: CapaVerificationContentProps) {
  const { record } = props;
  const router = useRouter();
  const detailHref = `/dashboard/capa/${encodeURIComponent(record.id)}`;

  const handleCancel = () => {
    router.push(detailHref);
  };

  const handleSubmit = () => {
    toast.success(`${record.code} verified and closed`);
    router.push(detailHref);
  };

  return (
    <div className="flex min-w-0 flex-col gap-5 px-4 pb-8">
      <CapaVerificationHeader record={record} />

      <div className={glassCardClass}>
        <div className="relative z-1 flex flex-col gap-2">
          <Text
            as="h2"
            className="text-lg leading-6 font-semibold text-[#0b1320]"
          >
            Verification Summary
          </Text>
          <p className="text-base leading-5 text-[#566072]">
            {"Verifier: "}
            <span className="text-[#0b1320]">{record.verifier}</span>
            {` · Verifier must be different from action owner (${record.owner})`}
          </p>
        </div>
      </div>

      <FormBuilder
        formId={CAPA_VERIFICATION_FORM_ID}
        schema={CAPA_VERIFICATION_SCHEMA}
        initialValues={createCapaVerificationInitialValues()}
        hideActions
        className="!gap-5"
        onSubmit={handleSubmit}
      />

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="cursor-pointer px-4 py-2 text-sm leading-5 font-medium text-[#566072] transition-colors hover:text-[#0b1320]"
        >
          Cancel
        </button>
        <button
          type="submit"
          form={CAPA_VERIFICATION_FORM_ID}
          className="cursor-pointer rounded-2.5 bg-[#10b981] px-5 py-2.5 text-sm leading-5 font-medium text-[#eceef2] shadow-[0px_6px_18px_-6px_#10b981] transition-colors hover:bg-[#0ea572]"
        >
          Verify & Close CAPA
        </button>
      </div>
    </div>
  );
}
