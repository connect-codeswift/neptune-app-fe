"use client";

import { useId, useState } from "react";
import {
  IncidentModalCancelButton,
  IncidentModalPrimaryButton,
  IncidentModalShell,
} from "@/components/incidents/list/capa/IncidentModalShell";

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
      className="block text-[13px] leading-[19.5px] text-[#475569]"
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
          className="min-h-[160px] w-full resize-none rounded-xl bg-white px-3.5 py-3 text-[13.5px] leading-5 text-[#1e293b] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#06939b]/25 sm:text-[14px]"
        />
      </section>
    </IncidentModalShell>
  );
}
