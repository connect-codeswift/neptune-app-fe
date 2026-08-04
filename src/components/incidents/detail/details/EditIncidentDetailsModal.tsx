"use client";

import { useId, useState } from "react";
import {
  IncidentModalCancelButton,
  IncidentModalPrimaryButton,
  IncidentModalShell,
} from "@/components/incidents/shared/capa/IncidentModalShell";

export type EditIncidentDetailsPayload = Readonly<{
  summary: string;
}>;

export type EditIncidentDetailsModalProps = Readonly<{
  incidentId: string;
  incidentTitle: string;
  summary: string;
  onClose: () => void;
  onSave: (payload: EditIncidentDetailsPayload) => void;
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

/**
 * Edit Summary modal — same shell/header as Add CAPA.
 * Only the Details-tab summary is editable; other incident fields stay read-only.
 */
export function EditIncidentDetailsModal(
  props: Readonly<EditIncidentDetailsModalProps>,
) {
  const { incidentId, incidentTitle, summary, onClose, onSave } = props;

  const summaryId = useId();
  const [draftSummary, setDraftSummary] = useState(summary);
  const canSave = draftSummary.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    onSave({ summary: draftSummary.trim() });
    onClose();
  };

  return (
    <IncidentModalShell
      title="Edit summary"
      subtitle={`${incidentId} · ${incidentTitle}`}
      onClose={onClose}
      footerHint="Only the summary on the Details tab will be updated."
      footerActions={
        <>
          <IncidentModalCancelButton onClick={onClose} />
          <IncidentModalPrimaryButton
            onClick={handleSave}
            disabled={!canSave}
            label="Save changes"
            iconSrc=""
          />
        </>
      }
    >
      <section className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={summaryId} required>
          Summary
        </FieldLabel>
        <textarea
          id={summaryId}
          value={draftSummary}
          onChange={(event) => setDraftSummary(event.target.value)}
          placeholder="Describe what happened…"
          rows={6}
          className="min-h-[160px] w-full resize-none rounded-xl bg-white px-3.5 py-3 text-sm leading-5 text-ehs-dark-bg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-ehs-muted-text focus:ring-2 focus:ring-ehs-normal-blue/25 sm:text-sm"
        />
      </section>
    </IncidentModalShell>
  );
}
