"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
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
  lotoVerificationSchema,
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

  const equipmentSchema = makeLotoEquipmentSchema(
    <LotoLocationSearchField
      value={location}
      onChange={(next) => {
        onLocationChange(next);
        onPreviewChange({ location: next?.name ?? "" });
      }}
    />,
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
        </IncidentGlassCard>

        <IncidentGlassCard paddingClassName="p-5 md:p-5.5" className="min-w-0">
          <Text as="h2" className="text3 text-ehs-darker mb-1">
            Authorized Personnel
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text mb-3">
            Only these users can perform this LOTO procedure
          </Text>
          <MultipleUsersPickerInput
            label="Authorized Personnel"
            hideLabel
            required
            placeholder="Search people at this site…"
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
        </IncidentGlassCard>

        <IncidentGlassCard paddingClassName="p-5 md:p-5.5" className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Text as="h2" className="text3 text-ehs-darker">
              Isolation Steps
            </Text>
            <button
              type="button"
              onClick={addStep}
              className="text4 text-ehs-normal-blue border-ehs-normal-blue/20 bg-ehs-normal-blue/12 hover:bg-ehs-normal-blue/18 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 font-semibold transition-colors"
            >
              <Icon icon="mdi:plus" className="size-3.5" aria-hidden="true" />
              Add Step
            </button>
          </div>
          <Text as="p" className="text8 text-ehs-muted-text mb-3">
            Document each energy isolation point in the sequence they must be
            performed
          </Text>

          <div className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-4 border-ehs-border-ink/8 bg-ehs-surface/50 border p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Text as="span" className="text5 text-ehs-darker">
                      {`Step ${String(index + 1)}`}
                    </Text>
                    {step.verified ? (
                      <Text
                        as="span"
                        className="text8 text-ehs-green bg-ehs-green/10 rounded-lg px-1.5 py-px font-bold"
                      >
                        Verified
                      </Text>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove step ${String(index + 1)}`}
                    disabled={steps.length <= 1}
                    onClick={() => {
                      removeStep(step.id);
                    }}
                    className="text-ehs-red hover:bg-ehs-red/8 flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon
                      icon="mdi:trash-can-outline"
                      className="size-5"
                      aria-hidden="true"
                    />
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

        <IncidentGlassCard paddingClassName="p-5 md:p-5.5" className="min-w-0">
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
