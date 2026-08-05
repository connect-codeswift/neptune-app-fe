"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  applySeverityFieldDefaults,
  createInitialReportFormState,
  EMPTY_AI_DRAFTS,
  EMPTY_FIRST_AID_FIELDS,
  NON_FIRST_AID_FIELD_DEFAULTS,
  replaceAiFollowUps,
  SEVERITY_OPTIONS,
  type ReportIncidentFormState,
  type ReportStepId,
} from "@/components/incidents/report/shared/report-incident-data";
import { useDraftAssistMutation } from "@/hooks/use-ai-text-mutations";
import { parseReportDateTime } from "@/services/mappers/report-incident.mapper";
import { ReportIncidentAside } from "@/components/incidents/report/shared/ReportIncidentAside";
import { ReportIncidentPageHeader } from "@/components/incidents/report/shared/ReportIncidentPageHeader";
import { ReportIncidentSteps } from "@/components/incidents/report/shared/ReportIncidentSteps";
import { ReportIncidentToolbar } from "@/components/incidents/report/shared/ReportIncidentToolbar";
import {
  ReportIncidentStepFive,
  ReportIncidentStepFour,
  ReportIncidentStepOne,
  ReportIncidentStepThree,
  ReportIncidentStepTwo,
  validateStepOne,
} from "@/components/incidents/report/steps";
import { toast } from "@/lib/toast";

function renderStepForm(
  currentStep: ReportStepId,
  form: ReportIncidentFormState,
  updateForm: (next: Partial<ReportIncidentFormState>) => void,
  handleBack: () => void,
  handleContinue: () => void,
) {
  const sharedProps = {
    form,
    onChange: updateForm,
    onBack: handleBack,
    onContinue: handleContinue,
  };

  switch (currentStep) {
    case 1:
      return <ReportIncidentStepOne {...sharedProps} />;
    case 2:
      return <ReportIncidentStepTwo {...sharedProps} />;
    case 3:
      return <ReportIncidentStepThree {...sharedProps} />;
    case 4:
      return <ReportIncidentStepFour {...sharedProps} />;
    case 5:
      return <ReportIncidentStepFive {...sharedProps} />;
    default:
      return null;
  }
}

export function ReportIncidentView() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ReportStepId>(1);
  const [form, setForm] = useState<ReportIncidentFormState>(
    createInitialReportFormState,
  );
  const draftAssist = useDraftAssistMutation();

  // Fast Refresh can keep older form state that predates step-2 fields.
  const formDefaults = createInitialReportFormState();
  const normalizedForm: ReportIncidentFormState = applySeverityFieldDefaults({
    ...formDefaults,
    ...form,
    photos: form.photos ?? formDefaults.photos,
    bodyParts: form.bodyParts ?? formDefaults.bodyParts,
    bodyPartSides: form.bodyPartSides ?? formDefaults.bodyPartSides,
  });

  const severityOption =
    SEVERITY_OPTIONS.find((option) => option.id === normalizedForm.severity) ??
    SEVERITY_OPTIONS[1];

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
        const severityTitle =
          SEVERITY_OPTIONS.find((option) => option.id === next.severity)
            ?.label ?? merged.title;

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
   * out of Step 1 has to clear the same check the Continue button does.
   * Going back is always allowed, so a reporter can review earlier answers.
   */
  const goToStep = (step: ReportStepId) => {
    if (step > currentStep && currentStep === 1) {
      const validationError = validateStepOne(form);
      if (validationError) {
        toast.error("Missing required fields", validationError);
        return;
      }
    }

    // Skipping ahead out of step 2 via the stepper has to draft just as
    // Continue does, or the reporter reaches step 3 with nothing waiting.
    if (currentStep === 2 && step > currentStep) {
      requestDrafts(normalizedForm);
    }

    setCurrentStep(step);
  };

  /**
   * Generates the step 3 and 4 drafts from the step 2 description.
   *
   * Fire and forget on purpose: the reporter lands on step 3 immediately and
   * the drafts settle in behind them. Nothing here may ever block or slow
   * reporting an incident, so every failure path is silent — no toast, because
   * they never asked for this call and interrupting them over it would be
   * worse than the missing suggestion.
   */
  const requestDrafts = (source: ReportIncidentFormState) => {
    const description = source.description.trim();

    if (!description || draftAssist.isPending) {
      return;
    }

    // Unchanged description means the drafts we already hold are still good.
    if (description === source.aiDraftSource) {
      return;
    }

    updateForm({ aiDraftPending: true });

    draftAssist
      .mutateAsync({
        description,
        severity:
          SEVERITY_OPTIONS.find((option) => option.id === source.severity)
            ?.label ?? source.severity,
        location: source.location,
        incidentAt: parseReportDateTime(
          source.incidentDate,
          source.incidentTime,
        ),
      })
      .then((drafts) => {
        setForm((prev) => ({
          ...prev,
          aiDraftPending: false,
          aiDraftSource: description,
          aiDrafts: {
            // A field the reporter has already filled in is theirs. Offering a
            // draft over the top of their own words is the one place this
            // feature could destroy work rather than save it.
            injuryDescription: prev.injuryDescription.trim()
              ? null
              : drafts.injuryDescription,
            actionNotes: prev.actionNotes.trim() ? null : drafts.actionNotes,
          },
          followUps: replaceAiFollowUps(
            prev.followUps,
            drafts.suggestedFollowUps,
          ),
        }));
      })
      .catch(() => {
        setForm((prev) => ({
          ...prev,
          aiDraftPending: false,
          aiDrafts: EMPTY_AI_DRAFTS,
        }));
      });
  };

  const handleContinue = () => {
    if (currentStep === 2) {
      requestDrafts(normalizedForm);
    }

    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as ReportStepId);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as ReportStepId);
      return;
    }
    router.push("/dashboard/incidents/list");
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <ReportIncidentToolbar className="px-3 sm:px-4" />

      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        <ReportIncidentPageHeader
          onSaveExit={() => router.push("/dashboard/incidents/list")}
        />

        <div className="mt-3.5 grid grid-cols-1 gap-3.5 py-3.5 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px] xl:items-start">
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
          )}

          <ReportIncidentAside
            severityBadge={severityOption.previewBadge}
            location={normalizedForm.location}
            title={normalizedForm.title.trim() || severityOption.label}
            description={normalizedForm.description}
            currentStep={currentStep}
            className="col-span-1 md:col-span-2 xl:col-span-1"
          />
        </div>
      </div>
    </div>
  );
}
