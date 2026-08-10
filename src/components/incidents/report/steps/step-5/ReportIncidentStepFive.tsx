"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  type ReportIncidentFormState,
  IMMEDIATE_ACTION_OPTIONS,
  formatBodyPartSelection,
  severityOptionFor,
  oshaRecordableForSeverity,
  dartForSeverity,
  siaForSeverity,
  sifForIntake,
  injuryLevelForReport,
  INJURY_LEVEL_OPTIONS,
  formatInitialTreatmentLabels,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportDerivedClassificationBanner } from "@/components/incidents/report/shared/ReportDerivedClassificationBanner";
import { ReportReviewDetailCard } from "@/components/incidents/report/steps/step-5/ReportReviewDetailCard";
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
  previewMode?: boolean;
}>;

function validateReportForm(form: ReportIncidentFormState): string | null {
  if (!form.severity) {
    return "Pick a severity before submitting.";
  }
  if (!form.description.trim() && !form.title.trim()) {
    return "Add an incident title or description before submitting.";
  }
  if (!form.location.trim()) {
    return "Location is required.";
  }
  if (!form.incidentDate.trim()) {
    return "Incident date is required.";
  }
  if (!form.mechanismOfInjury.trim()) {
    return "Mechanism of injury is required.";
  }
  if (!form.natureOfInjury.trim()) {
    return "Nature of injury is required.";
  }
  return null;
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
  const { form, onBack, className = "", previewMode = false } = props;
  const router = useRouter();
  const createIncidentMutation = useCreateIncidentMutation();

  const severityOption = severityOptionFor(form.severity);
  const derivedInjuryLevel = injuryLevelForReport(
    form.severity,
    form.natureOfInjury,
  );
  const oshaRecordable = oshaRecordableForSeverity(form.severity) || "—";
  const dart = dartForSeverity(form.severity) || "—";
  const sia = siaForSeverity(form.severity) || "—";
  const sip = form.classifications.serious || "—";
  const sif = sifForIntake(form.severity, form.classifications.serious) || "—";

  const handleSubmit = async () => {
    if (previewMode) {
      toast.info(
        "Preview only",
        "Submit is disabled in preview mode — connect a backend to file for real.",
      );
      return;
    }

    if (!getAccessToken()) {
      toast.error("Sign in required", "Please sign in to submit an incident.");
      router.push("/login");
      return;
    }

    const validationError = validateReportForm(form);
    if (validationError) {
      toast.error("Missing required fields", validationError);
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

  const severityBadge = severityOption?.previewBadge ?? "—";
  const severityLabel = severityOption?.label ?? "—";
  const typeBadge =
    derivedInjuryLevel !== "no-injury" ? "Injury" : "Near miss";
  const { site, area } = splitSiteAndArea(form.location);
  const siteBadge = site;
  const when =
    form.incidentDate || form.incidentTime
      ? `${form.incidentDate || "—"} · ${form.incidentTime || "—"}`
      : "—";
  const injuryLevelLabel =
    INJURY_LEVEL_OPTIONS.find((option) => option.id === derivedInjuryLevel)
      ?.label ?? "—";
  const mappedBodyParts = formatBodyPartSelection(
    form.bodyParts,
    form.bodySide,
    form.bodyPartSides,
  );
  const customParts = (form.customBodyParts ?? []).filter((part) =>
    part.trim(),
  );
  const bodyPartsLabel =
    customParts.length === 0
      ? mappedBodyParts === "None selected"
        ? "—"
        : mappedBodyParts
      : mappedBodyParts === "None selected"
        ? customParts.join(", ")
        : `${mappedBodyParts}, ${customParts.join(", ")}`;
  const affectedPersonLabel = form.affectedPerson.trim() || "—";
  const witnessesLabel = form.witnesses.trim() || "None";
  const treatmentLabel =
    formatInitialTreatmentLabels(form.initialTreatment) || "—";
  const secondaryTreatmentLabel = form.secondaryTreatment || "—";

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
  const departmentLabel =
    site !== "—" && area !== "—"
      ? `${site} · ${area}`
      : site !== "—"
        ? site
        : form.location.trim() || "—";
  const anonymousLabel = "No";
  const incidentTitle = previewTitle(form);

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-[29px]"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
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

          <ReportDerivedClassificationBanner
            severity={form.severity}
            sipAnswer={form.classifications.serious}
          />

          <div className="flex flex-col gap-2.5 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/42 p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-ehs-gray rounded-[6px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-xs font-bold tracking-[0.2px]">
                {severityBadge}
              </span>
              <span className="text-ehs-gray rounded-[6px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-xs font-bold tracking-[0.2px]">
                {severityLabel}
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
          </div>

          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <ReportReviewDetailCard
              title="Classification"
              rows={[
                { label: "OSHA Recordable", value: oshaRecordable },
                { label: "DART", value: dart },
                { label: "SIA (actual)", value: sia },
                { label: "SIP (potential)", value: sip },
                { label: "SIF", value: sif },
                {
                  label: "OSHA Notification",
                  value: form.oshaNotificationRequired || "—",
                },
                {
                  label: "Work related",
                  value: form.classifications.workRelated || "—",
                },
              ]}
            />
            <ReportReviewDetailCard
              title="Where & when"
              rows={[
                { label: "Site", value: site },
                { label: "Area", value: area },
                { label: "When", value: when },
              ]}
            />
            <ReportReviewDetailCard
              title="People & injury"
              rows={[
                { label: "Affected", value: affectedPersonLabel },
                { label: "Injury level", value: injuryLevelLabel },
                { label: "Body part", value: bodyPartsLabel },
                { label: "Witnesses", value: witnessesLabel },
              ]}
            />
            <ReportReviewDetailCard
              title="Treatment & response"
              rows={[
                { label: "Initial treatment", value: treatmentLabel },
                {
                  label: "Secondary treatment sought",
                  value: secondaryTreatmentLabel,
                },
                { label: "Actions", value: actionsLabel },
                { label: "Photos", value: photosCountLabel },
              ]}
            />

            <ReportReviewDetailCard
              title="Reporter"
              paddingClassName="px-[15px] pt-[15px] pb-[29px]"
              rows={[
                { label: "Reported by", value: reporterName },
                { label: "Assignee", value: reporterName },
                { label: "Department", value: departmentLabel },
                { label: "Anonymous", value: anonymousLabel },
              ]}
            />
          </div>

          <div className="border-ehs-border bg-ehs-light-bg flex items-start gap-3 rounded-[12px] border p-3.5">
            <div className="text-ehs-normal-blue bg-ehs-normal-blue/10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px]">
              <Icon icon="mdi:shield-check-outline" className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text as="span" className="text-ehs-dark-blue text-sm font-bold">
                Routing preview
              </Text>
              <p className="text-ehs-gray text-xs leading-normal">
                Assigned to you (the signed-in reporter). Investigation workflow
                and CAPA are handled in later modules.
              </p>
            </div>
          </div>

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
