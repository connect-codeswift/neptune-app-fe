import {
  createInitialValues,
  type FormSchema,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import {
  LOTO_ENERGY_TYPES,
  LOTO_HAZARD_LEVELS,
  LOTO_ISOLATION_METHODS,
  type LotoIsolationStep,
  type LotoProcedureFormState,
} from "@/app/dashboard/lockout-tagout/loto-procedure-data";

export const LOTO_EQUIPMENT_FORM_ID = "loto-equipment-form";
export const LOTO_VERIFICATION_FORM_ID = "loto-verification-form";
export const LOTO_PPE_FORM_ID = "loto-ppe-form";

export function lotoStepFormId(stepId: string): string {
  return `loto-step-form-${stepId}`;
}

const hazardOptions: readonly SelectOption[] = LOTO_HAZARD_LEVELS.map(
  (level) => ({ value: level, label: level }),
);

const energyOptions: readonly SelectOption[] = LOTO_ENERGY_TYPES.map(
  (type) => ({ value: type, label: type }),
);

const methodOptions: readonly SelectOption[] = LOTO_ISOLATION_METHODS.map(
  (method) => ({ value: method, label: method }),
);

/**
 * Equipment Information card — Figma create/edit. Equipment ID and Location
 * are deliberately not FormBuilder fields: the code is backend-assigned (see
 * FEGuides/Loto.md) and Location is a search picker over the location
 * register (`LotoLocationSearchField`), both rendered directly in
 * `LotoProcedureForm`.
 */
export const lotoEquipmentSchema: FormSchema = [
  {
    type: "text",
    name: "equipmentName",
    label: "Equipment Name",
    required: true,
    colSpan: 6,
    placeholder: "e.g. Conveyor Belt Motor",
  },
  {
    type: "select",
    name: "hazardLevel",
    label: "Hazard Level",
    colSpan: 6,
    placeholder: "Select hazard level",
    options: hazardOptions,
  },
  {
    type: "textarea",
    name: "description",
    label: "Equipment Description",
    colSpan: 12,
    rows: 3,
    placeholder:
      "Describe the equipment, its function, and any relevant background information…",
  },
];

/** Single isolation step fields. */
export const lotoStepSchema: FormSchema = [
  {
    type: "text",
    name: "description",
    label: "Step Description",
    required: true,
    colSpan: 12,
    placeholder: "What action is performed in this step…",
  },
  {
    type: "text",
    name: "isolationPoint",
    label: "Isolation Point",
    colSpan: 6,
    placeholder: "e.g. MCC Panel CB-04 Breaker",
  },
  {
    type: "select",
    name: "energyType",
    label: "Energy Type",
    colSpan: 6,
    placeholder: "Select energy type",
    options: energyOptions,
  },
  {
    type: "select",
    name: "isolationMethod",
    label: "Isolation Method",
    colSpan: 6,
    placeholder: "Select method",
    options: methodOptions,
  },
  {
    type: "text",
    name: "lockTagPosition",
    label: "Lock/Tag Position",
    colSpan: 6,
    placeholder: "Open/Off",
  },
];

export const lotoVerificationSchema: FormSchema = [
  {
    type: "textarea",
    name: "verificationMethod",
    label: "Verification Method",
    colSpan: 12,
    rows: 3,
    placeholder:
      "Describe how to verify that all energy sources have been successfully isolated and the equipment is in a zero-energy state…",
  },
  {
    type: "textarea",
    name: "additionalNotes",
    label: "Additional Notes / Warnings",
    colSpan: 12,
    rows: 2,
    placeholder:
      "Any special warnings, stored energy concerns, or additional precautions…",
  },
];

/**
 * Required PPE chips. Options come from the PPE catalog (GET /api/ppe) via
 * `toPpeChipOptions`, so the schema is built per render rather than being a
 * module constant — pass `[]` while the catalog is still loading.
 */
export function makeLotoPpeSchema(
  options: readonly SelectOption[],
): FormSchema {
  return [
    {
      type: "chips",
      name: "selectedPpe",
      label: "Required PPE",
      colSpan: 12,
      options,
    },
  ];
}

export function toEquipmentFormValues(
  state: LotoProcedureFormState,
): FormValues {
  return {
    ...createInitialValues(lotoEquipmentSchema),
    equipmentName: state.equipmentName,
    hazardLevel: state.hazardLevel,
    description: state.description,
  };
}

export function toStepFormValues(step: LotoIsolationStep): FormValues {
  return {
    ...createInitialValues(lotoStepSchema),
    description: step.description,
    isolationPoint: step.isolationPoint,
    energyType: step.energyType,
    isolationMethod: step.isolationMethod,
    lockTagPosition: step.lockTagPosition,
  };
}

export function toVerificationFormValues(
  state: LotoProcedureFormState,
): FormValues {
  return {
    ...createInitialValues(lotoVerificationSchema),
    verificationMethod: state.verificationMethod,
    additionalNotes: state.additionalNotes,
  };
}

export function toPpeFormValues(state: LotoProcedureFormState): FormValues {
  return {
    ...createInitialValues(makeLotoPpeSchema([])),
    selectedPpe: [...state.selectedPpe],
  };
}

export function fieldString(values: FormValues, name: string): string {
  const value = values[name];
  return typeof value === "string" ? value : "";
}

export function fieldStringArray(values: FormValues, name: string): string[] {
  const value = values[name];
  return Array.isArray(value) ? value : [];
}

/** Keep only fields that belong to a given FormBuilder schema. */
export function pickSchemaValues(
  schema: FormSchema,
  values: FormValues,
): FormValues {
  const picked: FormValues = {};
  for (const field of schema) {
    const value = values[field.name];
    if (value !== undefined) {
      picked[field.name] = value;
    }
  }
  return picked;
}
