"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  type ReportIncidentFormState,
  SEVERITY_OPTIONS,
  INJURY_LEVEL_OPTIONS,
  IMMEDIATE_ACTION_OPTIONS,
  formatBodyPartSelection,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportReviewDetailCard } from "@/components/incidents/report/steps/step-5/ReportReviewDetailCard";
import { formatIncidentLocationsLabel } from "@/components/incidents/report/shared/ReportLocationsField";
import { ReportFieldError } from "@/components/incidents/report/shared/ReportFormField";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateIncidentMutation } from "@/hooks/use-incident-mutations";
import { getAccessToken } from "@/lib/axios";
import { toast } from "@/lib/toast";

export type ReportIncidentStepFiveProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

function validateReportForm(form: ReportIncidentFormState): string | null {
  const errors = getReportFormErrors(form);
  return (
    errors.description ??
    errors.location ??
    errors.incidentDate ??
    errors.mechanismOfInjury ??
    errors.natureOfInjury
  );
}

type ReportFormErrors = Readonly<{
  description: string | null;
  location: string | null;
  incidentDate: string | null;
  mechanismOfInjury: string | null;
  natureOfInjury: string | null;
}>;

function getReportFormErrors(form: ReportIncidentFormState): ReportFormErrors {
  return {
    description:
      form.description.trim() || form.title.trim()
        ? null
        : "Add an incident title or description before submitting.",
    location: form.location.trim() ? null : "Location is required.",
    incidentDate: form.incidentDate.trim()
      ? null
      : "Incident date is required.",
    mechanismOfInjury: form.mechanismOfInjury.trim()
      ? null
      : "Mechanism of injury is required.",
    natureOfInjury: form.natureOfInjury.trim()
      ? null
      : "Nature of injury is required.",
  };
}

function hasReportFormErrors(errors: ReportFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

function splitSiteAndArea(location: string): {
  site: string;
  area: string;
} {
  const trimmed = location.trim();
  if (!trimmed) {
    return { site: "—", area: "—" };
  }

  const separatorIndex = trimmed.indexOf("·");
  if (separatorIndex === -1) {
    return { site: trimmed, area: "—" };
  }

  return {
    site: trimmed.slice(0, separatorIndex).trim() || "—",
    area: trimmed.slice(separatorIndex + 1).trim() || "—",
  };
}

function previewTitle(form: ReportIncidentFormState): string {
  const titled = form.title.trim();
  if (titled) {
    return titled;
  }

  const description = form.description.trim();
  if (!description) {
    return "Untitled incident";
  }

  const firstLine = description.split(/\r?\n/)[0]?.trim() ?? description;
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}…` : firstLine;
}

export function ReportIncidentStepFive(
  props: Readonly<ReportIncidentStepFiveProps>,
) {
  const { form, onBack, className = "" } = props;
  const router = useRouter();
  const createIncidentMutation = useCreateIncidentMutation();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const submitErrors = attemptedSubmit ? getReportFormErrors(form) : null;

  const handleSubmit = async () => {
    if (!getAccessToken()) {
      toast.error("Sign in required", "Please sign in to submit an incident.");
      router.push("/login");
      return;
    }

    const errors = getReportFormErrors(form);
    if (hasReportFormErrors(errors)) {
      setAttemptedSubmit(true);
      return;
    }

    try {
      const created = await createIncidentMutation.mutateAsync(form);
      const createdId = created.id;

      toast.success(
        "Incident report submitted",
        "The incident has been recorded successfully.",
      );

      if (typeof createdId === "number" && createdId > 0) {
        router.push(`/dashboard/incidents/${String(createdId)}`);
        return;
      }

      router.push("/dashboard/incidents/list");
    } catch (error) {
      toast.error(
        "Submit failed",
        getMutationErrorMessage(
          error,
          "Could not submit the incident. Please try again.",
        ),
      );
    }
  };

  const severityBadge =
    SEVERITY_OPTIONS.find((o) => o.id === form.severity)?.previewBadge ??
    SEVERITY_OPTIONS.find((o) => o.id === form.severity)?.label ??
    "—";
  const typeBadge = form.injuryLevel !== "no-injury" ? "Injury" : "Near miss";
  const { site, area } = splitSiteAndArea(form.location);
  const incidentAreasLabel =
    formatIncidentLocationsLabel(form.incidentLocations ?? []) || area;
  const siteBadge = site;
  const when =
    form.incidentDate || form.incidentTime
      ? `${form.incidentDate || "—"} · ${form.incidentTime || "—"}`
      : "—";
  const injuryLevelLabel =
    INJURY_LEVEL_OPTIONS.find((o) => o.id === form.injuryLevel)?.label ?? "—";
  const bodyPartsLabel =
    formatBodyPartSelection(
      form.bodyParts,
      form.bodySide,
      form.bodyPartSides,
    ) || "—";
  const affectedPersonLabel = form.affectedPerson.trim() || "—";
  const witnessesLabel = form.witnesses.trim() || "None";

  const actionsLabel =
    form.immediateActions
      .map(
        (id) =>
          IMMEDIATE_ACTION_OPTIONS.find((option) => option.id === id)?.label ??
          id,
      )
      .join(" · ") || "None";

  const photosCountLabel =
    form.photos.length > 0 ? `${String(form.photos.length)} attached` : "None";
  const reporterName = form.reportedBy.trim() || "—";
  // Figma Reporter card: Department = site · area (from Plant / Location).
  const departmentLabel =
    site !== "—" && area !== "—"
      ? `${site} · ${area}`
      : site !== "—"
        ? site
        : form.location.trim() || "—";
  // No anonymous toggle in the wizard yet — default matches Figma preview.
  const anonymousLabel = "No";
  const incidentTitle = previewTitle(form);

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-[29px]"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
          {/* Header Title & Subtitle */}
          <div className="flex flex-col gap-1.5">
            <Text
              as="p"
              className="text-ehs-dark-blue text-xs font-bold tracking-wide uppercase"
            >
              Step 5
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-[21.8px] font-bold tracking-[-0.44px]"
            >
              Review & submit
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              Quick check, then this routes to EHS automatically.
            </Text>
          </div>

          {/* Section 1: Top nested summary card */}
          <div className="flex flex-col gap-2.5 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/42 p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-ehs-gray rounded-[6px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-xs font-bold tracking-[0.2px]">
                {severityBadge}
              </span>
              <span className="text-ehs-gray rounded-[6px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-xs font-bold tracking-[0.2px]">
                {typeBadge}
              </span>
              <span className="text-ehs-gray rounded-[6px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-xs font-bold tracking-[0.2px]">
                {siteBadge}
              </span>
            </div>

            <Text
              as="h3"
              className="text-ehs-dark-bg text-[15.8px] leading-normal font-bold"
            >
              {incidentTitle}
            </Text>

            <p className="text-ehs-gray text-sm leading-[17.5px]">
              {form.description.trim() || "No description provided."}
            </p>
            {submitErrors?.description ? (
              <ReportFieldError>{submitErrors.description}</ReportFieldError>
            ) : null}
          </div>

          {/* Section 2: 2x2 detail cards — Figma 616:9073 */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <ReportReviewDetailCard
              title="Where & when"
              rows={[
                { label: "Site", value: site },
                { label: "Area", value: incidentAreasLabel },
                { label: "When", value: when },
              ]}
              error={
                submitErrors?.location ?? submitErrors?.incidentDate ?? null
              }
            />
            <ReportReviewDetailCard
              title="People"
              rows={[
                { label: "Affected", value: affectedPersonLabel },
                { label: "Injury", value: injuryLevelLabel },
                { label: "Body part", value: bodyPartsLabel },
                { label: "Witnesses", value: witnessesLabel },
              ]}
            />
            <ReportReviewDetailCard
              title="Response"
              rows={[
                { label: "Actions", value: actionsLabel },
                { label: "Photos", value: photosCountLabel },
              ]}
            />

            <ReportReviewDetailCard
              title="Reporter"
              paddingClassName="px-[15px] pt-[15px] pb-[29px]"
              rows={[
                { label: "Reported by", value: reporterName },
                { label: "Department", value: departmentLabel },
                { label: "Anonymous", value: anonymousLabel },
              ]}
            />
          </div>

          {submitErrors?.mechanismOfInjury ||
          submitErrors?.natureOfInjury ? (
            <div
              className="flex flex-col gap-1"
              data-field-error="true"
            >
              {submitErrors.mechanismOfInjury ? (
                <ReportFieldError>
                  {`${submitErrors.mechanismOfInjury} Go back to Step 2 to fix this.`}
                </ReportFieldError>
              ) : null}
              {submitErrors.natureOfInjury ? (
                <ReportFieldError>
                  {`${submitErrors.natureOfInjury} Go back to Step 2 to fix this.`}
                </ReportFieldError>
              ) : null}
            </div>
          ) : null}

          {/* Section 3: Routing preview banner */}
          <div className="border-ehs-border bg-ehs-light-bg flex items-start gap-3 rounded-[12px] border p-3.5">
            <div className="text-ehs-normal-blue bg-ehs-normal-blue/10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px]">
              <Icon icon="mdi:shield-check-outline" className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text as="span" className="text-ehs-dark-blue text-sm font-bold">
                Routing preview
              </Text>
              <p className="text-ehs-gray text-xs leading-normal">
                After submit, this report will be routed to the site EHS owner
                and relevant supervisors based on your organization settings.
              </p>
            </div>
          </div>

          {/* Section 4: AI summary ready banner */}
          <div className="from-ehs-light-blue to-ehs-light-blue-hover border-ehs-normal-blue/15 flex items-start gap-3 rounded-[12px] border bg-gradient-to-r p-3.5">
            <div className="text-ehs-normal-blue mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-white shadow-sm">
              <Icon icon="mdi:creation-outline" className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text
                as="span"
                className="text-ehs-normal-blue text-sm font-bold"
              >
                AI summary ready
              </Text>
              <p className="text-ehs-slate text-xs leading-[15px]">
                {form.description.trim() ||
                  "AI summary will be generated from your report after submit."}
              </p>
            </div>
          </div>
        </div>

        {/* Form Bottom Toolbar Actions */}
        <div className="border-t border-[rgba(15,23,42,0.08)] pt-[21px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              disabled={createIncidentMutation.isPending}
              className="rounded-[10px] px-[15px] py-2.5 text-sm font-bold"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-[13px]"
                aria-hidden="true"
              />
              Back
            </Button>

            <p className="text-ehs-muted-text min-w-0 flex-1 text-xs">
              Required fields marked with{" "}
              <span className="text-ehs-red">*</span>
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={() => void handleSubmit()}
              disabled={createIncidentMutation.isPending}
              className="rounded-[10px] px-[15px] py-2.5 text-sm font-bold shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)]"
            >
              {createIncidentMutation.isPending ? (
                <>
                  Submitting…
                  <Icon
                    icon="mdi:loading"
                    className="size-[13px] animate-spin"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <>
                  Submit report
                  <Icon
                    icon="mdi:check"
                    className="size-[13px]"
                    aria-hidden="true"
                  />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
