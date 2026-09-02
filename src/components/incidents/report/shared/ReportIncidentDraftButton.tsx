"use client";

export type ReportIncidentDraftButtonProps = Readonly<{
  onSaveDraft?: () => void;
  /** True while the draft is being written. Blocks a second click mid-save. */
  isSavingDraft?: boolean;
  /** Set on the review step so submitting also locks the draft save. */
  disabled?: boolean;
}>;

export function ReportIncidentDraftButton(
  props: Readonly<ReportIncidentDraftButtonProps>,
) {
  const { onSaveDraft, isSavingDraft = false, disabled = false } = props;

  return (
    <button
      type="button"
      onClick={onSaveDraft}
      disabled={isSavingDraft || disabled}
      className="rounded-2.5 border-ehs-normal-blue text4 text-ehs-normal-blue bg-ehs-surface hover:bg-ehs-normal-blue/6 border px-4 py-2.5 font-bold transition-colors disabled:opacity-60"
    >
      {isSavingDraft ? "Saving…" : "Save as Draft"}
    </button>
  );
}
