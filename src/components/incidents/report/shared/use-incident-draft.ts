"use client";

import { useState } from "react";
import {
  buildDraftAssistInput,
  canDraftDescription,
} from "@/components/incidents/report/shared/report-ai-draft";
import {
  markAiAssisted,
  type ReportIncidentFormState,
} from "@/forms/incident-module/index";
import { useDraftMutation } from "@/hooks/use-ai-text-mutations";
import { toast } from "@/lib/toast";
import { logAiAssistFailure } from "@/services/ai-text.service";

/** The three long-text fields the draft endpoint writes. */
export type DraftableIncidentField =
  "description" | "injuryDescription" | "actionNotes";

export type IncidentFieldDraft = Readonly<{
  pending: boolean;
  run: () => void;
}>;

/**
 * The "Draft with AI" button behind one of the report's long-text fields.
 *
 * This replaced an automatic draft: the endpoint used to fire on its own, once
 * the answers above the description were complete, and offer its result as
 * ghost text the reporter had to accept or dismiss on three separate steps.
 * Nobody asked for it, so it read as the form filling itself in, and it spent a
 * call out of the shared 20-per-minute budget whether or not anyone wanted one.
 *
 * Pressing the button is now the only way it runs, and what comes back is
 * written straight into the field — editable like any other text, and undoable
 * only by editing, which is why the button says "Redraft" once there are words
 * to replace.
 *
 * Each button asks for its own field by name. The incident prompt can produce
 * all three at once — it used to, back when one call fed ghost text across
 * three steps — but with a Draft button per textarea the other two would be
 * paid for out of the 20/min budget and thrown away.
 */
export function useIncidentFieldDraft(
  form: ReportIncidentFormState,
  onChange: (next: Partial<ReportIncidentFormState>) => void,
  field: DraftableIncidentField,
): IncidentFieldDraft {
  const [pending, setPending] = useState(false);
  const draftAssist = useDraftMutation("incident");

  const run = () => {
    if (!canDraftDescription(form)) {
      toast.info(
        "Answer a little more first",
        "The assistant drafts from what you have already told it about the incident.",
      );
      return;
    }

    setPending(true);
    draftAssist
      .mutateAsync({
        fields: buildDraftAssistInput(form),
        // This button fills one textarea, so it asks for one field. Without
        // this the incident prompt answers all three and two are discarded —
        // three drafts paid for out of the 20/min budget to use one.
        targetField: field,
        // The reporter's own account, so the model can be told not to replace
        // it: a non-blank value here forces the drafted description back to
        // null server-side, whatever the model returns.
        authoredText: form.description.trim(),
      })
      .then((drafts) => {
        const drafted = drafts[field] ?? null;

        // A null field is an answer, not a failure — it means there was not
        // enough in the form to summarise into that one.
        if (drafted === null) {
          toast.info(
            "Nothing to draft yet",
            "Answer a little more about the incident and try again.",
          );
          return;
        }

        onChange({
          [field]: drafted,
          aiAssistedFields: markAiAssisted(form.aiAssistedFields, field),
        });
      })
      .catch((error: unknown) => {
        // Never surfaces the backend's own text — a timeout comes back as a raw
        // .NET string. The cause goes to the console instead.
        logAiAssistFailure("draft-assist", error);
        toast.error(
          "Couldn't draft this field",
          "Your text is unchanged. Try again in a moment.",
        );
      })
      .finally(() => {
        setPending(false);
      });
  };

  return { pending, run };
}
