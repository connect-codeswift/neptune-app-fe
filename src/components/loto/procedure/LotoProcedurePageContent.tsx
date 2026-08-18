"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormSchema, FormValues } from "@/components/form-builder";
import {
  LOTO_ROUTE,
  createEmptyIsolationStep,
  createEmptyProcedureForm,
  type LotoIsolationStep,
  type LotoLocationSelection,
  type LotoPersonnelSelection,
  type LotoProcedureFormState,
} from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import type { LotoEquipmentDetailDto } from "@/dtos/res/loto-response.dto";
import type { UpsertLotoEquipmentRequestDto } from "@/dtos/req/loto-request.dto";
import { withEquipmentPrefix } from "@/services/mappers/loto.mapper";
import { toast } from "@/lib/toast";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useLotoEquipmentDetailQuery } from "@/hooks/use-loto-queries";
import {
  useCreateLotoEquipmentMutation,
  useUpdateLotoEquipmentMutation,
} from "@/hooks/use-loto-mutations";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { LotoQueryStatus } from "../LotoQueryStatus";
import { Text } from "@/components/Text";
import {
  LotoProcedureForm,
  buildProcedurePreview,
  type LotoProcedurePreview,
} from "./LotoProcedureForm";
import { LotoProcedureHeader } from "./LotoProcedureHeader";
import {
  LOTO_EQUIPMENT_FORM_ID,
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

/** Routes create straight to a blank editor; edit loads the real equipment first. */
export function LotoProcedurePageContent(
  props: Readonly<LotoProcedurePageContentProps>,
) {
  const { mode, equipmentId } = props;
  const hasToken = useHasAccessToken();

  if (mode === "create") {
    return <LotoProcedureEditor mode="create" />;
  }

  return (
    <LotoProcedureEditLoader
      equipmentId={equipmentId ?? ""}
      hasToken={hasToken}
    />
  );
}

function toNumericId(idParam: string): number | null {
  const trimmed = idParam.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function LotoProcedureEditLoader(
  props: Readonly<{ equipmentId: string; hasToken: boolean | null }>,
) {
  const { equipmentId, hasToken } = props;
  const numericId = toNumericId(equipmentId);
  const detailQuery = useLotoEquipmentDetailQuery(numericId, hasToken === true);

  if (numericId === null) {
    return <EditNotFound equipmentId={equipmentId} />;
  }

  if (hasToken === null || (hasToken && detailQuery.isLoading)) {
    return <LotoQueryStatus state="loading" />;
  }

  if (detailQuery.isError) {
    return (
      <LotoQueryStatus
        state="error"
        message={getMutationErrorMessage(
          detailQuery.error,
          "Failed to load this equipment.",
        )}
      />
    );
  }

  const detail = detailQuery.data;
  if (!detail) {
    return <EditNotFound equipmentId={equipmentId} />;
  }

  return (
    <LotoProcedureEditor
      key={detail.id}
      mode="edit"
      equipmentId={detail.id}
      detail={detail}
    />
  );
}

function EditNotFound(props: Readonly<{ equipmentId: string }>) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <Text as="p" className="text4 text-ehs-darker">
        {`No equipment matches "${props.equipmentId}".`}
      </Text>
    </div>
  );
}

function detailToFormState(
  detail: LotoEquipmentDetailDto,
): LotoProcedureFormState {
  const hazardLevel =
    detail.hazardLevel === "Low" ||
    detail.hazardLevel === "Medium" ||
    detail.hazardLevel === "High"
      ? detail.hazardLevel
      : "";

  return {
    equipmentName: detail.name,
    location: { id: detail.locationId, name: detail.location },
    hazardLevel,
    description: detail.description ?? "",
    steps:
      detail.steps.length > 0
        ? detail.steps.map((step, index) =>
            createEmptyIsolationStep({
              id: `step-${String(index + 1)}`,
              description: step.description,
              isolationPoint: step.isolationPoint ?? "",
              energyType: step.energyType ?? "",
              lockTagPosition: step.lockTagPosition ?? "",
            }),
          )
        : [
            createEmptyIsolationStep({ id: "step-1" }),
            createEmptyIsolationStep({ id: "step-2" }),
          ],
    verificationMethod: "",
    additionalNotes: detail.additionalNotes ?? "",
    selectedPpe: [],
    selectedPersonnel: detail.authorizedPersonnel.map((person) => ({
      userId: person.userId,
      name: person.fullName,
    })),
  };
}

type LotoProcedureEditorProps =
  | Readonly<{ mode: "create" }>
  | Readonly<{
      mode: "edit";
      equipmentId: number;
      detail: LotoEquipmentDetailDto;
    }>;

/**
 * Owns the editable state and the POST/PUT /api/Loto/equipment submit. The
 * equipment code is never editable — the backend assigns it — so create and
 * edit share this same body shape (`UpsertLotoEquipmentRequestDto`).
 */
function LotoProcedureEditor(props: LotoProcedureEditorProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";

  const [initial] = useState<LotoProcedureFormState>(() =>
    isEdit ? detailToFormState(props.detail) : createEmptyProcedureForm(),
  );
  const [steps, setSteps] = useState<LotoIsolationStep[]>(() => [
    ...initial.steps,
  ]);
  const [location, setLocation] = useState<LotoLocationSelection | null>(
    initial.location,
  );
  const [personnel, setPersonnel] = useState<LotoPersonnelSelection[]>([
    ...initial.selectedPersonnel,
  ]);
  const [preview, setPreview] = useState<LotoProcedurePreview>(() =>
    buildProcedurePreview(initial),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateLotoEquipmentMutation();
  const updateMutation = useUpdateLotoEquipmentMutation();

  // Equipment + Verification + PPE forms, plus one per isolation step.
  const formsToValidate = 3 + steps.length;
  const validatedCountRef = useRef(0);
  const gatheredRef = useRef<FormValues>({});
  const gatheredStepsRef = useRef<Record<string, FormValues>>({});

  const handleCancel = () => {
    router.push(LOTO_ROUTE);
  };

  const persistProcedure = () => {
    const equipmentName = fieldString(gatheredRef.current, "equipmentName");
    const description = fieldString(gatheredRef.current, "description");
    const hazardLevel = fieldString(gatheredRef.current, "hazardLevel");
    const additionalNotes = fieldString(gatheredRef.current, "additionalNotes");

    if (!equipmentName.trim()) {
      toast.error("Equipment name is required");
      return;
    }

    if (!location) {
      toast.error("Select a location");
      return;
    }

    const stepPayloads = steps.map((step) => {
      const stepValues = gatheredStepsRef.current[step.id];
      return {
        description: stepValues ? fieldString(stepValues, "description") : "",
        isolationPoint: stepValues
          ? fieldString(stepValues, "isolationPoint")
          : "",
        energyType: stepValues ? fieldString(stepValues, "energyType") : "",
        lockTagPosition: stepValues
          ? fieldString(stepValues, "lockTagPosition")
          : "",
      };
    });

    for (const step of stepPayloads) {
      if (!step.description.trim()) {
        toast.error("Each isolation step needs a description");
        return;
      }
    }

    const payload: UpsertLotoEquipmentRequestDto = {
      name: equipmentName.trim(),
      locationId: location.id,
      description: description.trim() === "" ? null : description.trim(),
      hazardLevel:
        hazardLevel === "Low" ||
        hazardLevel === "Medium" ||
        hazardLevel === "High"
          ? hazardLevel
          : null,
      // Not editable from this form yet — preserved from the loaded record on
      // edit, defaulted for a brand-new machine on create.
      isOutOfService: isEdit ? props.detail.isOutOfService : false,
      lastInspectionAt: isEdit ? props.detail.lastInspectionAt : null,
      additionalNotes:
        additionalNotes.trim() === "" ? null : additionalNotes.trim(),
      steps: stepPayloads.map((step) => ({
        description: step.description.trim(),
        isolationPoint:
          step.isolationPoint.trim() === "" ? null : step.isolationPoint.trim(),
        energyType:
          step.energyType.trim() === "" ? null : step.energyType.trim(),
        lockTagPosition:
          step.lockTagPosition.trim() === ""
            ? null
            : step.lockTagPosition.trim(),
      })),
      authorizedUserIds: personnel.map((person) => person.userId),
    };

    setIsSubmitting(true);

    if (isEdit) {
      updateMutation.mutate(
        { id: props.equipmentId, payload },
        {
          onSuccess: () => {
            toast.success("LOTO procedure saved");
            router.push(LOTO_ROUTE);
          },
          onError: (error) => {
            toast.error(
              getMutationErrorMessage(error, "Failed to save the procedure."),
            );
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        toast.success(
          "LOTO procedure created",
          result
            ? `Equipment ${withEquipmentPrefix(result.equipmentCode)} registered.`
            : undefined,
        );
        router.push(LOTO_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(error, "Failed to create the procedure."),
        );
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
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
    };
    gatheredStepsRef.current = {};

    const formIds = [
      LOTO_EQUIPMENT_FORM_ID,
      ...steps.map((step) => lotoStepFormId(step.id)),
      LOTO_VERIFICATION_FORM_ID,
      LOTO_PPE_FORM_ID,
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
        mode={isEdit ? "edit" : "create"}
        equipmentCode={
          isEdit ? withEquipmentPrefix(props.detail.equipmentCode) : undefined
        }
        onCancel={handleCancel}
        onSubmit={saveAll}
        isSubmitting={isSubmitting}
      />
      <LotoProcedureForm
        initial={initial}
        steps={steps}
        onStepsChange={setSteps}
        location={location}
        onLocationChange={setLocation}
        personnel={personnel}
        onPersonnelChange={setPersonnel}
        preview={preview}
        onPreviewChange={(patch) => {
          setPreview((current) => ({ ...current, ...patch }));
        }}
        onFormValid={handleFormValid}
      />
    </div>
  );
}
