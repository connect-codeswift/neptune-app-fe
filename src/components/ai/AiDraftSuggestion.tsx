"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type AiDraftSuggestionProps = Readonly<{
  /** The drafted text, or null when there is nothing to offer. */
  draft: string | null;
  /**
   * True while the draft-assist call is still in flight AND this field is
   * still empty. Callers must not pass the raw in-flight flag: a field the
   * reporter has already written in will never be offered a draft, so showing
   * a wait there promises something that cannot arrive.
   */
  pending?: boolean;
  onAccept: (text: string) => void;
  onDismiss: () => void;
  /**
   * What produced this draft. Defaults to the model. Callers that compose a
   * draft themselves must say so — the badge is the only thing on screen
   * telling the reporter whether a model wrote this.
   */
  label?: string;
  className?: string;
}>;

/**
 * A draft the reporter may take or leave, shown beneath the field it belongs to.
 *
 * Two rules this has to keep:
 *
 * 1. Nothing enters form state until Accept. The field underneath stays exactly
 *    as the reporter left it, so a draft can never overwrite their own words.
 * 2. A null draft renders nothing at all — no empty panel, no "the assistant
 *    had nothing to say". For `injuryDescription` a null is meaningful: it
 *    means the description mentioned no injury, and drawing attention to that
 *    absence would invite someone to fill it in.
 *
 * Because of rule 2 the waiting state cannot promise an outcome — plenty of
 * reports legitimately produce no draft. It says the assistant is looking,
 * not that something is coming, so resolving to nothing reads as an answer
 * rather than as a failure.
 */
export function AiDraftSuggestion(props: Readonly<AiDraftSuggestionProps>) {
  const {
    draft,
    pending = false,
    onAccept,
    onDismiss,
    label = "AI draft",
    className = "",
  } = props;

  if (pending) {
    return (
      <div
        className={["flex items-center gap-2 pt-2", className]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
      >
        <Icon
          icon="svg-spinners:3-dots-fade"
          className="text-ehs-dark-blue size-4 shrink-0"
          aria-hidden="true"
        />
        <Text as="span" className="text-ehs-muted-text text-xs">
          Checking for a suggestion…
        </Text>
      </div>
    );
  }

  if (!draft) {
    return null;
  }

  return (
    <div
      className={[
        "border-ehs-light-blue-active bg-ehs-light-blue/40 mt-2 flex flex-col gap-2.5 rounded-[12px] border border-dashed p-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start gap-2">
        <div className="bg-ehs-light-blue text-ehs-dark-blue border-ehs-light-blue-active inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1">
          <Icon icon="mdi:creation-outline" className="size-3 shrink-0" />
          <span className="text-[9.5px] font-bold tracking-[0.2px]">
            {label}
          </span>
        </div>
        <Text
          as="p"
          className="text-ehs-gray min-w-0 flex-1 text-sm leading-relaxed italic"
        >
          {draft}
        </Text>

        {/* Tick and cross sit with the text rather than under it: the draft is
            a yes/no question, and two icon buttons read as one at a glance. */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAccept(draft)}
            title="Use this draft"
            aria-label="Use this draft"
            className="bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-dark-blue focus-visible:ring-ehs-normal-blue/40 inline-flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Icon icon="mdi:check" className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDismiss}
            title="Discard this draft"
            aria-label="Discard this draft"
            className="text-ehs-muted-text hover:text-ehs-red focus-visible:ring-ehs-red/30 inline-flex size-7 cursor-pointer items-center justify-center rounded-full border border-[rgba(15,23,42,0.12)] bg-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Icon icon="mdi:close" className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
