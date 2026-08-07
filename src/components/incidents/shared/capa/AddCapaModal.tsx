"use client";

import { useId, useState } from "react";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { Text } from "@/components/Text";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";
import {
  CapaHierarchySelector,
  type ControlLevel,
} from "@/components/incidents/shared/capa/CapaHierarchySelector";
import { CapaSegmentedToggle } from "@/components/incidents/shared/capa/CapaSegmentedToggle";
import {
  IncidentModalCancelButton,
  IncidentModalPrimaryButton,
  IncidentModalShell,
} from "@/components/incidents/shared/capa/IncidentModalShell";
import { ReportPersonSearchField } from "@/components/incidents/report/shared/ReportPersonSearchField";
import { ReportDateField } from "@/components/incidents/report/shared/ReportDateField";
import { useCapaTasksQuery } from "@/hooks/use-capa-queries";
import { useCurrentSite } from "@/hooks/use-current-site";
import { toSelectorControlLevel } from "@/services/mappers/capa.mapper";

export type CapaFormPayload = Readonly<{
  controlLevel: ControlLevel;
  description: string;
  type: string;
  owner: string;
  dueDate: string;
  priority: string;
}>;

export type AddCapaModalProps = Readonly<{
  incidentId: string;
  incidentTitle: string;
  capaId?: string;
  capaToEdit?: CapaItem;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit?: (payload: CapaFormPayload) => void | Promise<void>;
}>;

const TYPE_OPTIONS = ["Corrective", "Preventive"] as const;
const PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;

type CapaModalFormProps = Readonly<{
  incidentId: string;
  incidentTitle: string;
  capaId: string;
  capaToEdit?: CapaItem;
  isSubmitting: boolean;
  initialDescription: string;
  initialOwnerUserId: string;
  initialDueDate: string;
  onClose: () => void;
  onSubmit?: (payload: CapaFormPayload) => void | Promise<void>;
}>;

function StepBadge(props: Readonly<{ step: string }>) {
  const { step } = props;

  return (
    <span className="bg-ehs-normal-blue text-ehs-light-text inline-flex size-6 shrink-0 items-center justify-center rounded-full pt-[1.5px] pb-[2.5px] text-sm leading-5">
      {step}
    </span>
  );
}

function FieldLabel(
  props: Readonly<{ children: string; required?: boolean; htmlFor?: string }>,
) {
  const { children, required = false, htmlFor } = props;

  return (
    <label
      htmlFor={htmlFor}
      className="text-ehs-gray block text-sm leading-[19.5px]"
    >
      {children}
      {required ? <span className="text-ehs-red"> *</span> : null}
    </label>
  );
}

function CapaModalForm(props: Readonly<CapaModalFormProps>) {
  const {
    incidentId,
    incidentTitle,
    capaId,
    capaToEdit,
    isSubmitting,
    initialDescription,
    initialOwnerUserId,
    initialDueDate,
    onClose,
    onSubmit,
  } = props;

  const isEditMode = capaToEdit != null;
  const descriptionFieldId = useId();
  const site = useCurrentSite();

  const [controlLevel, setControlLevel] = useState<ControlLevel | null>(() =>
    capaToEdit ? toSelectorControlLevel(capaToEdit.controlCategory) : null,
  );
  const [description, setDescription] = useState(initialDescription);
  const [type, setType] = useState<string>(
    () => capaToEdit?.actionType ?? TYPE_OPTIONS[0],
  );
  const [owner, setOwner] = useState(() => capaToEdit?.assignee ?? "");
  const [ownerUserId, setOwnerUserId] = useState(initialOwnerUserId);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [priority, setPriority] = useState<string>(
    () => capaToEdit?.priority ?? PRIORITY_OPTIONS[1],
  );
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const busy = isSubmitting || isLocalSubmitting;
  const canSubmit =
    controlLevel != null && description.trim().length > 0 && !busy;
  const modalCapaId = capaToEdit?.code ?? capaId;

  const handleSubmit = async () => {
    if (!controlLevel || !canSubmit) {
      return;
    }

    setIsLocalSubmitting(true);
    try {
      await onSubmit?.({
        controlLevel,
        description: description.trim(),
        type,
        owner: ownerUserId.trim() || owner.trim(),
        dueDate,
        priority,
      });
      onClose();
    } catch {
      // Keep the modal open so the user can retry after an error toast.
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  return (
    <IncidentModalShell
      title={isEditMode ? "Edit CAPA" : "Add CAPA"}
      subtitle={`${incidentId} · ${incidentTitle} · ${isEditMode ? modalCapaId : `new ${capaId}`}`}
      onClose={onClose}
      footerHint={
        controlLevel
          ? `${controlLevel} selected`
          : "Select a control level to continue"
      }
      footerActions={
        <>
          <IncidentModalCancelButton onClick={onClose} />
          <IncidentModalPrimaryButton
            onClick={() => {
              void handleSubmit();
            }}
            disabled={!canSubmit}
            label={
              busy
                ? isEditMode
                  ? "Saving…"
                  : "Adding…"
                : isEditMode
                  ? "Save changes"
                  : "Add CAPA"
            }
          />
        </>
      }
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-8 lg:gap-12">
        <section className="w-full shrink-0 md:w-[320px] lg:w-[380px]">
          <div className="mb-4 flex flex-col gap-[5px] sm:mb-6">
            <div className="flex items-center gap-2.5">
              <StepBadge step="1" />
              <Text
                as="h3"
                className="text-ehs-dark-bg text-base leading-6 font-normal sm:text-base"
              >
                Select control level
              </Text>
            </div>
            <Text
              as="p"
              className="text-ehs-gray text-sm leading-[19.5px] font-normal sm:text-sm"
            >
              Most → least effective. Prefer higher-order controls.
            </Text>
          </div>

          <CapaHierarchySelector
            value={controlLevel}
            onChange={setControlLevel}
          />
        </section>

        <section className="min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-2.5 sm:mb-6">
            <StepBadge step="2" />
            <Text
              as="h3"
              className="text-ehs-dark-bg text-base leading-6 font-normal sm:text-base"
            >
              What CAPA is needed?
            </Text>
          </div>

          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor={descriptionFieldId} required>
                Action description
              </FieldLabel>
              <div className="relative">
                <textarea
                  id={descriptionFieldId}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the corrective / preventive action..."
                  rows={3}
                  className="text-ehs-dark-bg placeholder:text-ehs-muted-text focus:ring-ehs-normal-blue/25 h-[100px] w-full resize-none rounded-xl bg-white px-3.5 pt-3 pb-10 text-sm leading-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:ring-2 sm:h-[108px] sm:text-sm"
                />
                <AiTextAssistant value={description} onApply={setDescription} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>Type</FieldLabel>
              <CapaSegmentedToggle
                ariaLabel="CAPA type"
                options={TYPE_OPTIONS}
                value={type}
                onChange={setType}
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-2">
              <ReportPersonSearchField
                variant="embedded"
                label="Assigned"
                value={owner}
                selectedUserId={ownerUserId}
                onChange={({ name, userId }) => {
                  setOwner(name);
                  setOwnerUserId(userId);
                }}
                siteId={site.id}
                siteName={site.name}
                placeholder="Start typing a name…"
              />

              <ReportDateField
                variant="embedded"
                label="Due date"
                value={dueDate}
                onChange={setDueDate}
                placeholder="MM/DD/YYYY"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>Priority</FieldLabel>
              <CapaSegmentedToggle
                ariaLabel="CAPA priority"
                options={PRIORITY_OPTIONS}
                value={priority}
                onChange={setPriority}
              />
            </div>
          </div>
        </section>
      </div>
    </IncidentModalShell>
  );
}

export function AddCapaModal(props: Readonly<AddCapaModalProps>) {
  const {
    incidentId,
    incidentTitle,
    capaId = "CAPA-0423",
    capaToEdit,
    isSubmitting = false,
    onClose,
    onSubmit,
  } = props;

  const isEditMode = capaToEdit != null;
  const tasksQuery = useCapaTasksQuery({
    capaId: capaToEdit?.numericId ?? null,
    enabled: isEditMode,
  });

  if (isEditMode && tasksQuery.isLoading) {
    return (
      <IncidentModalShell
        title="Edit CAPA"
        subtitle={`${incidentId} · ${incidentTitle} · ${capaToEdit.code}`}
        onClose={onClose}
        footerActions={<IncidentModalCancelButton onClick={onClose} />}
      >
        <div className="text-ehs-muted-text py-12 text-center text-sm">
          Loading action details…
        </div>
      </IncidentModalShell>
    );
  }

  const primaryTask = tasksQuery.data?.[0];
  const initialDescription = primaryTask?.task ?? capaToEdit?.description ?? "";
  const initialOwnerUserId =
    primaryTask?.ownerId != null
      ? String(primaryTask.ownerId)
      : capaToEdit?.assignedId != null
        ? String(capaToEdit.assignedId)
        : "";
  const initialDueDate =
    primaryTask?.dueDate?.trim() ||
    (capaToEdit?.dueDate && capaToEdit.dueDate !== "—"
      ? capaToEdit.dueDate
      : "");

  return (
    <CapaModalForm
      key={
        isEditMode
          ? `edit-${capaToEdit.id}-${primaryTask?.id ?? "none"}`
          : "add"
      }
      incidentId={incidentId}
      incidentTitle={incidentTitle}
      capaId={capaId}
      capaToEdit={capaToEdit}
      isSubmitting={isSubmitting}
      initialDescription={initialDescription}
      initialOwnerUserId={initialOwnerUserId}
      initialDueDate={initialDueDate}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
