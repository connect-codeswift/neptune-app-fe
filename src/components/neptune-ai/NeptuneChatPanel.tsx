"use client";

import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { LogoIcon } from "@/components/LogoIcon";
import { LogoMark } from "@/components/LogoMark";
import { Text } from "@/components/Text";
import {
  POPUP_MESSAGES,
  POPUP_SUGGESTIONS,
  type ChatMessage,
} from "@/components/neptune-ai/neptune-ai-data";

export type NeptuneChatPanelProps = Readonly<{
  open: boolean;
  onClose: () => void;
  /** Focus returns here on close, so the keyboard doesn't land back at the top of the page. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}>;

/**
 * One turn in the conversation, matching the Figma bubbles exactly: 14px corners with a 2px
 * corner pointing at the author, 330px bubbles, 13px/18px type.
 *
 * The user bubble is pinned to the design's literal pair (#e2e8f0 on #0b1320) rather than
 * tokens. `--ehs-border` is #e5e7eb — visibly warmer than the slate the design uses — and the
 * flipping text token on a pinned fill would be unreadable in dark. The chat keeps its light
 * bubbles in both themes, the way most chat surfaces keep their brand colours.
 */
function MessageRow(props: Readonly<{ message: ChatMessage }>) {
  const { message } = props;

  if (message.author === "user") {
    return (
      <div className="flex w-full items-start justify-end">
        <div className="rounded-tl-3.5 rounded-tr-0.5 rounded-b-3.5 max-w-82.5 bg-[#e2e8f0] p-3">
          <Text as="p" className="text-[13px] leading-[18px] text-[#0b1320]">
            {message.body}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start gap-2">
      <LogoMark className="text-ehs-normal-blue size-7 shrink-0" decorative />

      <div className="rounded-tl-0.5 rounded-tr-3.5 rounded-b-3.5 border-ehs-normal-blue/8 bg-ehs-normal-blue/14 flex max-w-82.5 flex-col gap-2 border p-3">
        <Text as="p" className="text-ehs-dark-bg text-[13px] leading-[18px]">
          {message.body}
        </Text>

        {message.results?.map((result) => (
          <div
            key={result.id}
            className="border-ehs-normal-blue/10 bg-ehs-surface/75 flex w-full flex-col gap-1 rounded-lg border p-2"
          >
            <Text as="p" className="text-ehs-dark-bg text-xs font-bold">
              {result.title}
            </Text>
            <Text as="p" className="text-ehs-gray text-[11px]">
              {result.detail}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The compact assistant, docked above the floating button. Layout mirrors the Figma panel
 * top to bottom: teal header with the wordmark, slate thread, suggestion pills on white,
 * then the input row.
 *
 * Deliberately not a modal: it does not trap focus or block the page, because the whole point is
 * to ask something *about* what you are looking at. Escape closes it, and a click outside does
 * not — losing a half-typed question to a stray click is the more annoying failure.
 */
export function NeptuneChatPanel(props: Readonly<NeptuneChatPanelProps>) {
  const { open, onClose, returnFocusRef } = props;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        returnFocusRef?.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, returnFocusRef]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Neptune AI assistant"
      className="animate-card-rise border-ehs-border-ink/8 bg-ehs-surface rounded-5 flex h-[min(45.5rem,calc(100dvh-7.5rem))] w-[min(30rem,calc(100vw-2rem))] flex-col overflow-hidden border shadow-[0px_20px_40px_0px_color-mix(in_oklab,var(--ehs-border-ink)_14%,transparent)]"
    >
      <header className="bg-ehs-normal-blue flex h-19 shrink-0 items-center justify-between p-4">
        <LogoIcon variant="light" className="h-4.5 w-auto pl-3.5" />

        <button
          type="button"
          onClick={() => {
            onClose();
            returnFocusRef?.current?.focus();
          }}
          aria-label="Close assistant"
          className="text-ehs-light-text hover:bg-ehs-light-text/15 inline-flex size-6.5 cursor-pointer items-center justify-center rounded-full transition-colors"
        >
          <Icon
            icon="mdi:close-circle-outline"
            className="size-4.5"
            aria-hidden="true"
          />
        </button>
      </header>

      <div className="bg-ehs-surface-raised flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {POPUP_MESSAGES.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}

        {/* Not in the Figma frame: one quiet line so nobody mistakes the sample replies for a
            live assistant. Styled as meta text, not a banner, so it stays out of the design. */}
        <Text
          as="p"
          className="text-ehs-muted-text mt-auto pt-2 text-center text-[11px]"
        >
          Preview — the assistant is not connected yet.
        </Text>
      </div>

      <div className="border-ehs-border-ink/8 bg-ehs-surface flex shrink-0 scrollbar-none gap-2 overflow-x-auto border-t px-4 py-2">
        {POPUP_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled
            className="border-ehs-border-ink/8 bg-ehs-light-bg text-ehs-gray shrink-0 cursor-not-allowed rounded border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="border-ehs-border-ink/8 bg-ehs-surface flex shrink-0 items-center gap-2.5 border-t p-3.5">
        <div className="border-ehs-border-ink/8 bg-ehs-light-bg rounded-5 flex h-10 min-w-0 flex-1 items-center justify-between gap-2 border px-3 py-2">
          <input
            type="text"
            disabled
            placeholder="Type a message..."
            aria-label="Message Neptune AI"
            className="text-ehs-dark-bg placeholder:text-ehs-muted-text min-w-0 flex-1 bg-transparent text-[13px] outline-none disabled:cursor-not-allowed"
          />
          <Icon
            icon="mdi:paperclip"
            className="text-ehs-muted-text size-4 shrink-0"
            aria-hidden="true"
          />
        </div>

        <button
          type="button"
          disabled
          aria-label="Send message"
          className="bg-ehs-normal-blue text-ehs-on-accent inline-flex size-10 shrink-0 cursor-not-allowed items-center justify-center rounded-full opacity-60"
        >
          <Icon icon="mdi:send" className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
