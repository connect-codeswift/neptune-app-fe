"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type AiInFieldDraftProps = Readonly<{
  /** The drafted text, or null when there is nothing to offer. */
  draft: string | null;
  pending?: boolean;
  onAccept: (text: string) => void;
  onDismiss: () => void;
  /** What produced the draft. Callers that composed it themselves must say so. */
  label?: string;
}>;

/**
 * A draft shown *inside* the field it belongs to, as ghost text the reporter
 * accepts with a tick or clears with a cross.
 *
 * The text is a layer over the textarea, never its value: nothing enters form
 * state until Accept, so a draft can't be submitted by someone who simply
 * didn't notice it. That is also why the layer is `pointer-events-none` — a
 * click lands in the textarea underneath and they can start typing straight
 * over it, which dismisses the draft.
 *
 * Typography here has to match `FIELD_TEXTAREA_WITH_CONTROLS_CLASS` exactly.
 * If the padding or line height drift apart, the ghost sits a few pixels off
 * the caret and the field looks broken rather than helpful.
 */
export function AiInFieldDraft(props: Readonly<AiInFieldDraftProps>) {
  const {
    draft,
    pending = false,
    onAccept,
    onDismiss,
    label = "AI draft",
  } = props;

  if (pending) {
    return (
      <div
        className="pointer-events-none absolute inset-0 flex items-start px-[13px] pt-[10.5px]"
        aria-live="polite"
      >
        <span className="text-ehs-muted-text inline-flex items-center gap-2 text-[13px] leading-[19.5px]">
          <Icon
            icon="svg-spinners:3-dots-fade"
            className="text-ehs-dark-blue size-4 shrink-0"
            aria-hidden="true"
          />
          Drafting from your answers…
        </span>
      </div>
    );
  }

  if (!draft) {
    return null;
  }

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden px-[13px] pt-[10.5px] pb-10"
        aria-hidden="true"
      >
        <Text
          as="p"
          className="text-ehs-muted-text text-[13px] leading-[19.5px] italic"
        >
          {draft}
        </Text>
      </div>

      {/* Announced separately: the ghost above is aria-hidden so a screen
          reader isn't told the field already contains text it does not. */}
      <span role="status" aria-live="polite" className="sr-only">
        {`Suggested description: ${draft}. Use the accept button to insert it.`}
      </span>

      <div className="absolute inset-x-2.5 bottom-2.5 z-20 flex items-center gap-2">
        <span className="bg-ehs-light-blue text-ehs-dark-blue border-ehs-light-blue-active inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5">
          <Icon icon="mdi:creation-outline" className="size-3 shrink-0" />
          <span className="text-[9.5px] font-bold tracking-[0.2px]">
            {label}
          </span>
        </span>

        <span className="text-ehs-muted-text hidden min-w-0 flex-1 truncate text-[10.5px] sm:block">
          Start typing to write your own
        </span>

        <button
          type="button"
          onClick={() => onAccept(draft)}
          title="Use this draft"
          aria-label="Use this draft"
          className="bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-dark-blue focus-visible:ring-ehs-normal-blue/40 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full shadow-[0px_3px_10px_-2px_rgba(8,145,166,0.65)] transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <Icon icon="mdi:check" className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDismiss}
          title="Discard this draft"
          aria-label="Discard this draft"
          className="text-ehs-muted-text hover:text-ehs-red focus-visible:ring-ehs-red/30 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[rgba(15,23,42,0.12)] bg-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <Icon icon="mdi:close" className="size-4" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
