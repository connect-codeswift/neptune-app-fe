"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormSchema, FormValues } from "@/components/form-builder";
import {
  LOTO_ROUTE,
  createEmptyProcedureForm,
  getProcedureFormForEquipment,
  type LotoIsolationStep,
  type LotoProcedureFormState,
} from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { toast } from "@/lib/toast";
import {
  LotoProcedureForm,
  buildProcedurePreview,
  type LotoProcedurePreview,
} from "./LotoProcedureForm";
import { LotoProcedureHeader } from "./LotoProcedureHeader";
import {
  LOTO_EQUIPMENT_FORM_ID,
  LOTO_PERSONNEL_FORM_ID,
  LOTO_PPE_FORM_ID,
  LOTO_VERIFICATION_FORM_ID,
  fieldString,
  fieldStringArray,
  lotoStepFormId,
  pickSchemaValues,
} from "./loto-procedure-form-schema";

export type LotoProcedurePageContentProps = Readonly<{
  mode: "create" | "edit";
  equipmentId?: string;
}>;

export function LotoProcedurePageContent(props: LotoProcedurePageContentProps) {
  const { mode, equipmentId } = props;
  const router = useRouter();

  const [initial] = useState<LotoProcedureFormState>(() =>
    mode === "edit" && equipmentId
      ? getProcedureFormForEquipment(equipmentId)
      : createEmptyProcedureForm(),
  );
  const [steps, setSteps] = useState<LotoIsolationStep[]>(() => [
    ...initial.steps,
  ]);
  const [preview, setPreview] = useState<LotoProcedurePreview>(() =>
    buildProcedurePreview(initial),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formsToValidate = 4 + steps.length;
  const validatedCountRef = useRef(0);
  const gatheredRef = useRef<FormValues>({});
  const gatheredStepsRef = useRef<Record<string, FormValues>>({});

  const handleCancel = () => {
    router.push(LOTO_ROUTE);
  };

  const persistProcedure = () => {
    const equipmentName = fieldString(gatheredRef.current, "equipmentName");
    const equipmentCode = fieldString(gatheredRef.current, "equipmentCode");

    if (!equipmentName.trim() || !equipmentCode.trim()) {
      toast.error("Equipment name and ID are required");
      return;
    }

    for (const step of steps) {
      const stepValues = gatheredStepsRef.current[step.id];
      if (!stepValues || !fieldString(stepValues, "description").trim()) {
        toast.error("Each isolation step needs a description");
        return;
      }
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      toast.success(
        mode === "create" ? "LOTO procedure created" : "LOTO procedure saved",
      );
      setIsSubmitting(false);
      router.push(LOTO_ROUTE);
    }, 350);
  };

  const handleFormValid = (
    schema: FormSchema,
    submitted: FormValues,
    stepId?: string,
  ) => {
    if (stepId) {
      gatheredStepsRef.current[stepId] = pickSchemaValues(schema, submitted);
    } else {
      gatheredRef.current = {
        ...gatheredRef.current,
        ...pickSchemaValues(schema, submitted),
      };
    }

    validatedCountRef.current += 1;
    if (validatedCountRef.current >= formsToValidate) {
      validatedCountRef.current = 0;
      persistProcedure();
    }
  };

  const saveAll = () => {
    if (isSubmitting) return;

    validatedCountRef.current = 0;
    gatheredRef.current = {
      selectedPpe: fieldStringArray(
        { selectedPpe: initial.selectedPpe },
        "selectedPpe",
      ),
      selectedPersonnelIds: [...initial.selectedPersonnelIds],
    };
    gatheredStepsRef.current = {};

    const formIds = [
      LOTO_EQUIPMENT_FORM_ID,
      ...steps.map((step) => lotoStepFormId(step.id)),
      LOTO_VERIFICATION_FORM_ID,
      LOTO_PPE_FORM_ID,
      LOTO_PERSONNEL_FORM_ID,
    ];

    for (const id of formIds) {
      const form = document.getElementById(id);
      if (form instanceof HTMLFormElement) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <LotoProcedureHeader
        mode={mode}
        equipmentCode={preview.equipmentCode}
        onCancel={handleCancel}
        onSubmit={saveAll}
        isSubmitting={isSubmitting}
      />
      <LotoProcedureForm
        initial={initial}
        steps={steps}
        onStepsChange={setSteps}
        preview={preview}
        onPreviewChange={(patch) => {
          setPreview((current) => ({ ...current, ...patch }));
        }}
        onFormValid={handleFormValid}
      />
    </div>
  );
}
