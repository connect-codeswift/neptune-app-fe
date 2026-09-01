"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import {
  applySeverityFieldDefaults,
  createInitialReportFormState,
  EMPTY_AI_DRAFTS,
  EMPTY_FIRST_AID_FIELDS,
  formatBodyPartSelection,
  INJURY_LEVEL_OPTIONS,
  NON_FIRST_AID_FIELD_DEFAULTS,
  SEVERITY_OPTIONS,
  severityOptionFor,
  isSeverityPicked,
  type ReportIncidentFormState,
  type ReportStepId,
} from "@/forms/incident-module/index";
import { buildDraftAssistInput } from "@/components/incidents/report/shared/report-ai-draft";
import { formatIncidentLocationsLabel } from "@/components/incidents/report/shared/ReportLocationsField";
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
  validateStepTwo,
} from "@/components/incidents/report/steps";
import { logAiAssistFailure } from "@/services/ai-text.service";
import {
  useDeleteIncidentDraftMutation,
  useSaveIncidentDraftMutation,
} from "@/hooks/use-incident-draft-queries";
import {
  REPORT_DRAFT_PAYLOAD_VERSION,
  toDraftPayload,
} from "@/forms/incident-module/draft-payload";

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
  /**
   * The draft this wizard saves into. Supplied when resuming one; otherwise a new
   * id is minted here, so every report has somewhere to be saved from the start
   * and "Save & exit" never has to decide whether a draft exists yet.
   */
  draftId?: string;
  /** Step to open on. Used when resuming a draft where the reporter left off. */
  initialStep?: ReportStepId;
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
    draftId,
    initialStep,
    exitHref = "/dashboard/incidents/list",
    headerTitle,
    backHref,
    backLabel,
    onAfterCreateIncident,
  } = props;
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ReportStepId>(
    initialStep ?? 1,
  );
  const [form, setForm] = useState<ReportIncidentFormState>(() => ({
    ...createInitialReportFormState(),
    ...initialForm,
  }));
  const [showStepFieldErrors, setShowStepFieldErrors] = useState<
    Partial<Record<ReportStepId, boolean>>
  >({});
  const draftAssist = useDraftAssistMutation();
  const saveDraftMutation = useSaveIncidentDraftMutation();
  const deleteDraftMutation = useDeleteIncidentDraftMutation();

  /**
   * The id this report saves under, stable for the life of the wizard.
   *
   * <p>A lazy state initializer, so it is minted exactly once per mount. Minting
   * it inline during render would produce a new id on every re-render and turn a
   * reporter's second save into a second draft. It exists even for a report that
   * is never saved, which is what lets the save be a plain PUT with no "have I
   * saved before?" branch.</p>
   */
  const [reportDraftId] = useState<string>(
    () => draftId ?? crypto.randomUUID(),
  );

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

    // Skipping ahead out of step 2 via the stepper has to draft just as
    // Continue does, or the reporter reaches step 3 with nothing waiting.
    if (currentStep === 2 && step > currentStep) {
      requestDrafts(normalizedForm);
    }

    setShowStepFieldErrors((current) => ({ ...current, [currentStep]: false }));
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

    // The formatter reports "None selected" for an empty pick; that is display
    // copy, not a body part, and must never reach the model.
    const named = selected === "None selected" ? "" : selected;
    const injuredBodyPart = [named, ...source.customBodyParts]
      .filter(Boolean)
      .join(", ");

    if (!injuredBodyPart) {
      return { injuryLevel: "", injuredBodyPart: "" };
    }

    return {
      injuryLevel:
        INJURY_LEVEL_OPTIONS.find((option) => option.id === source.injuryLevel)
          ?.label ?? "",
      injuredBodyPart,
    };
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

    const injury = readInjuryContext(source);
    const key = [description, injury.injuryLevel, injury.injuredBodyPart].join(
      "|",
    );

    // Nothing the model depends on has changed, so the drafts we hold stand.
    if (key === source.aiDraftSource) {
      return;
    }

    updateForm({ aiDraftPending: true });

    // The full picture, not just the description: the injury draft now reads
    // mechanism, nature and initial treatment alongside body part and injury
    // level, which is what lets it produce clinical detail rather than
    // restating "was injured".
    draftAssist
      .mutateAsync(buildDraftAssistInput(source))
      .then((drafts) => {
        setForm((prev) => ({
          ...prev,
          aiDraftPending: false,
          aiDraftSource: key,
          aiDrafts: {
            // A field the reporter has already filled in is theirs. Offering a
            // draft over the top of their own words is the one place this
            // feature could destroy work rather than save it.
            injuryDescription: prev.injuryDescription.trim()
              ? null
              : drafts.injuryDescription,
            actionNotes: prev.actionNotes.trim() ? null : drafts.actionNotes,
          },
          // `drafts.description` is ignored here on purpose. It is offered in
          // the field itself on step 2, and by the time this runs the reporter
          // has left that step — putting a draft behind them is not an offer
          // they can act on.
        }));
      })
      .catch((error: unknown) => {
        // Deliberately silent for the reporter — drafts are an offer, and a
        // failed offer should not interrupt the report. Silent for us too was
        // the mistake: without this the whole feature can be dark and look
        // like the model simply had nothing to suggest.
        logAiAssistFailure("draft-assist", error);
        setForm((prev) => ({
          ...prev,
          aiDraftPending: false,
          aiDrafts: EMPTY_AI_DRAFTS,
        }));
      });
  };

  /**
   * Ask again once the reporter has picked a body part or injury level.
   *
   * The first request goes out as they leave step 2, when neither of those
   * exists yet — and the model may not invent a body part, so for any
   * description that does not name one the injury draft comes back empty. This
   * is the retry that makes it possible, fired from step 3 where the selections
   * are made.
   *
   * Only when it can actually help: skipped once the reporter has written their
   * own injury description, and skipped while a call is in flight. The delay
   * lets someone click through several body parts without spending a request on
   * each one, which also keeps this clear of the server's per-user limit.
   */
  const injuryContextKey = (() => {
    const injury = readInjuryContext(normalizedForm);
    return `${injury.injuryLevel}|${injury.injuredBodyPart}`;
  })();

  useEffect(() => {
    if (currentStep !== 3 || normalizedForm.injuryDescription.trim()) {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      requestDrafts(normalizedForm);
    }, 900);

    return () => {
      globalThis.clearTimeout(timer);
    };
    // Keyed on the selections themselves: requestDrafts is a no-op when the
    // model's inputs are unchanged, so a re-render cannot cause a second call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, injuryContextKey, normalizedForm.injuryDescription]);

  const handleContinue = () => {
    if (currentStep === 2) {
      requestDrafts(normalizedForm);
    }

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

  /**
   * The report has been filed, so the draft of it is finished with.
   *
   * <p>Deleting it is what stops the same event being filed twice from a tab
   * left open on the drafts list. It is deliberately not allowed to fail the
   * submission: the incident is already saved by this point, and telling a
   * reporter their report failed because a draft could not be tidied up would be
   * both wrong and alarming. A draft that outlives its incident is a stale row,
   * not a lost record.</p>
   */
  const handleAfterCreateIncident = async (incidentId: number) => {
    try {
      await deleteDraftMutation.mutateAsync(reportDraftId);
    } catch {
      // Intentionally swallowed. See above.
    }

    if (onAfterCreateIncident) {
      await onAfterCreateIncident(incidentId);
    }
  };

  /**
   * Saves the unfinished report, then leaves.
   *
   * <p>This button used to be `router.push(exitHref)` and nothing else, so four
   * steps of typing were discarded under a control that says Save. The order
   * matters: navigation happens only after the save resolves, and a failed save
   * keeps the reporter on the page with their work still in front of them. The
   * one thing this must never do is leave and lose it quietly, which is exactly
   * what it did before.</p>
   */
  const handleSaveExit = async () => {
    if (saveDraftMutation.isPending) return;

    try {
      await saveDraftMutation.mutateAsync({
        draftId: reportDraftId,
        body: {
          title: normalizedForm.title.trim() || null,
          currentStep,
          payloadVersion: REPORT_DRAFT_PAYLOAD_VERSION,
          payload: toDraftPayload(normalizedForm),
        },
      });

      toast.success(
        "Draft saved",
        "Pick it up from Drafts when you are ready.",
      );
      router.push(exitHref);
    } catch {
      toast.error(
        "Could not save your draft",
        "Nothing has been lost. Check your connection and try again.",
      );
    }
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        <ReportIncidentPageHeader
          onSaveExit={() => void handleSaveExit()}
          isSavingExit={saveDraftMutation.isPending}
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
            handleAfterCreateIncident,
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
