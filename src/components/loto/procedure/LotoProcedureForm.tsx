"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { LotoCertificationPanel } from "@/components/loto/procedure/LotoCertificationPanel";
import { Button } from "@/components/ui/Button";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { useDraftMutation } from "@/hooks/use-ai-text-mutations";
import { logAiAssistFailure } from "@/services/ai-text.service";
import { toast } from "@/lib/toast";
import {
  FormBuilder,
  type FormSchema,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  createEmptyIsolationStep,
  hazardLevelClassName,
  type LotoHazardLevel,
  type LotoIsolationStep,
  type LotoLocationSelection,
  type LotoPersonnelSelection,
  type LotoProcedureFormState,
} from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { LotoLocationSearchField } from "./LotoLocationSearchField";
import { MultipleUsersPickerInput } from "@/components/inputs/MultipleUsersPickerInput";
import { getCurrentUser } from "@/lib/current-user";
import {
  LOTO_EQUIPMENT_FORM_ID,
  LOTO_PPE_FORM_ID,
  LOTO_VERIFICATION_FORM_ID,
  fieldString,
  fieldStringArray,
  lotoStepFormId,
  lotoStepSchema,
  makeLotoVerificationSchema,
  makeLotoEquipmentSchema,
  makeLotoPpeSchema,
  toEquipmentFormValues,
  toPpeFormValues,
  toStepFormValues,
  toVerificationFormValues,
} from "./loto-procedure-form-schema";

/**
 * Typography-only overrides for FormBuilder defaults.
 * Do not set fixed heights on inputs/selects — that clips padded dropdowns.
 */
const equipmentFieldClass = [
  "gap-4",
  "[&_label]:text8",
  "[&_label]:font-semibold",
  "[&_label]:text-ehs-gray",
  "[&_input]:text4",
  "[&_select]:text4",
  "[&_textarea]:text4",
  "[&_button]:text4",
  "[&_p]:text8",
].join(" ");

const stepFieldClass = [
  "gap-3",
  "[&_label]:text8",
  "[&_label]:font-semibold",
  "[&_label]:text-ehs-muted-text",
  "[&_input]:text4",
  "[&_select]:text4",
  "[&_textarea]:text4",
  "[&_button]:text4",
  "[&_p]:text8",
].join(" ");

const sidebarFieldClass = [
  "gap-3",
  // Section title (FieldShell label — not checkbox option rows)
  "[&_label:not(.flex)]:text3",
  "[&_label:not(.flex)]:text-ehs-darker",
  // Chip / checkbox option text
  "[&_button]:text4",
  "[&_label.flex]:text4",
  "[&_label.flex_span]:text4",
  "[&_p]:text8",
  "[&_p]:text-ehs-muted-text",
].join(" ");

export type LotoProcedurePreview = Readonly<{
  equipmentName: string;
  location: string;
  hazardLevel: LotoHazardLevel;
  stepCount: number;
  ppeCount: number;
}>;

export type LotoProcedureFormProps = Readonly<{
  mode: "create" | "edit";
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  initial: LotoProcedureFormState;
  steps: readonly LotoIsolationStep[];
  onStepsChange: (steps: LotoIsolationStep[]) => void;
  location: LotoLocationSelection | null;
  onLocationChange: (location: LotoLocationSelection | null) => void;
  personnel: readonly LotoPersonnelSelection[];
  onPersonnelChange: (personnel: LotoPersonnelSelection[]) => void;
  preview: LotoProcedurePreview;
  onPreviewChange: (patch: Partial<LotoProcedurePreview>) => void;
  /** Required-PPE chips, from the PPE catalog (GET /api/ppe). */
  ppeOptions: readonly SelectOption[];
  /** Shown above the chips while the catalog is loading, empty, or failed. */
  ppeStatusMessage: string | null;
  onFormValid: (
    schema: FormSchema,
    values: FormValues,
    stepId?: string,
  ) => void;
}>;

function SummaryRow(
  props: Readonly<{
    label: string;
    value: string;
    valueClassName?: string;
  }>,
) {
  return (
    <div className="border-ehs-border-ink/8 flex items-start justify-between gap-3 border-b py-2">
      <Text as="span" className="text9 text-ehs-muted-text">
        {props.label}
      </Text>
      <Text
        as="span"
        className={[
          "text4 text-right",
          props.valueClassName ?? "text-ehs-darker",
        ].join(" ")}
      >
        {props.value}
      </Text>
    </div>
  );
}

function displayOrDash(text: string): string {
  return text.trim() ? text : "—";
}

/** Create / edit procedure body using FormBuilder — Figma 6912:56200 / 6915:56769. */
export function LotoProcedureForm(props: Readonly<LotoProcedureFormProps>) {
  const {
    mode,
    onCancel,
    onSubmit,
    isSubmitting = false,
    initial,
    steps,
    onStepsChange,
    location,
    onLocationChange,
    personnel,
    onPersonnelChange,
    preview,
    onPreviewChange,
    onFormValid,
    ppeOptions,
    ppeStatusMessage,
  } = props;

  // Proofread and paraphrase on the three free-text fields. Click-driven only —
  // there is no draft-assist for LOTO, because a procedure is authored from
  // knowledge of the machine rather than composed from answers already on the
  // form. Nothing fires on change.
  //
  // The equipment name and location go along as context. Without them a rewrite
  // reads an abbreviation the way an outsider would: "hydralic pres in bay 4"
  // came back as "the hydraulic pressure in Bay 4", turning a press into a
  // pressure. With the equipment name in hand it reads it correctly.
  const assistContext = {
    "Equipment name": preview.equipmentName,
    Location: preview.location,
    "Hazard level": preview.hazardLevel,
  };

  // Draft, on the equipment description only.
  //
  // The name is the whole input: "Conveyor Belt Motor" already says what the
  // machine is, and the prompt describes that class of equipment in general
  // terms. It is explicitly barred from inventing anything specific to this one
  // — no voltage, capacity or energy sources — because someone isolates a
  // machine from this record. The other two boxes get no draft: a verification
  // method and the notes are knowledge of this machine, and there is nothing on
  // the form to compose them from.
  const [descriptionDraftPending, setDescriptionDraftPending] = useState(false);
  const draftMutation = useDraftMutation("loto");

  const runDescriptionDraft = (apply: (next: string) => void) => {
    if (preview.equipmentName.trim() === "") {
      toast.info(
        "Name the equipment first",
        "The description is drafted from the equipment name.",
      );
      return;
    }

    setDescriptionDraftPending(true);
    draftMutation
      .mutateAsync({ fields: assistContext })
      .then((results) => {
        const narrative = results.narrative ?? null;

        // Null is an answer: the name is too generic to describe. "Machine 3"
        // can only be rearranged, not described.
        if (narrative === null) {
          toast.info(
            "Nothing to draft yet",
            "The equipment name is too general to describe. Name the equipment and try again.",
          );
          return;
        }

        apply(narrative);
      })
      .catch((error: unknown) => {
        logAiAssistFailure("loto-draft", error);
        toast.error(
          "Couldn't draft a description",
          "Your text is unchanged. Try again in a moment.",
        );
      })
      .finally(() => {
        setDescriptionDraftPending(false);
      });
  };
  const equipmentSchema = makeLotoEquipmentSchema(
    <LotoLocationSearchField
      value={location}
      onChange={(next) => {
        onLocationChange(next);
        onPreviewChange({ location: next?.name ?? "" });
      }}
    />,
    (control) => (
      <AiTextAssistant
        module="loto"
        value={control.value}
        onApply={control.onChange}
        contextFields={assistContext}
        draftPending={descriptionDraftPending}
        onRegenerateDraft={() => runDescriptionDraft(control.onChange)}
      />
    ),
  );

  const verificationSchema = makeLotoVerificationSchema(
    (control) => (
      <AiTextAssistant
        module="loto"
        value={control.value}
        onApply={control.onChange}
        contextFields={assistContext}
      />
    ),
    (control) => (
      <AiTextAssistant
        module="loto"
        value={control.value}
        onApply={control.onChange}
        contextFields={assistContext}
      />
    ),
  );

  const ppeSchema = makeLotoPpeSchema(ppeOptions);

  const addStep = () => {
    const next = createEmptyIsolationStep();
    onStepsChange([...steps, next]);
    onPreviewChange({ stepCount: steps.length + 1 });
  };

  const removeStep = (stepId: string) => {
    if (steps.length <= 1) return;
    const next = steps.filter((step) => step.id !== stepId);
    onStepsChange(next);
    onPreviewChange({ stepCount: next.length });
  };

  const ppeCountLabel =
    preview.ppeCount === 1 ? "1 item" : `${String(preview.ppeCount)} items`;

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_363px]">
      <div className="flex min-w-0 flex-col gap-4">
        <IncidentGlassCard paddingClassName="p-5 md:p-5.5" className="min-w-0">
          <Text as="h2" className="text3 text-ehs-darker mb-4">
            Equipment Information
          </Text>
          <FormBuilder
            formId={LOTO_EQUIPMENT_FORM_ID}
            schema={equipmentSchema}
            initialValues={toEquipmentFormValues(initial)}
            hideActions
            onChange={(values) => {
              onPreviewChange({
                equipmentName: fieldString(values, "equipmentName"),
                hazardLevel: fieldString(
                  values,
                  "hazardLevel",
                ) as LotoHazardLevel,
              });
            }}
            onSubmit={(values) => {
              onFormValid(equipmentSchema, values);
            }}
            className={equipmentFieldClass}
          />

          {/* Part of Equipment Information, under Description: a procedure
              nobody is authorized to perform cannot be applied, so this belongs
              with the machine's own details rather than in a card of its own. */}
          <div className="border-ehs-border-ink/8 mt-4 border-t pt-4">
            <Text as="h3" className="text4 text-ehs-darker mb-1 font-semibold">
              Authorized Personnel
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text mb-2.5">
              Only these users can perform this LOTO procedure
            </Text>
            <MultipleUsersPickerInput
              label="Authorized Personnel"
              hideLabel
              required
              placeholder="Search people…"
              value={personnel.map((person) => ({
                userId: String(person.userId),
                name: person.name,
              }))}
              onChange={(next) => {
                onPersonnelChange(
                  next.map((entry) => ({
                    userId: Number(entry.userId),
                    name: entry.name,
                  })),
                );
              }}
              siteId={getCurrentUser().siteId}
              // Any registered, active user on the site is eligible — but an
              // outstanding invitation or a soft-deleted account is not a person
              // who can be authorized on a lockout.
              filter={(user) => !user.isInvited && !user.isDrop}
            />
          </div>

          <LotoCertificationPanel personnel={personnel} />
        </IncidentGlassCard>

        <IncidentGlassCard paddingClassName="p-5 md:p-5.5" className="min-w-0">
          <Text as="h2" className="text3 text-ehs-darker">
            Isolation Steps
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text mt-0.5 mb-1">
            Document each energy isolation point in the sequence they must be
            performed
          </Text>

          {/*
           * A hairline-divided list, not a stack of cards. Each step used to
           * carry its own border, fill and padding inside a card that already
           * had all three, so the panel read as boxes within a box and the
           * chrome competed with the fields for attention. The rule between
           * rows separates them just as well at a fraction of the weight.
           *
           * The number moves into a rail on the left, which also gives the
           * sequence something to read down — these steps are performed in
           * order, and "Step 1" as a text heading on every row said that four
           * times over while pushing the first field further down each time.
           */}
          <div className="divide-ehs-border-ink/8 flex flex-col divide-y">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-3 py-4 last:pb-0">
                <span className="text8 text-ehs-muted-text bg-ehs-surface-inverse/6 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full font-semibold tabular-nums">
                  {/* The numeral alone reads as a bare "1" out of context, so
                      the word it replaced is kept for a screen reader. */}
                  <span className="sr-only">Step </span>
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  {/*
                   * Only drawn when it has something to say. An always-present
                   * row would add its height and margin to every step to hold
                   * nothing, which on a fresh single-step form is the common
                   * case.
                   */}
                  {step.verified || steps.length > 1 ? (
                    <div className="mb-2 flex min-h-6 items-center justify-between gap-2">
                      {step.verified ? (
                        <Text
                          as="span"
                          className="text8 text-ehs-green bg-ehs-green/10 rounded-lg px-1.5 py-px font-bold"
                        >
                          Verified
                        </Text>
                      ) : (
                        <span />
                      )}
                      {/*
                       * Hidden on the only step, not disabled. A procedure with no
                       * isolation steps is not a procedure, so the last one can
                       * never be removed — and a control that is permanently greyed
                       * out on a fresh form reads as broken rather than as a rule.
                       * There is nothing the author can do to enable it until they
                       * add a second step, so it earns no space until then.
                       *
                       * `removeStep` keeps its own guard: this decides what is
                       * shown, that decides what is allowed.
                       */}
                      {steps.length > 1 ? (
                        <button
                          type="button"
                          aria-label={`Remove step ${String(index + 1)}`}
                          onClick={() => {
                            removeStep(step.id);
                          }}
                          // Muted until pointed at. It is a destructive action
                          // on a row the author is still filling in, so it
                          // should be reachable without standing out.
                          className="text-ehs-muted-text hover:text-ehs-red hover:bg-ehs-red/8 flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
                        >
                          <Icon
                            icon="mdi:trash-can-outline"
                            className="size-4.5"
                            aria-hidden="true"
                          />
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  <FormBuilder
                    formId={lotoStepFormId(step.id)}
                    schema={lotoStepSchema}
                    initialValues={toStepFormValues(step)}
                    hideActions
                    onSubmit={(values) => {
                      onFormValid(lotoStepSchema, values, step.id);
                    }}
                    className={stepFieldClass}
                  />
                </div>
              </div>
            ))}
          </div>

          {/*
           * At the end of the sequence rather than up in the heading. A step is
           * appended to the bottom of the list, so the control that appends one
           * belongs where the new row will appear — and the heading keeps its
           * weight for the section title.
           */}
          <button
            type="button"
            onClick={addStep}
            className="text4 text-ehs-normal-blue border-ehs-border-ink/12 hover:border-ehs-normal-blue/30 hover:bg-ehs-normal-blue/6 mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed font-medium transition-colors"
          >
            <Icon icon="mdi:plus" className="size-3.5" aria-hidden="true" />
            Add Step
          </button>
        </IncidentGlassCard>

        <IncidentGlassCard paddingClassName="p-5 md:p-5.5" className="min-w-0">
          <FormBuilder
            formId={LOTO_VERIFICATION_FORM_ID}
            schema={verificationSchema}
            initialValues={toVerificationFormValues(initial)}
            hideActions
            onSubmit={(values) => {
              onFormValid(verificationSchema, values);
            }}
            className={equipmentFieldClass}
          />
        </IncidentGlassCard>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="text4 rounded-2.5 px-4 py-2.5 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="text4 rounded-2.5 gap-2 px-4 py-2.5 font-semibold shadow-[0px_4px_6px_color-mix(in_oklab,var(--ehs-normal-blue)_30%,transparent)]"
          >
            <Icon
              icon={mode === "create" ? "mdi:plus" : "mdi:content-save-outline"}
              className="size-3.5 shrink-0"
            />
            {mode === "create" ? "Create Procedure" : "Save Changes"}
          </Button>
        </div>
      </div>

      <aside className="flex min-w-0 flex-col gap-3.5 xl:sticky xl:top-4">
        <IncidentGlassCard
          paddingClassName="px-4.5 py-4.5"
          className="min-w-0 bg-[rgba(255,255,255,0.82)]"
        >
          <Text as="h2" className="text3 text-ehs-darker mb-3">
            Procedure Summary
          </Text>
          <div className="flex flex-col">
            <SummaryRow
              label="Equipment"
              value={displayOrDash(preview.equipmentName)}
            />
            <SummaryRow
              label="Location"
              value={displayOrDash(preview.location)}
            />
            <SummaryRow
              label="Hazard Level"
              value={preview.hazardLevel || "—"}
              valueClassName={hazardLevelClassName(preview.hazardLevel)}
            />
            <SummaryRow
              label="Isolation Steps"
              value={String(preview.stepCount)}
            />
            <SummaryRow label="PPE Required" value={ppeCountLabel} />
          </div>
        </IncidentGlassCard>

        <IncidentGlassCard paddingClassName="p-4.5" className="min-w-0">
          <FormBuilder
            formId={LOTO_PPE_FORM_ID}
            schema={ppeSchema}
            initialValues={toPpeFormValues(initial)}
            hideActions
            onChange={(values) => {
              onPreviewChange({
                ppeCount: fieldStringArray(values, "selectedPpe").length,
              });
            }}
            onSubmit={(values) => {
              onFormValid(ppeSchema, values);
            }}
            className={sidebarFieldClass}
          />
          {ppeStatusMessage ? (
            <p className="text8 text-ehs-muted-text mt-1">{ppeStatusMessage}</p>
          ) : null}
        </IncidentGlassCard>
      </aside>
    </div>
  );
}

export function buildProcedurePreview(
  state: LotoProcedureFormState,
): LotoProcedurePreview {
  return {
    equipmentName: state.equipmentName,
    location: state.location?.name ?? "",
    hazardLevel: state.hazardLevel,
    stepCount: state.steps.length,
    ppeCount: state.selectedPpe.length,
  };
}
