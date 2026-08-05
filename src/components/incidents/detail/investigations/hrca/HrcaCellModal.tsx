"use client";

import { useId, useState } from "react";
import {
  IncidentModalCancelButton,
  IncidentModalPrimaryButton,
  IncidentModalShell,
} from "@/components/incidents/shared/capa/IncidentModalShell";
import type { HrcaCellModalState } from "@/components/incidents/detail/investigations/hrca/hrca-modal-types";

export type HrcaCellModalProps = Readonly<{
  state: HrcaCellModalState;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void | Promise<void>;
}>;

function FieldLabel(
  props: Readonly<{ children: string; htmlFor?: string; required?: boolean }>,
) {
  const { children, htmlFor, required = false } = props;

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

function modalCopy(state: HrcaCellModalState) {
  const { kind, mode, stepNum, isRootCause } = state;

  if (kind === "contributingFactor") {
    return {
      title: mode === "add" ? "Add contributing factor" : "Edit contributing factor",
      fieldLabel: "Contributing factor",
      placeholder: "Describe what contributed to the incident in this category…",
      primaryLabel: mode === "add" ? "Add factor" : "Save changes",
      footerHint:
        "Define the initial cause for this lane before adding Why steps.",
    };
  }

  if (kind === "why") {
    const step = stepNum ?? 1;
    return {
      title: mode === "add" ? `Add Why ${String(step)}` : `Edit Why ${String(step)}`,
      fieldLabel: `Why ${String(step)} description`,
      placeholder: `Why did this happen? (step ${String(step)} in the chain)`,
      primaryLabel: mode === "add" ? "Add why step" : "Save changes",
      footerHint: isRootCause
        ? "This step is the root cause for this lane (highlighted in the worksheet)."
        : "Each Why should drill deeper until you reach the root cause.",
    };
  }

  return {
    title:
      mode === "add" ? "Add corrective action" : "Edit corrective action",
    fieldLabel: "Corrective action",
    placeholder: "Describe the action to address the root cause…",
    primaryLabel: mode === "add" ? "Add action" : "Save changes",
    footerHint: "Link actions to the root cause identified in this lane.",
  };
}

export function HrcaCellModal(props: Readonly<HrcaCellModalProps>) {
  const { state, isSubmitting = false, onClose, onSubmit } = props;

  const fieldId = useId();
  const [description, setDescription] = useState(state.initialText);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const copy = modalCopy(state);
  const busy = isSubmitting || isLocalSubmitting;
  const canSubmit = description.trim().length > 0 && !busy;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsLocalSubmitting(true);
    try {
      await onSubmit(description.trim());
      onClose();
    } catch {
      // Parent shows toast; keep modal open for retry.
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  return (
    <IncidentModalShell
      title={copy.title}
      subtitle={state.category}
      onClose={onClose}
      maxWidthClassName="max-w-[560px]"
      footerHint={copy.footerHint}
      footerActions={
        <>
          <IncidentModalCancelButton onClick={onClose} />
          <IncidentModalPrimaryButton
            onClick={() => {
              void handleSubmit();
            }}
            disabled={!canSubmit}
            label={busy ? "Saving…" : copy.primaryLabel}
            iconSrc=""
          />
        </>
      }
    >
      <section className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={fieldId} required>
          {copy.fieldLabel}
        </FieldLabel>
        <textarea
          id={fieldId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={copy.placeholder}
          rows={5}
          autoFocus
          className="min-h-[120px] w-full resize-y rounded-xl bg-white px-3.5 py-3 text-sm leading-5 text-ehs-dark-bg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-ehs-muted-text focus:ring-2 focus:ring-ehs-normal-blue/25"
        />
      </section>
    </IncidentModalShell>
  );
}
