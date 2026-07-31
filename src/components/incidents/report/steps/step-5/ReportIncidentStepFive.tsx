"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  type ReportIncidentFormState,
  SEVERITY_OPTIONS,
  INJURY_LEVEL_OPTIONS,
  IMMEDIATE_ACTION_OPTIONS,
  SUGGESTED_FOLLOW_UP_OPTIONS,
  formatBodyPartSelection,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportReviewDetailCard } from "@/components/incidents/report/steps/step-5/ReportReviewDetailCard";
import {
  getMutationErrorMessage,
} from "@/hooks/use-auth-mutations";
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
  const { form, onBack, className = "" } = props;
  const router = useRouter();
  const createIncidentMutation = useCreateIncidentMutation();

  const handleSubmit = async () => {
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

  const severityBadge =
    SEVERITY_OPTIONS.find((o) => o.id === form.severity)?.previewBadge ??
    SEVERITY_OPTIONS.find((o) => o.id === form.severity)?.label ??
    "—";
  const typeBadge = form.injuryLevel !== "no-injury" ? "Injury" : "Near miss";
  const { site, area } = splitSiteAndArea(form.location);
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
    form.photos.length > 0
      ? `${String(form.photos.length)} attached`
      : "None";
  const followUpsLabel =
    form.suggestedFollowUp.length > 0
      ? form.suggestedFollowUp
          .map(
            (id) =>
              SUGGESTED_FOLLOW_UP_OPTIONS.find((option) => option.id === id)
                ?.label ?? id,
          )
          .join(" · ")
      : "None";

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
              className="text-ehs-dark-blue text-[10px] font-bold tracking-[1.4px] uppercase"
            >
              Step 5
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-[21.8px] font-bold tracking-[-0.44px]"
            >
              Review & submit
            </Text>
            <Text as="p" className="text-ehs-gray text-[12px]">
              Quick check, then this routes to EHS automatically.
            </Text>
          </div>

          {/* Section 1: Top nested summary card */}
          <div className="flex flex-col gap-2.5 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/42 p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-ehs-gray rounded-[6px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-[10.5px] font-bold tracking-[0.2px]">
                {severityBadge}
              </span>
              <span className="text-ehs-gray rounded-[6px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-[10.5px] font-bold tracking-[0.2px]">
                {typeBadge}
              </span>
              <span className="text-ehs-gray rounded-[6px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-[10.5px] font-bold tracking-[0.2px]">
                {siteBadge}
              </span>
            </div>

            <Text
              as="h3"
              className="text-ehs-dark-bg text-[15.8px] leading-normal font-bold"
            >
              {incidentTitle}
            </Text>

            <p className="text-ehs-gray text-[11.5px] leading-[17.5px]">
              {form.description.trim() || "No description provided."}
            </p>
          </div>

          {/* Section 2: 2x2 detail cards — Figma 616:9073 */}
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <ReportReviewDetailCard
              title="Where & when"
              rows={[
                { label: "Site", value: site },
                { label: "Area", value: area },
                { label: "When", value: when },
              ]}
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
                { label: "Follow-ups", value: followUpsLabel },
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

          {/* Section 3: Routing preview banner */}
          <div className="flex items-start gap-3 rounded-[12px] border border-ehs-border bg---ehs-light-bg p-3.5">
            <div className="text-ehs-normal-blue mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-[#0891a6]/10">
              <Icon icon="mdi:shield-check-outline" className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text
                as="span"
                className="text-[11.5px] font-bold text-[#056e7e]"
              >
                Routing preview
              </Text>
              <p className="text-ehs-gray text-[10.8px] leading-normal">
                After submit, this report will be routed to the site EHS
                owner and relevant supervisors based on your organization
                settings.
              </p>
            </div>
          </div>

          {/* Section 4: AI summary ready banner */}
          <div className="from-ehs-light-blue to-ehs-light-blue-hover flex items-start gap-3 rounded-[12px] border border-[#0891a6]/15 bg-gradient-to-r p-3.5">
            <div className="text-ehs-normal-blue mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-white shadow-sm">
              <Icon icon="mdi:creation-outline" className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text
                as="span"
                className="text-ehs-normal-blue text-[11.5px] font-bold"
              >
                AI summary ready
              </Text>
              <p className="text-[10.8px] leading-[15px] text-[#2a3446]">
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
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-[13px]"
                aria-hidden="true"
              />
              Back
            </Button>

            <p className="text-ehs-muted-text min-w-0 flex-1 text-[10.8px]">
              Required fields marked with{" "}
              <span className="text-ehs-red">*</span>
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={() => void handleSubmit()}
              disabled={createIncidentMutation.isPending}
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold shadow-[0px_6px_18px_-6px_#0891a6]"
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
