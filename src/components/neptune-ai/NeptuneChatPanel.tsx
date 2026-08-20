"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { LogoIcon } from "@/components/LogoIcon";
import { LogoMark } from "@/components/LogoMark";
import { Text } from "@/components/Text";
import {
  ANALYZING_STEPS,
  POPUP_GREETING,
  POPUP_SUGGESTIONS,
  toChatMessage,
  type ChatMessage,
} from "@/components/neptune-ai/neptune-ai-data";
import { useAskAssistantMutation } from "@/hooks/use-assistant";

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
        {message.analyzing ? (
          // Three dots rather than the page's step checklist. The panel is 30rem wide and the
          // answer usually lands in a few seconds; a four-item progress list would be taller
          // than the reply it is standing in for.
          <span
            className="flex items-center gap-1 py-1"
            role="status"
            aria-label="Neptune AI is thinking"
          >
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="bg-ehs-normal-blue/60 size-1.5 animate-pulse rounded-full motion-reduce:animate-none"
                style={{ animationDelay: `${String(delay)}ms` }}
              />
            ))}
          </span>
        ) : null}

        {message.body ? (
          <Text as="p" className="text-ehs-dark-bg text-[13px] leading-[18px]">
            {message.body}
          </Text>
        ) : null}

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

  // The popup keeps its own short thread rather than sharing the full page's. It is for asking
  // about what you are looking at, and carrying a long history into a 30rem panel would bury the
  // one exchange you opened it for. The thread it creates is still saved, and shows up in the
  // page's rail.
  const [messages, setMessages] = useState<ChatMessage[]>([POPUP_GREETING]);
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined,
  );
  const [draft, setDraft] = useState("");
  const ask = useAskAssistantMutation();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function send(question: string) {
    const trimmed = question.trim();

    if (trimmed === "" || ask.isPending) {
      return;
    }

    setDraft("");
    setMessages((current) => [
      ...current,
      {
        id: `q-${String(current.length)}`,
        author: "user",
        authorName: "You",
        body: trimmed,
      },
      {
        id: "pending",
        author: "ai",
        authorName: "Neptune AI",
        body: "",
        analyzing: { doneSteps: [], activeStep: ANALYZING_STEPS[0]! },
      },
    ]);

    ask.mutate(
      { payload: { message: trimmed }, conversationId },
      {
        onSuccess: (reply) => {
          setMessages((current) => {
            // Drop the analyzing placeholder, keep everything before it.
            const settled = current.filter((entry) => entry.id !== "pending");

            if (!reply) {
              return [
                ...settled,
                {
                  id: `e-${String(settled.length)}`,
                  author: "ai" as const,
                  authorName: "Neptune AI",
                  body: "I could not put an answer together. Try asking again.",
                },
              ];
            }

            return [...settled, toChatMessage(reply.message)];
          });

          if (reply) {
            setConversationId(reply.conversationId);
          }
        },
        onError: () => {
          setMessages((current) => [
            ...current.filter((entry) => entry.id !== "pending"),
            {
              id: `e-${String(current.length)}`,
              author: "ai",
              authorName: "Neptune AI",
              body: "I could not reach the assistant just now. Please try again.",
            },
          ]);
        },
      },
    );
  }

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
        {messages.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-ehs-border-ink/8 bg-ehs-surface flex shrink-0 scrollbar-none gap-2 overflow-x-auto border-t px-4 py-2">
        {POPUP_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={ask.isPending}
            onClick={() => {
              send(suggestion);
            }}
            className="border-ehs-border-ink/8 bg-ehs-light-bg text-ehs-gray hover:bg-ehs-surface-inverse/4 shrink-0 cursor-pointer rounded border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
        className="border-ehs-border-ink/8 bg-ehs-surface flex shrink-0 items-center gap-2.5 border-t p-3.5"
      >
        <div className="border-ehs-border-ink/8 bg-ehs-light-bg rounded-5 flex h-10 min-w-0 flex-1 items-center justify-between gap-2 border px-3 py-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            disabled={ask.isPending}
            maxLength={2000}
            placeholder="Type a message..."
            aria-label="Message Neptune AI"
            className="text-ehs-dark-bg placeholder:text-ehs-muted-text min-w-0 flex-1 bg-transparent text-[13px] outline-none disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={ask.isPending || draft.trim() === ""}
          aria-label="Send message"
          className="bg-ehs-normal-blue text-ehs-on-accent inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon
            icon={ask.isPending ? "mdi:loading" : "mdi:send"}
            className={`size-3.5 ${ask.isPending ? "animate-spin motion-reduce:animate-none" : ""}`}
            aria-hidden="true"
          />
        </button>
      </form>
    </div>
  );
}
