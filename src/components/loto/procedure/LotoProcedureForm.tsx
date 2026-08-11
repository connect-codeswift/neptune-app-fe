"use client";

import { Icon } from "@iconify/react";
import {
  FormBuilder,
  type FormSchema,
  type FormValues,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  createEmptyIsolationStep,
  hazardLevelClassName,
  type LotoHazardLevel,
  type LotoIsolationStep,
  type LotoProcedureFormState,
} from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import {
  LOTO_EQUIPMENT_FORM_ID,
  LOTO_PERSONNEL_FORM_ID,
  LOTO_PPE_FORM_ID,
  LOTO_VERIFICATION_FORM_ID,
  fieldString,
  fieldStringArray,
  lotoEquipmentSchema,
  lotoPersonnelSchema,
  lotoPpeSchema,
  lotoStepFormId,
  lotoStepSchema,
  lotoVerificationSchema,
  toEquipmentFormValues,
  toPersonnelFormValues,
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
  equipmentCode: string;
  location: string;
  hazardLevel: LotoHazardLevel;
  stepCount: number;
  ppeCount: number;
}>;

export type LotoProcedureFormProps = Readonly<{
  initial: LotoProcedureFormState;
  steps: readonly LotoIsolationStep[];
  onStepsChange: (steps: LotoIsolationStep[]) => void;
  preview: LotoProcedurePreview;
  onPreviewChange: (patch: Partial<LotoProcedurePreview>) => void;
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
    <div className="flex items-start justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] py-2">
      <span className="text6 text-ehs-muted-text">{props.label}</span>
      <span
        className={[
          "text4 text-right",
          props.valueClassName ?? "text-ehs-darker",
        ].join(" ")}
      >
        {props.value}
      </span>
    </div>
  );
}

function displayOrDash(text: string): string {
  return text.trim() ? text : "—";
}

/** Create / edit procedure body using FormBuilder — Figma 6912:56200 / 6915:56769. */
export function LotoProcedureForm(props: LotoProcedureFormProps) {
  const {
    initial,
    steps,
    onStepsChange,
    preview,
    onPreviewChange,
    onFormValid,
  } = props;

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
        <IncidentGlassCard
          paddingClassName="p-5 md:p-[22px]"
          className="min-w-0"
        >
          <h2 className="text3 text-ehs-darker mb-4">Equipment Information</h2>
          <FormBuilder
            formId={LOTO_EQUIPMENT_FORM_ID}
            schema={lotoEquipmentSchema}
            initialValues={toEquipmentFormValues(initial)}
            hideActions
            onChange={(values) => {
              onPreviewChange({
                equipmentName: fieldString(values, "equipmentName"),
                equipmentCode: fieldString(values, "equipmentCode"),
                location: fieldString(values, "location"),
                hazardLevel: fieldString(
                  values,
                  "hazardLevel",
                ) as LotoHazardLevel,
              });
            }}
            onSubmit={(values) => {
              onFormValid(lotoEquipmentSchema, values);
            }}
            className={equipmentFieldClass}
          />
        </IncidentGlassCard>

        <IncidentGlassCard
          paddingClassName="p-5 md:p-[22px]"
          className="min-w-0"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text3 text-ehs-darker">Isolation Steps</h2>
            <button
              type="button"
              onClick={addStep}
              className="text4 text-ehs-normal-blue inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[rgba(8,145,166,0.2)] bg-[rgba(8,145,166,0.12)] px-3 font-semibold transition-colors hover:bg-[rgba(8,145,166,0.18)]"
            >
              <Icon icon="mdi:plus" className="size-3.5" />
              Add Step
            </button>
          </div>
          <p className="text8 text-ehs-muted-text mb-3">
            Document each energy isolation point in the sequence they must be
            performed
          </p>

          <div className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-3.5 border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.5)] p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text5 text-ehs-darker">
                      Step {String(index + 1)}
                    </span>
                    {step.verified ? (
                      <span className="text8 rounded-[5px] bg-[rgba(16,185,129,0.1)] px-1.5 py-px font-bold text-[#10b981]">
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove step ${String(index + 1)}`}
                    disabled={steps.length <= 1}
                    onClick={() => {
                      removeStep(step.id);
                    }}
                    className="flex size-[26px] cursor-pointer items-center justify-center rounded-[7px] text-[#ef4444] transition-colors hover:bg-[rgba(239,68,68,0.08)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon icon="mdi:trash-can-outline" className="size-3" />
                  </button>
                </div>

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
            ))}
          </div>
        </IncidentGlassCard>

        <IncidentGlassCard
          paddingClassName="p-5 md:p-[22px]"
          className="min-w-0"
        >
          <FormBuilder
            formId={LOTO_VERIFICATION_FORM_ID}
            schema={lotoVerificationSchema}
            initialValues={toVerificationFormValues(initial)}
            hideActions
            onSubmit={(values) => {
              onFormValid(lotoVerificationSchema, values);
            }}
            className={equipmentFieldClass}
          />
        </IncidentGlassCard>
      </div>

      <aside className="flex min-w-0 flex-col gap-3.5 xl:sticky xl:top-4">
        <IncidentGlassCard
          paddingClassName="px-[18px] py-[18px]"
          className="min-w-0 bg-[rgba(255,255,255,0.82)]"
        >
          <h2 className="text3 text-ehs-darker mb-3">Procedure Summary</h2>
          <div className="flex flex-col">
            <SummaryRow
              label="Equipment"
              value={displayOrDash(preview.equipmentName)}
            />
            <SummaryRow
              label="ID"
              value={displayOrDash(preview.equipmentCode)}
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

        <IncidentGlassCard paddingClassName="p-[18px]" className="min-w-0">
          <FormBuilder
            formId={LOTO_PPE_FORM_ID}
            schema={lotoPpeSchema}
            initialValues={toPpeFormValues(initial)}
            hideActions
            onChange={(values) => {
              onPreviewChange({
                ppeCount: fieldStringArray(values, "selectedPpe").length,
              });
            }}
            onSubmit={(values) => {
              onFormValid(lotoPpeSchema, values);
            }}
            className={sidebarFieldClass}
          />
        </IncidentGlassCard>

        <IncidentGlassCard paddingClassName="p-[18px]" className="min-w-0">
          <FormBuilder
            formId={LOTO_PERSONNEL_FORM_ID}
            schema={lotoPersonnelSchema}
            initialValues={toPersonnelFormValues(initial)}
            hideActions
            onSubmit={(values) => {
              onFormValid(lotoPersonnelSchema, values);
            }}
            className={sidebarFieldClass}
          />
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
    equipmentCode: state.equipmentCode,
    location: state.location,
    hazardLevel: state.hazardLevel,
    stepCount: state.steps.length,
    ppeCount: state.selectedPpe.length,
  };
}
