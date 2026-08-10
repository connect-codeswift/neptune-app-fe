"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  applySeverityFieldDefaults,
  createInitialReportFormState,
  EMPTY_AI_DRAFTS,
  EMPTY_FIRST_AID_FIELDS,
  filterTreatmentsForSeverity,
  formatBodyPartSelection,
  injuryLevelForReport,
  INJURY_LEVEL_OPTIONS,
  NON_FIRST_AID_FIELD_DEFAULTS,
  SEVERITY_OPTIONS,
  severityOptionFor,
  type ReportIncidentFormState,
  type ReportStepId,
} from "@/components/incidents/report/shared/report-incident-data";
import { buildDraftAssistInput } from "@/components/incidents/report/shared/report-ai-draft";
import { useDraftAssistMutation } from "@/hooks/use-ai-text-mutations";
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
} from "@/components/incidents/report/steps";
import { toast } from "@/lib/toast";
import { logAiAssistFailure } from "@/services/ai-text.service";

const PREVIEW_FORM_DEFAULTS: Partial<ReportIncidentFormState> = {
  location: "Plant A · Assembly Line 2",
  reportedBy: "Preview User",
  reporterEmail: "preview@example.com",
};

function renderStepForm(
  currentStep: ReportStepId,
  form: ReportIncidentFormState,
  updateForm: (next: Partial<ReportIncidentFormState>) => void,
  handleBack: () => void,
  handleContinue: () => void,
  previewMode: boolean,
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
      return (
        <ReportIncidentStepFive {...sharedProps} previewMode={previewMode} />
      );
    default:
      return null;
  }
}

export type ReportIncidentViewProps = Readonly<{
  /** UI-only walkthrough — no login, no API submit. */
  previewMode?: boolean;
}>;

export function ReportIncidentView(props: Readonly<ReportIncidentViewProps>) {
  const { previewMode = false } = props;
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ReportStepId>(1);
  const [form, setForm] = useState<ReportIncidentFormState>(() => ({
    ...createInitialReportFormState(),
    ...(previewMode ? PREVIEW_FORM_DEFAULTS : {}),
  }));
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

  const severityOption = severityOptionFor(normalizedForm.severity);
  const livePreviewBadge = severityOption?.previewBadge ?? "—";
  const livePreviewTitle =
    normalizedForm.title.trim() || severityOption?.label || "Incident report";

  const updateForm = (next: Partial<ReportIncidentFormState>) => {
    setForm((prev) => {
      const merged: ReportIncidentFormState = {
        ...createInitialReportFormState(),
        ...prev,
        ...next,
      };

      // Severity changed: First Aid → collect fields; other severities → defaults.
      // Also keep form.title in sync so Live preview / review use Severity as title.
      // Illegal treatments for the new severity are dropped here too.
      if (next.severity !== undefined && next.severity !== prev.severity) {
        const severityTitle =
          SEVERITY_OPTIONS.find((option) => option.id === next.severity)
            ?.label ?? merged.title;
        const initialTreatment = filterTreatmentsForSeverity(
          next.severity,
          merged.initialTreatment,
        );

        if (next.severity === "first-aid") {
          return {
            ...merged,
            ...EMPTY_FIRST_AID_FIELDS,
            initialTreatment,
            title: severityTitle,
          };
        }

        return {
          ...merged,
          ...NON_FIRST_AID_FIELD_DEFAULTS,
          initialTreatment,
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
    if (step > currentStep) {
      if (currentStep === 1) {
        const validationError = validateStepOne(form);
        if (validationError) {
          toast.error("Missing required fields", validationError);
          return;
        }
      }
    }

    // Leaving step 3: kick off action-notes / injury drafts for later steps.
    if (currentStep === 3 && step > currentStep) {
      requestFollowUpDrafts(normalizedForm);
    }

    setCurrentStep(step);
  };

  /**
   * The reporter's injury selections, as the labels the model is shown.
   *
   * Both are withheld until a body part has actually been picked. Step 3 starts
   * on "No injury" by default, and that default is not an answer — sending it
   * with the first request (fired from step 2, before the reporter has even
   * seen the step) would tell the model there was no injury and suppress the
   * very draft this is meant to produce. A selected body part is the signal
   * that these fields carry the reporter's intent rather than a default.
   */
  const readInjuryContext = (source: ReportIncidentFormState) => {
    const selected = formatBodyPartSelection(
      source.bodyParts,
      source.bodySide,
      source.bodyPartSides,
    );

    const named = selected === "None selected" ? "" : selected;
    const injuredBodyPart = [named, ...source.customBodyParts]
      .filter(Boolean)
      .join(", ");

    if (!injuredBodyPart) {
      return { injuryLevel: "", injuredBodyPart: "" };
    }

    const derivedLevel = injuryLevelForReport(
      source.severity,
      source.natureOfInjury,
    );

    return {
      injuryLevel:
        INJURY_LEVEL_OPTIONS.find((option) => option.id === derivedLevel)
          ?.label ?? "",
      injuredBodyPart,
    };
  };

  /**
   * Injury-description and action-notes drafts (not the main narrative — that
   * drafts in-field at the end of step 3). Fire-and-forget; never toast.
   */
  const requestFollowUpDrafts = (source: ReportIncidentFormState) => {
    if (draftAssist.isPending) {
      return;
    }

    const injury = readInjuryContext(source);
    const key = [
      source.description.trim(),
      injury.injuryLevel,
      injury.injuredBodyPart,
      source.natureOfInjury,
      source.initialTreatment.join(","),
    ].join("|");

    if (key === source.aiDraftSource) {
      return;
    }

    updateForm({ aiDraftPending: true });

    draftAssist
      .mutateAsync(buildDraftAssistInput(source))
      .then((drafts) => {
        setForm((prev) => ({
          ...prev,
          aiDraftPending: false,
          aiDraftSource: key,
          aiDrafts: {
            injuryDescription: prev.injuryDescription.trim()
              ? null
              : drafts.injuryDescription,
            actionNotes: prev.actionNotes.trim() ? null : drafts.actionNotes,
          },
        }));
      })
      .catch((error: unknown) => {
        logAiAssistFailure("draft-assist", error);
        setForm((prev) => ({
          ...prev,
          aiDraftPending: false,
          aiDrafts: EMPTY_AI_DRAFTS,
        }));
      });
  };

  /**
   * Offer an injury-description draft once nature + body part are chosen on
   * step 3 — before the main narrative is written.
   */
  const injuryContextKey = (() => {
    const injury = readInjuryContext(normalizedForm);
    return `${normalizedForm.natureOfInjury}|${injury.injuryLevel}|${injury.injuredBodyPart}`;
  })();

  useEffect(() => {
    if (
      currentStep !== 3 ||
      !normalizedForm.natureOfInjury ||
      normalizedForm.natureOfInjury === "none" ||
      normalizedForm.injuryDescription.trim()
    ) {
      return;
    }

    const injury = readInjuryContext(normalizedForm);
    if (!injury.injuredBodyPart) {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      requestFollowUpDrafts(normalizedForm);
    }, 900);

    return () => {
      globalThis.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, injuryContextKey, normalizedForm.injuryDescription]);

  const handleContinue = () => {
    if (currentStep === 3) {
      requestFollowUpDrafts(normalizedForm);
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
    if (!previewMode) {
      router.push("/dashboard/incidents/list");
    }
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      {previewMode ? (
        <div className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950">
          Preview mode — no login or backend. Walk the full 5-step flow; submit
          is disabled.
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        <ReportIncidentPageHeader
          onSaveExit={() => {
            if (!previewMode) {
              router.push("/dashboard/incidents/list");
            }
          }}
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
            previewMode,
          )}

          <ReportIncidentAside
            severityBadge={livePreviewBadge}
            location={normalizedForm.location}
            title={livePreviewTitle}
            description={normalizedForm.description}
            currentStep={currentStep}
            className="col-span-1 md:col-span-2 xl:col-span-1"
          />
        </div>
      </div>
    </div>
  );
}
