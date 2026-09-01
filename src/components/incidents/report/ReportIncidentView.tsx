"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  applySeverityFieldDefaults,
  createInitialReportFormState,
  EMPTY_FIRST_AID_FIELDS,
  NON_FIRST_AID_FIELD_DEFAULTS,
  SEVERITY_OPTIONS,
  severityOptionFor,
  isSeverityPicked,
  type ReportIncidentFormState,
  type ReportStepId,
} from "@/forms/incident-module/index";
import { formatIncidentLocationsLabel } from "@/components/incidents/report/shared/ReportLocationsField";
import { ReportIncidentAside } from "@/components/incidents/report/shared/ReportIncidentAside";
import { ReportIncidentPageHeader } from "@/components/incidents/report/shared/ReportIncidentPageHeader";
import { ReportIncidentSteps } from "@/components/incidents/report/shared/ReportIncidentSteps";
import {
  ReportIncidentStepFive,
  ReportIncidentStepFour,
  ReportIncidentStepOne,
  ReportIncidentStepThree,
  ReportIncidentStepTwo,
  validateStepOne,
  validateStepTwo,
} from "@/components/incidents/report/steps";

/**
 * Per-step gate for forward navigation, keyed by the step being left.
 *
 * Each entry is the step's own validator, so the stepper and that step's Continue
 * button apply one set of rules rather than two that can drift apart. A step with no
 * entry is one with no required answers, and is legitimately skippable.
 */
const STEP_VALIDATORS: Partial<
  Record<ReportStepId, (form: ReportIncidentFormState) => string | null>
> = {
  1: validateStepOne,
  2: validateStepTwo,
};

function renderStepForm(
  currentStep: ReportStepId,
  form: ReportIncidentFormState,
  updateForm: (next: Partial<ReportIncidentFormState>) => void,
  handleBack: () => void,
  handleContinue: () => void,
  showStepFieldErrors: Partial<Record<ReportStepId, boolean>>,
  goToStep: (step: ReportStepId) => void,
  onAfterCreateIncident?: (incidentId: number) => Promise<void> | void,
) {
  const sharedProps = {
    form,
    onChange: updateForm,
    onBack: handleBack,
    onContinue: handleContinue,
  };

  switch (currentStep) {
    case 1:
      return (
        <ReportIncidentStepOne
          {...sharedProps}
          showFieldErrors={showStepFieldErrors[1] ?? false}
        />
      );
    case 2:
      return (
        <ReportIncidentStepTwo
          {...sharedProps}
          showFieldErrors={showStepFieldErrors[2] ?? false}
        />
      );
    case 3:
      return <ReportIncidentStepThree {...sharedProps} />;
    case 4:
      return <ReportIncidentStepFour {...sharedProps} />;
    case 5:
      return (
        <ReportIncidentStepFive
          {...sharedProps}
          onGoToStep={goToStep}
          onAfterCreateIncident={onAfterCreateIncident}
        />
      );
    default:
      return null;
  }
}

export type ReportIncidentViewProps = Readonly<{
  initialForm?: Partial<ReportIncidentFormState>;
  exitHref?: string;
  headerTitle?: string;
  backHref?: string;
  backLabel?: string;
  /** Called after the incident is created (step 5 submit) with the new incident id. */
  onAfterCreateIncident?: (incidentId: number) => Promise<void> | void;
}>;

export function ReportIncidentView(props: Readonly<ReportIncidentViewProps>) {
  const {
    initialForm,
    exitHref = "/dashboard/incidents/list",
    headerTitle,
    backHref,
    backLabel,
    onAfterCreateIncident,
  } = props;
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ReportStepId>(1);
  const [form, setForm] = useState<ReportIncidentFormState>(() => ({
    ...createInitialReportFormState(),
    ...initialForm,
  }));
  const [showStepFieldErrors, setShowStepFieldErrors] = useState<
    Partial<Record<ReportStepId, boolean>>
  >({});

  // Fast Refresh can keep older form state that predates step-2 fields.
  const formDefaults = createInitialReportFormState();
  const normalizedForm: ReportIncidentFormState = applySeverityFieldDefaults({
    ...formDefaults,
    ...form,
    photos: form.photos ?? formDefaults.photos,
    bodyParts: form.bodyParts ?? formDefaults.bodyParts,
    bodyPartSides: form.bodyPartSides ?? formDefaults.bodyPartSides,
    incidentLocations: form.incidentLocations ?? formDefaults.incidentLocations,
    customIncidentLocations:
      form.customIncidentLocations ?? formDefaults.customIncidentLocations,
  });

  const severityOption = isSeverityPicked(normalizedForm.severity)
    ? severityOptionFor(normalizedForm.severity)
    : undefined;
  const livePreviewBadge = severityOption?.previewBadge ?? "—";

  const updateForm = (next: Partial<ReportIncidentFormState>) => {
    setForm((prev) => {
      const merged: ReportIncidentFormState = {
        ...createInitialReportFormState(),
        ...prev,
        ...next,
      };

      // Severity changed: First Aid → collect fields; other severities → defaults.
      // Also keep form.title in sync so Live preview / review use Severity as title.
      if (next.severity !== undefined && next.severity !== prev.severity) {
        const severityTitle = isSeverityPicked(next.severity)
          ? (SEVERITY_OPTIONS.find((option) => option.id === next.severity)
              ?.label ?? merged.title)
          : merged.title;

        if (next.severity === "first-aid") {
          return {
            ...merged,
            ...EMPTY_FIRST_AID_FIELDS,
            title: severityTitle,
          };
        }

        return {
          ...merged,
          ...NON_FIRST_AID_FIELD_DEFAULTS,
          title: severityTitle,
        };
      }

      return applySeverityFieldDefaults(merged);
    });
  };

  /**
   * The left-hand stepper is a shortcut, not an escape hatch: jumping forward
   * out of a step has to clear the same check its Continue button does.
   * Going back is always allowed, so a reporter can review earlier answers.
   *
   * Steps 3 and 4 have no entry yet because they define no required answers;
   * adding one here is all that is needed once they do.
   */
  const goToStep = (step: ReportStepId) => {
    if (step > currentStep) {
      const validateCurrentStep = STEP_VALIDATORS[currentStep];
      if (validateCurrentStep?.(normalizedForm)) {
        setShowStepFieldErrors((current) => ({
          ...current,
          [currentStep]: true,
        }));
        return;
      }
    }

    setShowStepFieldErrors((current) => ({ ...current, [currentStep]: false }));
    setCurrentStep(step);
  };

  const handleContinue = () => {
    if (currentStep < 5) {
      setShowStepFieldErrors((current) => ({
        ...current,
        [currentStep]: false,
      }));
      setCurrentStep((currentStep + 1) as ReportStepId);
    }
  };

  // The step rail stays: it is the only way to move between steps from here, and the
  // review cards' own edit buttons lean on the same navigation.
  const isReviewStep = currentStep === 5;

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as ReportStepId);
      return;
    }
    router.push(exitHref);
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        <ReportIncidentPageHeader
          onSaveExit={() => router.push(exitHref)}
          backHref={backHref}
          backLabel={backLabel}
          title={headerTitle}
        />

        <div
          className={[
            "mt-3.5 grid grid-cols-1 gap-3.5 py-3.5 md:grid-cols-[220px_minmax(0,1fr)] xl:items-start",
            // Review runs full width. The aside is a live preview of the report being
            // written, and on the review step it previews what the page already is —
            // so it only costs the summary the room to lay out its cards.
            isReviewStep ? "" : "xl:grid-cols-[220px_minmax(0,1fr)_320px]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <ReportIncidentSteps
            currentStep={currentStep}
            onStepChange={goToStep}
          />

          {renderStepForm(
            currentStep,
            normalizedForm,
            updateForm,
            handleBack,
            handleContinue,
            showStepFieldErrors,
            goToStep,
            onAfterCreateIncident,
          )}

          {isReviewStep ? null : (
            <ReportIncidentAside
              severityBadge={livePreviewBadge}
              location={[
                normalizedForm.location,
                formatIncidentLocationsLabel(
                  normalizedForm.incidentLocations ?? [],
                ),
              ]
                .filter(Boolean)
                .join(" · ")}
              title={
                normalizedForm.title.trim() ||
                (isSeverityPicked(normalizedForm.severity)
                  ? (severityOption?.label ?? "Incident report")
                  : "Incident report")
              }
              description={normalizedForm.description}
              currentStep={currentStep}
              className="col-span-1 md:col-span-2 xl:col-span-1"
            />
          )}
        </div>
      </div>
    </div>
  );
}
