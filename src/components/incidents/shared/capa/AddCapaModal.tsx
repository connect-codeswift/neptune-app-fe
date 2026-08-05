"use client";

import { useId, useState } from "react";
import { Text } from "@/components/Text";
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

export type AddCapaModalProps = Readonly<{
  incidentId: string;
  incidentTitle: string;
  capaId?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    controlLevel: ControlLevel;
    description: string;
    type: string;
    owner: string;
    dueDate: string;
    priority: string;
  }) => void | Promise<void>;
}>;

const TYPE_OPTIONS = ["Corrective", "Preventive"] as const;
const PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;

function StepBadge(props: Readonly<{ step: string }>) {
  const { step } = props;

  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ehs-normal-blue pt-[1.5px] pb-[2.5px] text-sm leading-5 text-ehs-light-text">
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
      className="block text-sm leading-[19.5px] text-ehs-gray"
    >
      {children}
      {required ? <span className="text-ehs-red"> *</span> : null}
    </label>
  );
}

export function AddCapaModal(props: Readonly<AddCapaModalProps>) {
  const {
    incidentId,
    incidentTitle,
    capaId = "CAPA-0423",
    isSubmitting = false,
    onClose,
    onSubmit,
  } = props;

  const descriptionFieldId = useId();
  const ownerFieldId = useId();
  const dueDateFieldId = useId();

  const [controlLevel, setControlLevel] = useState<ControlLevel | null>(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>(TYPE_OPTIONS[0]);
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>(PRIORITY_OPTIONS[1]);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const busy = isSubmitting || isLocalSubmitting;
  const canSubmit =
    controlLevel != null && description.trim().length > 0 && !busy;

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
        owner: owner.trim(),
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
      title="Add CAPA"
      subtitle={`${incidentId} · ${incidentTitle} · new ${capaId}`}
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
            label={busy ? "Adding…" : "Add CAPA"}
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
                className="text-base leading-6 font-normal text-ehs-dark-bg sm:text-base"
              >
                Select control level
              </Text>
            </div>
            <Text
              as="p"
              className="text-sm leading-[19.5px] font-normal text-ehs-gray sm:text-sm"
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
              className="text-base leading-6 font-normal text-ehs-dark-bg sm:text-base"
            >
              What CAPA is needed?
            </Text>
          </div>

          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor={descriptionFieldId} required>
                Action description
              </FieldLabel>
              <textarea
                id={descriptionFieldId}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the corrective / preventive action..."
                rows={3}
                className="h-[100px] w-full resize-none rounded-xl bg-white px-3.5 py-3 text-sm leading-5 text-ehs-dark-bg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-ehs-muted-text focus:ring-2 focus:ring-ehs-normal-blue/25 sm:h-[108px] sm:text-sm"
              />
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={ownerFieldId}>Assigned</FieldLabel>
                <input
                  id={ownerFieldId}
                  type="text"
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  placeholder="Name or user ID (optional)"
                  className="h-10 w-full rounded-[10px] bg-white px-3.5 text-sm text-ehs-dark-bg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-ehs-muted-text focus:ring-2 focus:ring-ehs-normal-blue/25 sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={dueDateFieldId}>Due date</FieldLabel>
                <div className="relative">
                  <input
                    id={dueDateFieldId}
                    type="text"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    placeholder="mm/dd/yyyy"
                    className="h-10 w-full rounded-[10px] bg-white px-3.5 pr-10 text-sm text-ehs-dark-bg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-ehs-muted-text focus:ring-2 focus:ring-ehs-normal-blue/25 sm:text-sm"
                  />
                  <img
                    src="/icons/capa/calendar.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                </div>
              </div>
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
