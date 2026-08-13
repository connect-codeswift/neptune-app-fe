"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  CAPA_VERIFICATION_FORM_ID,
  CAPA_VERIFICATION_SCHEMA,
} from "@/components/capa/detail/capa-verification-schema";
import { CapaVerificationHeader } from "@/components/capa/detail/CapaVerificationHeader";
import { CapaVerificationSkeleton } from "@/components/capa/CapaRouteSkeletons";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitCapaVerificationMutation } from "@/hooks/use-capa-mutations";
import {
  useCapaDetailQuery,
  useCapaVerificationQuery,
} from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { toast } from "@/lib/toast";
import {
  mapCapaVerificationDtoToFormValues,
  mapFormChecklistToVerificationItems,
  mapFormEffectivenessToApi,
} from "@/services/mappers/capa.mapper";

export type CapaVerificationContentProps = Readonly<{
  /** Route param — numeric CAPA id. */
  capaId: string;
}>;

const NO_VERIFICATION_MESSAGE = "No verification found for this CAPA";

const glassCardClass =
  "relative overflow-hidden rounded-2xl border border-white/90 bg-white/62 px-5.25 pt-5.25 pb-5 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']";

function parseRouteCapaId(capaId: string): number | null {
  const parsed = Number.parseInt(decodeURIComponent(capaId).trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** CAPA Verification page — Figma 846:6031. GET then POST /CAPA/Verification. */
export function CapaVerificationContent(props: CapaVerificationContentProps) {
  const { capaId: capaIdParam } = props;
  const numericId = parseRouteCapaId(capaIdParam);
  const router = useRouter();
  const hasToken = useHasAccessToken();
  const submitVerificationMutation = useSubmitCapaVerificationMutation();

  const detailQuery = useCapaDetailQuery({
    capaId: numericId,
    enabled: hasToken === true && numericId != null,
  });

  const verificationQuery = useCapaVerificationQuery({
    capaId: numericId,
    enabled: hasToken === true && numericId != null,
  });

  const record = detailQuery.data;
  const existingVerification = verificationQuery.data ?? null;
  const isAlreadyVerified = existingVerification != null;
  const showNoVerificationBanner =
    verificationQuery.isFetched &&
    !verificationQuery.isError &&
    !isAlreadyVerified;

  const initialValues = useMemo(
    () => mapCapaVerificationDtoToFormValues(existingVerification),
    [existingVerification],
  );

  const detailHref =
    numericId != null
      ? `/dashboard/capa/${encodeURIComponent(String(numericId))}`
      : "/dashboard/capa";

  const isBootstrapping =
    hasToken === null ||
    (hasToken === true &&
      numericId != null &&
      ((detailQuery.isLoading && detailQuery.data === undefined) ||
        (verificationQuery.isLoading &&
          verificationQuery.data === undefined &&
          !verificationQuery.isFetched)));

  async function handleSubmit(values: FormValues) {
    if (numericId == null || numericId <= 0) {
      toast.error("Could not verify CAPA", "Missing CAPA id.");
      return;
    }

    if (isAlreadyVerified) {
      toast.info(
        "Already verified",
        "This CAPA already has a verification record.",
      );
      router.push(detailHref);
      return;
    }

    try {
      // POST /api/CAPA/Verification
      await submitVerificationMutation.mutateAsync({
        capaId: numericId,
        effectiveness: mapFormEffectivenessToApi(
          String(values.effectiveness ?? ""),
        ),
        notes: typeof values.notes === "string" ? values.notes : "",
        checklist: mapFormChecklistToVerificationItems(values.checklist),
      });
      toast.success(`${record?.code ?? "CAPA"} verified and closed`);
      router.push(detailHref);
    } catch (error) {
      toast.error(
        "Could not verify CAPA",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  }

  if (numericId == null) {
    return (
      <div className="flex min-w-0 flex-col gap-2 px-4 pb-8">
        <Text as="p" className="text-ehs-muted-text text-sm">
          That CAPA could not be found.
        </Text>
        <Link
          href="/dashboard/capa"
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to CAPA
        </Link>
      </div>
    );
  }

  if (hasToken === false) {
    return (
      <div className="flex min-w-0 flex-col gap-2 px-4 pb-8">
        <Text as="p" className="text-ehs-muted-text text-sm">
          Sign in to verify this CAPA.
        </Text>
        <Link
          href={detailHref}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to CAPA
        </Link>
      </div>
    );
  }

  if (isBootstrapping) {
    return <CapaVerificationSkeleton />;
  }

  if (detailQuery.isError || !record) {
    return (
      <div className="flex min-w-0 flex-col gap-2 px-4 pb-8">
        <Text as="p" className="text-sm text-[#ef4444]">
          {getMutationErrorMessage(
            detailQuery.error,
            "Could not load this CAPA.",
          )}
        </Text>
        <Link
          href="/dashboard/capa"
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to CAPA
        </Link>
      </div>
    );
  }

  const verifierLabel =
    existingVerification?.verifiedByName?.trim() || record.verifier || "—";

  return (
    <div className="flex min-w-0 flex-col gap-5 px-4 pb-8">
      {showNoVerificationBanner ? (
        <div
          role="status"
          className="rounded-2.5 border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.12)] px-4 py-3"
        >
          <Text as="p" className="text-sm leading-5 font-medium text-[#92400e]">
            {NO_VERIFICATION_MESSAGE}
          </Text>
        </div>
      ) : null}

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
            <span className="text-[#0b1320]">{verifierLabel}</span>
            {` · Verifier must be different from action owner (${record.owner})`}
          </p>
          {isAlreadyVerified ? (
            <Text as="p" className="text-base leading-5 text-[#0891a6]">
              {`This CAPA already has a verification on file${
                existingVerification.verifiedAt
                  ? ` (${existingVerification.verifiedAt})`
                  : ""
              }.`}
            </Text>
          ) : null}
        </div>
      </div>

      <FormBuilder
        key={`${record.id}-verification-${String(verificationQuery.dataUpdatedAt)}`}
        formId={CAPA_VERIFICATION_FORM_ID}
        schema={CAPA_VERIFICATION_SCHEMA}
        initialValues={initialValues}
        hideActions
        isSubmitting={submitVerificationMutation.isPending}
        className="!gap-5"
        onSubmit={(values) => {
          void handleSubmit(values);
        }}
      />

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(detailHref)}
          className="cursor-pointer px-4 py-2 text-sm leading-5 font-medium text-[#566072] transition-colors hover:text-[#0b1320]"
        >
          Cancel
        </button>
        <button
          type="submit"
          form={CAPA_VERIFICATION_FORM_ID}
          disabled={submitVerificationMutation.isPending || isAlreadyVerified}
          className="cursor-pointer rounded-2.5 bg-[#10b981] px-5 py-2.5 text-sm leading-5 font-medium text-[#eceef2] shadow-[0px_6px_18px_-6px_#10b981] transition-colors hover:bg-[#0ea572] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAlreadyVerified
            ? "Already Verified"
            : submitVerificationMutation.isPending
              ? "Verifying…"
              : "Verify & Close CAPA"}
        </button>
      </div>
    </div>
  );
}
