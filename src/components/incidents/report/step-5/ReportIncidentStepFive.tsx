"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import { toast } from "@/lib/toast";
import {
  type ReportIncidentFormState,
  SEVERITY_OPTIONS,
  INJURY_LEVEL_OPTIONS,
  IMMEDIATE_ACTION_OPTIONS,
  formatBodyPartSelection,
} from "@/components/incidents/report/shared/report-incident-data";

export type ReportIncidentStepFiveProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

export function ReportIncidentStepFive(
  props: Readonly<ReportIncidentStepFiveProps>,
) {
  const { form, onBack, className = "" } = props;
  const router = useRouter();

  const handleSubmit = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("reported_incident_form", JSON.stringify(form));
    }
    toast.success(
      "Incident Report Submitted",
      "Incident has been successfully routed to EHS.",
    );
    router.push("/incidents/INC-2025-DET-001");
  };

  // Helper values to parse dynamic preview details from form state
  const severityBadge =
    SEVERITY_OPTIONS.find((o) => o.id === form.severity)?.previewBadge ??
    "Medium";
  const typeBadge = form.injuryLevel !== "no-injury" ? "Injury" : "Near miss";
  const siteBadge = form.location.split("·")[0]?.trim() || "Plant A";

  const site = form.location.split("·")[0]?.trim() || "Plant A";
  const area = form.location.split("·")[1]?.trim() || "Line 2 — Press";
  const when = `${form.incidentDate} · ${form.incidentTime}`;

  const injuryLevelLabel =
    INJURY_LEVEL_OPTIONS.find((o) => o.id === form.injuryLevel)?.label ??
    "Medical treatment";
  const bodyPartsLabel = formatBodyPartSelection(form.bodyParts, form.bodySide);
  const witnessesLabel = form.witnesses || "None";

  const actionsLabel =
    form.immediateActions
      .map((id) => {
        if (id === "area-cordoned") return "Cordoned";
        if (id === "loto") return "LOTO";
        if (id === "first-aid") return "First aid";
        if (id === "supervisor-notified") return "Notified";
        if (id === "spill-contained") return "Contained";
        if (id === "photos-captured") return "Photos";
        return id;
      })
      .join(" · ") || "None";

  const photosCountLabel =
    form.photos.length > 0 ? `${form.photos.length} attached` : "3 attached";
  const followUpsCountLabel = `${form.suggestedFollowUp.length} suggested`;

  const reporterName = form.reportedBy || "Nadir Khan";
  const reporterDept = form.reporterEmail
    ? "Plant A · Press"
    : "Plant A · Press";
  const isAnonymous = "No";

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
              {form.title}
            </Text>

            <p className="text-ehs-gray text-[11.5px] leading-[17.5px]">
              {form.description}
            </p>
          </div>

          {/* Section 2: 2x2 Stats details grid */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {/* Card 1: WHERE & WHEN */}
            <div className="flex flex-col gap-2 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/62 p-4">
              <Text
                as="p"
                className="text-ehs-muted-text pb-1 text-[10px] font-bold tracking-[1.05px] uppercase"
              >
                Where & when
              </Text>
              <div className="flex flex-col gap-0.5 border-b border-[rgba(15,23,42,0.04)] pb-1.5 text-[11.5px] sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Site</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {site}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 border-b border-[rgba(15,23,42,0.04)] py-1.5 pb-1.5 text-[11.5px] last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Area</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {area}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 py-1.5 pb-0 text-[11.5px] last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">When</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {when}
                </span>
              </div>
            </div>

            {/* Card 2: PEOPLE */}
            <div className="flex flex-col gap-2 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/62 p-4">
              <Text
                as="p"
                className="text-ehs-muted-text pb-1 text-[10px] font-bold tracking-[1.05px] uppercase"
              >
                People
              </Text>
              <div className="flex flex-col gap-0.5 border-b border-[rgba(15,23,42,0.04)] pb-1.5 text-[11.5px] sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Injury</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {injuryLevelLabel}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 border-b border-[rgba(15,23,42,0.04)] py-1.5 pb-1.5 text-[11.5px] last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Body part</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {bodyPartsLabel}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 py-1.5 pb-0 text-[11.5px] last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Witnesses</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {witnessesLabel}
                </span>
              </div>
            </div>

            {/* Card 3: RESPONSE */}
            <div className="flex flex-col gap-2 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/62 p-4">
              <Text
                as="p"
                className="text-ehs-muted-text pb-1 text-[10px] font-bold tracking-[1.05px] uppercase"
              >
                Response
              </Text>
              <div className="flex flex-col gap-0.5 border-b border-[rgba(15,23,42,0.04)] pb-1.5 text-[11.5px] sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Actions</span>
                <span className="text-ehs-dark-bg max-w-full truncate text-left font-bold sm:max-w-[70%] sm:text-right">
                  {actionsLabel}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 border-b border-[rgba(15,23,42,0.04)] py-1.5 pb-1.5 text-[11.5px] last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Photos</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {photosCountLabel}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 py-1.5 pb-0 text-[11.5px] last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Follow-ups</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {followUpsCountLabel}
                </span>
              </div>
            </div>

            {/* Card 4: REPORTER */}
            <div className="flex flex-col gap-2 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/62 p-4">
              <Text
                as="p"
                className="text-ehs-muted-text pb-1 text-[10px] font-bold tracking-[1.05px] uppercase"
              >
                Reporter
              </Text>
              <div className="flex flex-col gap-0.5 border-b border-[rgba(15,23,42,0.04)] pb-1.5 text-[11.5px] sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Reported by</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {reporterName}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 border-b border-[rgba(15,23,42,0.04)] py-1.5 pb-1.5 text-[11.5px] last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Department</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {reporterDept}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 py-1.5 pb-0 text-[11.5px] last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-ehs-muted-text">Anonymous</span>
                <span className="text-ehs-dark-bg text-left font-bold sm:text-right">
                  {isAnonymous}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Routing preview banner */}
          <div className="flex items-start gap-3 rounded-[12px] border border-[#0891a6]/15 bg-[#0891a6]/5 p-3.5">
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
                Will be assigned to{" "}
                <span className="font-bold text-[#2a3446]">
                  Sarah Mitchell (EHS Manager, Plant A)
                </span>{" "}
                and copied to{" "}
                <span className="font-bold text-[#2a3446]">
                  Site Supervisor
                </span>
                .
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
                Mid-shift hydraulic hose failure on Plant A · Line 2. No
                operator contact; minor first-aid level injury. Equipment
                isolated, replacement parts en route. Recommend RCA + SOP
                review.
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
              onClick={handleSubmit}
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold shadow-[0px_6px_18px_-6px_#0891a6]"
            >
              Submit report
              <Icon
                icon="mdi:check"
                className="size-[13px]"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
