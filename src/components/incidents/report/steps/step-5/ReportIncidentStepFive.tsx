"use client";

import { useRouter } from "next/navigation";
import type { ReportStepId } from "@/forms/incident-module/steps";
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
  CLASSIFICATION_FIELDS,
  MECHANISM_OPTIONS,
  NATURE_OF_INJURY_OPTIONS,
  INITIAL_TREATMENT_OPTIONS,
  WHAT_TREATMENT_GIVEN_OPTIONS,
  TREATMENT_PROVIDER_OPTIONS,
  TREATMENT_LOCATION_OPTIONS,
  CASE_DISPOSITION_OPTIONS,
  formatBodyPartSelection,
} from "@/forms/incident-module/index";
import { ReportReviewDetailCard } from "@/components/incidents/report/steps/step-5/ReportReviewDetailCard";
import { formatIncidentLocationsLabel } from "@/components/incidents/report/shared/ReportLocationsField";
import { ReportFieldError } from "@/components/incidents/report/shared/ReportFormField";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useCreateIncidentMutation } from "@/hooks/use-incident-mutations";
import { getAccessToken } from "@/lib/axios";
import { toast } from "@/lib/toast";

export type ReportIncidentStepFiveProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  /** Jumps back to a step so a summarised answer can be corrected in place. */
  onGoToStep?: (step: ReportStepId) => void;
  /**
   * Called after the incident is created but before navigation away.
   * Receives the new incident id. Used by the near-miss convert flow to
   * link the near miss to the incident via POST …/convert-to-incident.
   */
  onAfterCreateIncident?: (incidentId: number) => Promise<void> | void;
  className?: string;
}>;

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

/**
 * The chip used for the summary badges at the top of this step and for the
 * immediate actions below. One definition on purpose: they sit on the same
 * screen a few centimetres apart, so two copies would drift.
 */
const reviewChipClass =
  "text-ehs-gray rounded-1.5 bg-ehs-surface-inverse/6 px-2.5 py-1 text-xs font-bold tracking-[0.2px]";

/**
 * The label a stored value was picked from, falling back to the value itself.
 *
 * The fallback is what makes reporter-typed entries survive: several of these
 * fields accept a custom option (`customOptions` on the form), which is stored
 * with the typed text as its own value and so matches nothing in the list. The
 * request mapper resolves labels the same way.
 */
function optionLabel(
  options: readonly (readonly [] | { value: string; label: string })[],
  value: string,
): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "—";
  }

  const match = (options as readonly { value: string; label: string }[]).find(
    (option) => option.value === trimmed,
  );

  return match?.label ?? trimmed;
}

/** Free text as entered, or an em dash so an empty row still reads as answered-blank. */
function textOrDash(value: string): string {
  return value.trim() || "—";
}

/**
 * Every classification answered on step 1, as one row.
 *
 * Six separate rows would swamp the card, and the unanswered ones carry no
 * information — the reporter is told which questions they left blank by the
 * step itself, not by a review card repeating six em dashes.
 */
function classificationsLabel(form: ReportIncidentFormState): string {
  return (
    CLASSIFICATION_FIELDS.map((field) => {
      const answer = (form.classifications[field.id] ?? "").trim();
      return answer ? `${field.label.replace(/\?$/, "")}: ${answer}` : null;
    })
      .filter(Boolean)
      .join(" · ") || "—"
  );
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
  const {
    form,
    onBack,
    onGoToStep,
    onAfterCreateIncident,
    className = "",
  } = props;
  const router = useRouter();
  const createIncidentMutation = useCreateIncidentMutation();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const submitErrors = attemptedSubmit ? getReportFormErrors(form) : null;

  // Held past the response, not just the request: `isPending` drops the
  // instant the incident is created while `router.push` is still fetching the
  // next route, and a click in that gap filed a duplicate report.
  const submitLock = useSubmitLock();

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

    if (!submitLock.acquire()) {
      return;
    }

    try {
      const created = await createIncidentMutation.mutateAsync(form);
      const createdId = created.id;

      toast.success(
        "Incident report submitted",
        "The incident has been recorded successfully.",
      );

      if (
        onAfterCreateIncident &&
        typeof createdId === "number" &&
        createdId > 0
      ) {
        try {
          await onAfterCreateIncident(createdId);
        } catch (linkError) {
          // Per FEGuide ConvertToIncident.md §2: surface the link error rather
          // than silently retrying, or a retry could create a duplicate incident.
          toast.error(
            "Incident created, but could not link to near miss",
            getMutationErrorMessage(
              linkError,
              "The incident was saved, but the link to the near miss failed. Please link them manually from the incident detail page.",
            ),
          );
        }
      }

      if (typeof createdId === "number" && createdId > 0) {
        router.push(`/dashboard/incidents/${String(createdId)}`);
        return;
      }

      router.push("/dashboard/incidents/list");
    } catch (error) {
      submitLock.release();
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
  // `formatBodyPartSelection` only knows the closed anatomical union, so the
  // reporter's own additions have to be appended or they vanish from the
  // review — the same join the AI draft input uses.
  const selectedBodyParts = formatBodyPartSelection(
    form.bodyParts,
    form.bodySide,
    form.bodyPartSides,
  );
  const bodyPartsLabel =
    [
      selectedBodyParts === "None selected" ? "" : selectedBodyParts,
      ...form.customBodyParts,
    ]
      .filter(Boolean)
      .join(", ") || "—";
  const affectedPersonLabel = form.affectedPerson.trim() || "—";
  const witnessesLabel =
    form.witnesses
      .map((witness) => witness.name.trim())
      .filter(Boolean)
      .join(", ") || "None";

  // Kept as id + label rather than a joined string: several actions run to a
  // few words each, and a single "·"-separated line wrapped mid-phrase so it
  // read as one long sentence instead of a set of discrete choices.
  const selectedActions = form.immediateActions.map((id) => ({
    id,
    label:
      IMMEDIATE_ACTION_OPTIONS.find((option) => option.id === id)?.label ?? id,
  }));

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

  // Severity's full label, not the badge's short form — the badge is already
  // above and this row is where the reporter checks the exact answer.
  const severityLabel =
    SEVERITY_OPTIONS.find((option) => option.id === form.severity)?.label ??
    "—";

  // First Aid is the only severity that collects the treatment block; every
  // other one is stamped "N/A" by NON_FIRST_AID_FIELD_DEFAULTS, and six rows
  // of "N/A" is noise rather than review.
  const isFirstAid = form.severity === "first-aid";
  const firstAidRows = isFirstAid
    ? [
        {
          label: "Treatment given",
          value: optionLabel(
            WHAT_TREATMENT_GIVEN_OPTIONS,
            form.whatTreatmentWasGiven,
          ),
        },
        {
          label: "Provided by",
          value: optionLabel(
            TREATMENT_PROVIDER_OPTIONS,
            form.treatmentProvidedBy,
          ),
        },
        {
          label: "Treated at",
          value: optionLabel(
            TREATMENT_LOCATION_OPTIONS,
            form.treatmentLocation,
          ),
        },
        { label: "Further medical", value: form.furtherMedicalRecommended },
        {
          label: "Fit for full duty",
          value: textOrDash(form.isFitForFullDuty),
        },
        {
          label: "Case disposition",
          value: optionLabel(CASE_DISPOSITION_OPTIONS, form.caseDisposition),
        },
      ]
    : [];
  const incidentTitle = previewTitle(form);

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-7.25"
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
              className="text-ehs-dark-bg text-[22px] font-bold tracking-[-0.44px]"
            >
              Review & submit
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              Quick check, then this routes to EHS automatically.
            </Text>
          </div>

          {/* Section 1: Top nested summary card */}
          <div className="rounded-3 border-ehs-border-ink/8 bg-ehs-surface/42 flex flex-col gap-2.5 border p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={reviewChipClass}>{severityBadge}</span>
              <span className={reviewChipClass}>{typeBadge}</span>
              <span className={reviewChipClass}>{siteBadge}</span>
            </div>

            <Text
              as="h3"
              className="text-ehs-dark-bg text-[16px] leading-normal font-bold"
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
              onEdit={onGoToStep ? () => onGoToStep(1) : undefined}
              rows={[
                { label: "Severity", value: severityLabel },
                { label: "Site", value: site },
                { label: "Area", value: incidentAreasLabel },
                { label: "When", value: when },
                { label: "Reported on", value: textOrDash(form.reportDate) },
                // Step 1's six yes/no answers. They belong on this card
                // because it is the one that edits step 1 — the rule the card
                // documents — even though the title speaks only of place and
                // time.
                { label: "Classifications", value: classificationsLabel(form) },
              ]}
              error={
                submitErrors?.location ?? submitErrors?.incidentDate ?? null
              }
            />
            {/*
              Regrouped so every card maps to exactly one step. Witnesses and Photos are
              both answered on step 2 but sat under People and Response, so a single edit
              button per card could only ever send the reporter to the wrong place for one
              of its rows.
            */}
            <ReportReviewDetailCard
              title="People & injury"
              onEdit={onGoToStep ? () => onGoToStep(3) : undefined}
              rows={[
                { label: "Affected", value: affectedPersonLabel },
                { label: "Gender", value: textOrDash(form.gender) },
                { label: "Injury", value: injuryLevelLabel },
                { label: "Body part", value: bodyPartsLabel },
                {
                  label: "Injury detail",
                  value: textOrDash(form.injuryDescription),
                },
              ]}
            />
            <ReportReviewDetailCard
              title="Details"
              onEdit={onGoToStep ? () => onGoToStep(2) : undefined}
              rows={[
                {
                  label: "Mechanism",
                  value: optionLabel(MECHANISM_OPTIONS, form.mechanismOfInjury),
                },
                {
                  label: "Nature",
                  value: optionLabel(
                    NATURE_OF_INJURY_OPTIONS,
                    form.natureOfInjury,
                  ),
                },
                {
                  label: "Object involved",
                  value: textOrDash(form.objectInvolved),
                },
                {
                  label: "Initial treatment",
                  value: optionLabel(
                    INITIAL_TREATMENT_OPTIONS,
                    form.initialTreatment,
                  ),
                },
                { label: "Further treatment", value: form.secondaryTreatment },
                ...firstAidRows,
                {
                  label: "OSHA notified",
                  value: form.oshaNotificationRequired,
                },
                { label: "Witnesses", value: witnessesLabel },
                { label: "Photos", value: photosCountLabel },
              ]}
            />
            <ReportReviewDetailCard
              title="Response"
              onEdit={onGoToStep ? () => onGoToStep(4) : undefined}
              rows={[
                {
                  label: "Actions",
                  // `justify-end` because the card right-aligns its value
                  // column; the chips have to wrap back towards the label
                  // rather than away from it.
                  value:
                    selectedActions.length > 0 ? (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {selectedActions.map((action) => (
                          <span key={action.id} className={reviewChipClass}>
                            {action.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "None"
                    ),
                },
                { label: "Notes", value: textOrDash(form.actionNotes) },
              ]}
            />

            <ReportReviewDetailCard
              title="Reporter"
              onEdit={onGoToStep ? () => onGoToStep(1) : undefined}
              paddingClassName="px-3.75 pt-3.75 pb-7.25"
              rows={[
                { label: "Reported by", value: reporterName },
                { label: "Email", value: textOrDash(form.reporterEmail) },
                { label: "Department", value: departmentLabel },
                { label: "Anonymous", value: anonymousLabel },
              ]}
            />
          </div>

          {submitErrors?.mechanismOfInjury || submitErrors?.natureOfInjury ? (
            <div className="flex flex-col gap-1" data-field-error="true">
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
          <div className="border-ehs-border bg-ehs-light-bg rounded-3 flex items-start gap-3 border p-3.5">
            <div className="text-ehs-normal-blue bg-ehs-normal-blue/10 rounded-1.5 mt-0.5 flex size-5 shrink-0 items-center justify-center">
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
          <div className="from-ehs-light-blue to-ehs-light-blue-hover border-ehs-normal-blue/15 rounded-3 flex items-start gap-3 border bg-linear-to-r p-3.5">
            <div className="text-ehs-normal-blue rounded-1.5 bg-ehs-surface mt-0.5 flex size-5 shrink-0 items-center justify-center shadow-sm">
              <Icon icon="mdi:creation-outline" className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text
                as="span"
                className="text-ehs-normal-blue text-sm font-bold"
              >
                AI summary ready
              </Text>
              <p className="text-ehs-slate text-xs leading-3.75">
                {form.description.trim() ||
                  "AI summary will be generated from your report after submit."}
              </p>
            </div>
          </div>
        </div>

        {/* Form Bottom Toolbar Actions */}
        <div className="border-ehs-border-ink/8 border-t pt-5.25">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              disabled={submitLock.isLocked}
              className="rounded-2.5 px-3.75 py-2.5 text-sm font-bold"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-3.25"
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
              disabled={submitLock.isLocked}
              className="rounded-2.5 px-3.75 py-2.5 text-sm font-bold shadow-(--ehs-shadow-button-primary-flat)"
            >
              {submitLock.isLocked ? (
                <>
                  Submitting…
                  <Icon
                    icon="mdi:loading"
                    className="size-3.25 animate-spin"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <>
                  Submit report
                  <Icon
                    icon="mdi:check"
                    className="size-3.25"
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
