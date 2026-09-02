"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  toEnergySourceViews,
  type LotoApplyLockoutContext,
} from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { lotoEquipmentDetailRoute } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import { getAuthDisplayName } from "@/lib/auth-context";
import { uploadFile } from "@/lib/upload-file";
import { toast } from "@/lib/toast";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useLotoEquipmentDetailQuery } from "@/hooks/use-loto-queries";
import { useApplyLotoLockoutMutation } from "@/hooks/use-loto-mutations";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import {
  withLockPrefix,
  withEquipmentPrefix,
  splitEnergySources,
} from "@/services/mappers/loto.mapper";
import {
  LOTO_APPLY_FORM_ID,
  buildApplyLockoutSchema,
  fieldString,
  toApplyLockoutFormValues,
} from "./apply-lockout-schema";
import { LotoApplyLockoutHeader } from "./LotoApplyLockoutHeader";
import { LotoEnergySourcesPanel } from "./LotoEnergySourcesPanel";
import { LotoQueryStatus } from "../LotoQueryStatus";

/* The warning line's ink is pinned to #b45309 (amber-700): one step lighter
   than `--ehs-yellow-ink` (#92400e) and far darker than `--ehs-yellow`, which
   is the tint it sits on. */

const fieldClass = [
  "gap-3.5",
  "[&_label]:text8",
  "[&_label]:font-semibold",
  "[&_label]:text-ehs-gray",
  "[&_input]:text4",
  "[&_select]:text4",
  "[&_textarea]:text4",
].join(" ");

function toNumericId(idParam: string): number | null {
  const trimmed = idParam.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export type LotoApplyLockoutContentProps = Readonly<{
  equipmentId: string;
}>;

export function LotoApplyLockoutContent(props: LotoApplyLockoutContentProps) {
  const { equipmentId } = props;
  const hasToken = useHasAccessToken();
  const numericId = toNumericId(equipmentId);
  const detailQuery = useLotoEquipmentDetailQuery(numericId, hasToken === true);

  const context = useMemo<LotoApplyLockoutContext | null>(() => {
    const detail = detailQuery.data;
    if (!detail) return null;

    return {
      equipmentId: detail.id,
      equipmentName: detail.name,
      equipmentCode: withEquipmentPrefix(detail.equipmentCode),
      energySources: toEnergySourceViews(
        splitEnergySources(detail.energySources),
      ),
      operatorName: getAuthDisplayName(),
      verificationMethod: detail.verificationMethod ?? "",
      canApply: detail.canApply,
      cannotApplyReason: detail.cannotApplyReason,
    };
  }, [detailQuery.data]);

  if (numericId === null) {
    return <ApplyNotFound equipmentId={equipmentId} />;
  }

  if (hasToken === null || (hasToken && detailQuery.isLoading)) {
    return <LotoQueryStatus state="loading" />;
  }

  if (detailQuery.isError) {
    return (
      <LotoQueryStatus
        state="error"
        message={getMutationErrorMessage(
          detailQuery.error,
          "Failed to load this equipment.",
        )}
      />
    );
  }

  if (!context) {
    return <ApplyNotFound equipmentId={equipmentId} />;
  }

  return <LotoApplyLockoutForm context={context} />;
}

function ApplyNotFound(props: Readonly<{ equipmentId: string }>) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
        <Text as="p" className="text4 text-ehs-darker font-semibold">
          Equipment not found
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text mt-1">
          {`No equipment matches “${props.equipmentId}”.`}
        </Text>
        <Link
          href={LOTO_ROUTE}
          className="text4 text-ehs-normal-blue mt-3 inline-block hover:underline"
        >
          Back to LOTO
        </Link>
      </IncidentGlassCard>
    </div>
  );
}

function LotoApplyLockoutForm(
  props: Readonly<{ context: LotoApplyLockoutContext }>,
) {
  const { context } = props;
  const router = useRouter();
  const detailHref = lotoEquipmentDetailRoute(context.equipmentId);
  const schema = useMemo(() => buildApplyLockoutSchema(), []);
  const [confirmed, setConfirmed] = useState(false);
  // Purpose is required and lives inside FormBuilder, so the button could not
  // see it. Mirrored out here for the enable check below.
  const [purpose, setPurpose] = useState("");
  const [attachmentFileId, setAttachmentFileId] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const applyMutation = useApplyLotoLockoutMutation();
  // Held past the response: `isPending` drops when the record is saved, while
  // the navigation away is still in flight. A click in that gap saved a
  // duplicate.
  const submitLock = useSubmitLock();

  // Every condition that can refuse the submit, so the button's appearance and
  // what a click actually does agree. Before, this knew about the checkbox but
  // not the required Purpose field: ticking the box alone lit the button, and
  // the click then bounced off form validation; filling the form in full left
  // it grey until the box was ticked. Same control, two different lies.
  const canSubmit =
    confirmed &&
    purpose.trim() !== "" &&
    context.canApply &&
    !isUploading &&
    !submitLock.isLocked;

  // The photo is uploaded as it is picked rather than on submit: the bytes go
  // straight to R2 and only the returned id rides on the lockout payload, so a
  // slow upload cannot hold up the apply and a failed one leaves no orphan.
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadFile(file, { module: "Loto" });
      setAttachmentFileId(result.fileId);
      setAttachmentName(file.name);
    } catch (error) {
      toast.error(
        "Could not upload the photo",
        getMutationErrorMessage(error, "Please try again."),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleValid = (values: FormValues) => {
    // Not redundant with the disabled button: a form submits on Enter from any
    // input, which never consults it. Purpose is not re-checked — FormBuilder
    // enforces `required` and shows the error on the field itself.
    if (!confirmed) {
      toast.error("Confirm you have followed the LOTO procedure");
      return;
    }

    const expectedCompletion = fieldString(values, "expectedCompletion").trim();

    if (!submitLock.acquire()) {
      return;
    }

    applyMutation.mutate(
      {
        lotoEquipmentId: context.equipmentId,
        // Read from the submitted values, not the mirrored state: these are
        // what the form validated.
        purpose: fieldString(values, "purpose").trim(),
        expectedCompletionAt:
          expectedCompletion === "" ? null : expectedCompletion,
        confirmationAccepted: true,
        attachmentFileId,
      },
      {
        onSuccess: (result) => {
          toast.success(
            "Lockout applied",
            result
              ? `Lock ${withLockPrefix(result.lockNumber)} registered as ${result.logCode}.`
              : undefined,
          );
          router.push(`${LOTO_ROUTE}?tab=active-lockouts`);
        },
        onError: (error) => {
          submitLock.release();
          toast.error(
            getMutationErrorMessage(error, "Failed to apply the lockout."),
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <LotoApplyLockoutHeader context={context} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <IncidentGlassCard
            paddingClassName="p-5.5"
            className="rounded-5 min-w-0"
          >
            <h2 className="text3 text-ehs-darker">Lockout Registration</h2>
            <div className="mt-4">
              <FormBuilder
                formId={LOTO_APPLY_FORM_ID}
                schema={schema}
                initialValues={toApplyLockoutFormValues(context.operatorName)}
                hideActions
                className={fieldClass}
                onChange={(values) => {
                  setPurpose(fieldString(values, "purpose"));
                }}
                onSubmit={handleValid}
              />
            </div>
          </IncidentGlassCard>

          <IncidentGlassCard
            paddingClassName="p-5.5"
            className="rounded-5 min-w-0"
          >
            <h2 className="text3 text-ehs-darker">Lock &amp; Tag Photo</h2>
            {/* Optional on purpose. The tag in the picture is the only evidence
                that survives a lock being cut off in an emergency, but an
                operator with a flat phone must still be able to isolate the
                machine. */}
            <Text as="p" className="text8 text-ehs-muted-text mt-1">
              Optional. A photo of the applied lock and tag is kept with this
              lockout record.
            </Text>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text5 inline-flex cursor-pointer items-center gap-1.75">
                <Icon
                  icon="mdi:camera-outline"
                  className="size-3.5"
                  aria-hidden="true"
                />
                {isUploading
                  ? "Uploading…"
                  : attachmentFileId
                    ? "Replace photo"
                    : "Attach photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    // Cleared so picking the same file twice still fires.
                    event.target.value = "";
                    if (file) void handleUpload(file);
                  }}
                />
              </label>

              {attachmentFileId ? (
                <Text as="span" className="text8 text-ehs-muted-text">
                  {attachmentName ?? "Photo attached"}
                </Text>
              ) : null}
            </div>
          </IncidentGlassCard>

          {!context.canApply ? (
            <p className="text4 border-ehs-yellow/30 bg-ehs-yellow/8 text-ehs-warning-ink rounded-xl border px-4.5 py-3 font-medium">
              {context.cannotApplyReason ??
                "This equipment cannot be locked out right now."}
            </p>
          ) : null}

          {/* Directly above the confirmation, because that checkbox says the
              operator has followed the procedure and this is the part of it they
              are attesting to. Without it they were confirming against a screen
              that showed nothing but the energy-source chips. */}
          {context.verificationMethod ? (
            <IncidentGlassCard
              paddingClassName="p-5.5"
              className="rounded-5 min-w-0"
            >
              <h2 className="text3 text-ehs-darker">Verification Method</h2>
              <p className="text4 text-ehs-gray mt-2 whitespace-pre-line">
                {context.verificationMethod}
              </p>
            </IncidentGlassCard>
          ) : null}

          <label className="border-ehs-red/16 bg-ehs-red/4 flex cursor-pointer items-start gap-3 rounded-xl border px-4.5 py-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="rounded-0.5 accent-ehs-red mt-0.5 size-4 shrink-0 border border-[#767676]"
            />
            <span className="min-w-0">
              <span className="text5 text-ehs-red block">
                Final Confirmation
              </span>
              <span className="text4 text-ehs-gray mt-1 block font-medium">
                I have read, understood, and followed the energy control
                procedure for this machine. I confirm the machine cannot be
                started. I accept responsibility for this lockout.
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={detailHref}
              className="text4 rounded-2.5 text-ehs-slate hover:bg-ehs-surface border-ehs-border-ink/14 bg-ehs-surface/62 inline-flex h-9.75 items-center gap-1.75 border px-4 py-5.5 font-medium transition-colors"
            >
              <Icon icon="mdi:arrow-left" className="size-3.5" />
              Cancel
            </Link>
            <Button
              type="submit"
              form={LOTO_APPLY_FORM_ID}
              variant="danger"
              disabled={!canSubmit}
              title={
                !context.canApply
                  ? (context.cannotApplyReason ?? undefined)
                  : undefined
              }
              className="text4 rounded-2.5 gap-1.75 px-4 py-2.5 font-semibold shadow-[0px_4px_7px_color-mix(in_oklab,var(--ehs-red)_40%,transparent)]"
            >
              <Icon icon="mdi:lock-outline" className="size-3.5 shrink-0" />
              {submitLock.isLocked ? "Applying…" : "Confirm Lockout Applied"}
            </Button>
          </div>
        </div>

        <LotoEnergySourcesPanel sources={context.energySources} />
      </div>
    </div>
  );
}
