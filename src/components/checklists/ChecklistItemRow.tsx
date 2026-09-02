"use client";

import { useRef } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  type AnswerDraft,
  type ChecklistEvidence,
  type ChecklistGrade,
  type ChecklistItem,
  isAnswered,
  needsNote,
  PENDING_ANSWER,
} from "./checklist-state";

/**
 * A hint for the file picker, not a rule. The rule is `validateFileForModule`,
 * which mirrors what the server enforces at upload-intent; duplicating the list
 * as a constraint here would just drift from it.
 */
export const EVIDENCE_ACCEPT = "image/*,application/pdf,video/mp4,video/webm";

type GradeOption = Readonly<{
  value: ChecklistGrade;
  label: string;
  icon: string;
  /** Classes for the button once it is the chosen grade. */
  selectedClassName: string;
}>;

/**
 * Ordered least to most serious, so the row reads left to right the way the
 * summary does. Colour is never the only signal: each grade also carries an
 * icon and its own word, which matters both for colour-blind auditors and in
 * the greyscale printouts these get filed as.
 */
const GRADE_OPTIONS: readonly GradeOption[] = [
  {
    value: "Pass",
    label: "Pass",
    icon: "mdi:check-circle-outline",
    selectedClassName: "bg-ehs-green text-ehs-on-accent border-ehs-green",
  },
  {
    value: "Action",
    label: "Action",
    icon: "mdi:alert-outline",
    selectedClassName: "bg-ehs-orange text-ehs-on-accent border-ehs-orange",
  },
  {
    value: "Critical",
    label: "Critical",
    icon: "mdi:alert-octagon-outline",
    selectedClassName: "bg-ehs-red text-ehs-on-accent border-ehs-red",
  },
];

const UNSELECTED_GRADE_CLASS =
  "text-ehs-gray bg-ehs-surface border-ehs-border-ink/15 hover:bg-ehs-surface-inverse/5";

function GradeButton(
  props: Readonly<{
    option: GradeOption;
    isSelected: boolean;
    disabled: boolean;
    onSelect: () => void;
  }>,
) {
  const { option, isSelected, disabled, onSelect } = props;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={disabled}
      onClick={onSelect}
      className={[
        "text8 rounded-2.5 flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        isSelected ? option.selectedClassName : UNSELECTED_GRADE_CLASS,
      ].join(" ")}
    >
      <Icon icon={option.icon} className="size-4 shrink-0" aria-hidden />
      {option.label}
    </button>
  );
}

export type ChecklistItemRowProps = Readonly<{
  item: ChecklistItem;
  answer: AnswerDraft | undefined;
  attachments: readonly ChecklistEvidence[];
  /** Read-only once the run is submitted — the backend refuses writes anyway. */
  disabled: boolean;
  /** True when a rejected submit named this question. */
  isBlocked: boolean;
  isUploading: boolean;
  onChange: (next: AnswerDraft) => void;
  onAttach: (file: File) => void;
  onRemoveAttachment: (attachmentId: number) => void;
}>;

/** The dom id a rejected submit scrolls to. */
export function checklistRowId(itemId: number): string {
  return `checklist-item-${String(itemId)}`;
}

/**
 * One checklist question: its grade, the note explaining that grade, and any
 * evidence pinned to it. Shared by audits and inspections.
 */
export function ChecklistItemRow(props: ChecklistItemRowProps) {
  const {
    item,
    answer,
    attachments,
    disabled,
    isBlocked,
    isUploading,
    onChange,
    onAttach,
    onRemoveAttachment,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const draft = answer ?? PENDING_ANSWER;
  const answered = isAnswered(answer);
  const noteRequired = needsNote(item, answer);

  // The note only earns its space once there is a grade to explain.
  const showNote = answered;

  const handleGrade = (severity: ChecklistGrade) => {
    // Tapping the chosen grade again clears it, back to Pending.
    const isSame = draft.severity === severity;
    onChange({ ...draft, severity: isSame ? null : severity });
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset first: picking the same file twice otherwise fires no change event.
    event.target.value = "";
    if (file) onAttach(file);
  };

  return (
    <li
      id={checklistRowId(item.id)}
      className={[
        "border-ehs-border-ink/10 flex flex-col gap-3 border-b px-5 py-4 last:border-b-0",
        isBlocked ? "bg-ehs-red/5 border-l-ehs-red border-l-2" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-start gap-1">
            <Text as="span" className="text4 text-ehs-darker">
              {item.question}
            </Text>
            {item.isRequired ? (
              <span className="text-ehs-red" aria-hidden>
                *
              </span>
            ) : null}
          </span>

          {item.hint ? (
            <Text as="span" className="text8 text-ehs-gray">
              {item.hint}
            </Text>
          ) : null}
        </div>

        <div
          role="radiogroup"
          aria-label={item.question}
          className="flex shrink-0 flex-wrap items-center gap-2"
        >
          {GRADE_OPTIONS.map((option) => (
            <GradeButton
              key={option.value}
              option={option}
              isSelected={draft.severity === option.value}
              disabled={disabled}
              onSelect={() => {
                handleGrade(option.value);
              }}
            />
          ))}
        </div>
      </div>

      {showNote ? (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`checklist-note-${String(item.id)}`}
            className="text8 text-ehs-gray"
          >
            {draft.severity === "Pass"
              ? "Note (optional)"
              : "What did you find?"}
            {noteRequired ? (
              <span className="text-ehs-red ml-1" aria-hidden>
                *
              </span>
            ) : null}
          </label>

          <textarea
            id={`checklist-note-${String(item.id)}`}
            rows={2}
            disabled={disabled}
            value={draft.note}
            onChange={(event) => {
              onChange({ ...draft, note: event.target.value });
            }}
            placeholder={
              draft.severity === "Pass"
                ? "Anything worth recording about why this passed"
                : "Describe what you saw — this becomes the finding's description"
            }
            className={[
              "text8 text-ehs-darker bg-ehs-surface rounded-2.5 w-full resize-y border px-3 py-2",
              "focus:border-ehs-green focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
              noteRequired ? "border-ehs-red" : "border-ehs-border-ink/15",
            ].join(" ")}
          />

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={EVIDENCE_ACCEPT}
              onChange={handleFile}
              className="hidden"
            />

            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
              className={[
                "text8 text-ehs-gray border-ehs-border-ink/15 rounded-2.5 flex cursor-pointer items-center gap-1.5 border px-3 py-1.5",
                "hover:bg-ehs-surface-inverse/5 transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
            >
              <Icon
                icon={isUploading ? "mdi:loading" : "mdi:paperclip"}
                className={
                  isUploading
                    ? "size-4 shrink-0 animate-spin"
                    : "size-4 shrink-0"
                }
                aria-hidden
              />
              {isUploading ? "Attaching…" : "Attach photo or PDF"}
            </button>

            {item.requirePhoto && attachments.length === 0 ? (
              <Text as="span" className="text8 text-ehs-red">
                A photo is required for this question.
              </Text>
            ) : null}
          </div>

          {attachments.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="text8 text-ehs-gray bg-ehs-form-classes-bg/70 rounded-2.5 flex items-center gap-1.5 py-1 pr-1 pl-2.5"
                >
                  <Icon
                    icon={
                      attachment.mimeType === "application/pdf"
                        ? "mdi:file-pdf-box"
                        : "mdi:image-outline"
                    }
                    className="size-4 shrink-0"
                    aria-hidden
                  />
                  <span className="max-w-48 truncate">
                    {attachment.fileName}
                  </span>
                  {disabled ? null : (
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveAttachment(attachment.id);
                      }}
                      aria-label={`Remove ${attachment.fileName}`}
                      className="hover:bg-ehs-red/10 hover:text-ehs-red cursor-pointer rounded-full p-1 transition-colors"
                    >
                      <Icon icon="mdi:close" className="size-3.5" aria-hidden />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
