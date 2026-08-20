"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LOGO_MARK_RING_RADIUS,
  LOGO_MARK_RING_WIDTH,
  LogoMark,
  NEPTUNE_N_PATH,
} from "@/components/LogoMark";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ANALYZING_STEPS,
  PAGE_SUGGESTIONS,
  formatConversationTimestamp,
  toChatMessage,
  type ChatChart,
  type ChatMessage,
  type ChatTable,
  type ChatCell,
  type ChatCellTone,
} from "@/components/neptune-ai/neptune-ai-data";
import { AvatarPreview } from "@/components/profile/ProfileAvatarUpload";
import {
  useAskAssistantMutation,
  useAssistantConversationQuery,
  useAssistantConversationsQuery,
} from "@/hooks/use-assistant";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";

/**
 * The red/amber/green reading, keyed by tone rather than by column.
 *
 * The design drew severity as a filled pill and status as coloured ink. Both collapse to the
 * pill here: with arbitrary columns there is no longer a "severity column" to give one treatment
 * and a "status column" to give the other, and picking a treatment by position would be guessing.
 * One rule means every coloured value carries the same weight, which is the honest reading when
 * the backend only tells us the value is bad, not what kind of bad.
 */
const TONE_PILL: Readonly<Record<ChatCellTone, string>> = {
  critical: "bg-ehs-red/12 text-ehs-red",
  warning: "bg-ehs-yellow/15 text-ehs-yellow-ink-soft",
  ok: "bg-ehs-green/12 text-ehs-green",
  neutral: "",
};

/** 2πr of the monogram's ring, so the arc below is a true quarter turn of it. */
const RING_CIRCUMFERENCE = 2 * Math.PI * LOGO_MARK_RING_RADIUS;
const ARC_LENGTH = RING_CIRCUMFERENCE * 0.24;

/**
 * The N at work: the monogram with an arc orbiting its ring, sized for an avatar slot.
 *
 * Same recipe as NeptuneLoader, rebuilt small rather than reused — the loader is a page-level
 * block with its own label and padding. And per its own note, the glyph stays still while the
 * arc travels: a spinning letterform reads as a novelty, a moving arc reads as progress.
 */
function AnalyzingMark(props: Readonly<{ className?: string }>) {
  const { className = "" } = props;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={["text-ehs-normal-blue", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="24"
        r={LOGO_MARK_RING_RADIUS}
        stroke="currentColor"
        strokeWidth={LOGO_MARK_RING_WIDTH}
        className="opacity-20"
      />
      <circle
        cx="24"
        cy="24"
        r={LOGO_MARK_RING_RADIUS}
        stroke="currentColor"
        strokeWidth={LOGO_MARK_RING_WIDTH * 1.6}
        strokeLinecap="round"
        strokeDasharray={`${String(ARC_LENGTH)} ${String(RING_CIRCUMFERENCE - ARC_LENGTH)}`}
        className="animate-mark-orbit"
      />
      <g transform="translate(-28.093 8.504) scale(1.2)">
        <path d={NEPTUNE_N_PATH} fill="currentColor" />
      </g>
    </svg>
  );
}

/** The rail entry for one saved conversation. */
function ConversationRow(
  props: Readonly<{
    conversation: Readonly<{
      title: string;
      timestamp: string;
      preview: string;
    }>;
    isActive: boolean;
    onSelect: () => void;
  }>,
) {
  const { conversation, isActive, onSelect } = props;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      className={[
        "rounded-2.5 flex w-full cursor-pointer flex-col gap-1 border p-3 text-left transition-colors",
        isActive
          ? "border-ehs-normal-blue/30 bg-ehs-normal-blue/10"
          : "hover:bg-ehs-surface-inverse/3 border-transparent",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <Icon
            icon="mdi:message-outline"
            className={[
              "size-3.5 shrink-0",
              isActive ? "text-ehs-normal-blue" : "text-ehs-muted-text",
            ].join(" ")}
            aria-hidden="true"
          />
          <Text
            as="span"
            className={[
              "truncate text-[13px] font-bold",
              isActive ? "text-ehs-normal-blue" : "text-ehs-darker",
            ].join(" ")}
          >
            {conversation.title}
          </Text>
        </span>
        <Text as="span" className="text-ehs-muted-text shrink-0 text-[11px]">
          {conversation.timestamp}
        </Text>
      </div>

      <Text as="p" className="text-ehs-gray line-clamp-2 text-[11px] leading-4">
        {conversation.preview}
      </Text>
    </button>
  );
}

/**
 * The mini bar chart inside a reply. Pure divs — recharts would be a heavyweight way to draw
 * six rectangles, and this stays legible at bubble width.
 *
 * Bar colour encodes the value: each bar is the brand teal at an intensity proportional to its
 * share of the maximum, which is exactly how the design shades May's 10 pale and July's 24 solid.
 */
function ReplyChart(props: Readonly<{ chart: ChatChart }>) {
  const { chart } = props;
  const max = Math.max(...chart.bars.map((bar) => bar.value), 1);

  return (
    <div className="border-ehs-normal-blue/10 bg-ehs-surface flex w-full flex-col gap-3 rounded-xl border p-3">
      <Text as="p" className="text-ehs-darker text-xs font-bold">
        {chart.title}
      </Text>

      <div className="flex h-24 items-end justify-around gap-3 px-1">
        {chart.bars.map((bar) => {
          const ratio = bar.value / max;

          return (
            <div
              key={bar.label}
              className="flex h-full w-9 flex-col items-center justify-end gap-1"
            >
              <Text as="span" className="text-ehs-muted-text text-[10px]">
                {String(bar.value)}
              </Text>
              <div
                role="img"
                aria-label={`${bar.label}: ${String(bar.value)}`}
                className="w-full rounded-t-sm"
                style={{
                  height: `${String(Math.round(ratio * 72))}px`,
                  backgroundColor: `color-mix(in oklab, var(--ehs-normal-blue) ${String(Math.round(25 + ratio * 75))}%, transparent)`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** True for a cell the assistant returned as a bare number, so figures line up in a column. */
function isNumeric(text: string): boolean {
  return text.trim() !== "" && !Number.isNaN(Number(text.replace(/[,%]/g, "")));
}

/** One table cell: a tinted pill when the backend gave it a tone, plain text otherwise. */
function TableCell(props: Readonly<{ cell: ChatCell }>) {
  const { cell } = props;
  const pill = cell.tone ? TONE_PILL[cell.tone] : "";

  if (pill) {
    return (
      <td className="px-2.5 py-2.5">
        <span
          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${pill}`}
        >
          {cell.text}
        </span>
      </td>
    );
  }

  return (
    <td
      className={`text-ehs-darker px-2.5 py-2.5 text-xs ${isNumeric(cell.text) ? "tabular-nums" : ""}`}
    >
      {cell.text}
    </td>
  );
}

/** The data table inside a reply, with its (not yet wired) CSV affordance. */
function ReplyTable(props: Readonly<{ table: ChatTable }>) {
  const { table } = props;

  return (
    <div className="border-ehs-normal-blue/10 bg-ehs-surface flex w-full flex-col gap-2 rounded-xl border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Text as="p" className="text-ehs-darker text-xs font-bold">
          {table.title}
        </Text>
        <button
          type="button"
          disabled
          className="text-ehs-normal-blue inline-flex cursor-not-allowed items-center gap-1 text-xs font-semibold opacity-80"
        >
          <Icon icon="mdi:download" className="size-3.5" aria-hidden="true" />
          Download as CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-72 border-collapse text-left">
          <thead>
            <tr className="bg-ehs-surface-raised">
              {table.columns.map((heading, column) => (
                <th
                  key={`${heading}-${String(column)}`}
                  scope="col"
                  className="text-ehs-darker px-2.5 py-2 text-[11px] font-bold first:rounded-l-md last:rounded-r-md"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              // Index keys: rows carry no id, and two rows of an assistant's answer can be
              // identical. The list is rendered once and never reordered or edited in place.
              <tr
                key={rowIndex}
                className="border-ehs-border-ink/6 border-b last:border-0"
              >
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} cell={cell} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** One turn on the full page, with the author named inside the bubble as the design does. */
function PageMessage(
  props: Readonly<{
    message: ChatMessage;
    displayName: string;
    initials: string;
    profileUrl: string | null;
  }>,
) {
  const { message, displayName, initials, profileUrl } = props;

  if (message.author === "user") {
    return (
      <div className="flex w-full items-start justify-end gap-3">
        {/* Pinned to the design's grey-on-ink pair, like the popup bubbles: the flipping text
            token on a pinned fill would be unreadable in dark. */}
        <div className="rounded-3 flex max-w-150 flex-col gap-1.5 bg-[#e2e8f0] p-3.5">
          <Text as="p" className="text-[13px] font-bold text-[#0b1320]">
            {displayName}
          </Text>
          <Text as="p" className="text-[13px] leading-5.5 text-[#334155]">
            {message.body}
          </Text>
        </div>
        {/* The person's real photo when they have one; initials only as the fallback. */}
        <AvatarPreview
          profileUrl={profileUrl}
          initials={initials}
          sizeClassName="size-9 text-[11px]"
        />
      </div>
    );
  }

  const isAnalyzing = Boolean(message.analyzing);

  return (
    <div className="flex w-full items-start gap-3">
      {isAnalyzing ? (
        <AnalyzingMark className="size-9 shrink-0" />
      ) : (
        <LogoMark className="text-ehs-normal-blue size-9 shrink-0" decorative />
      )}

      <div className="rounded-3 border-ehs-normal-blue/10 bg-ehs-normal-blue/10 flex max-w-150 min-w-0 flex-col gap-2.5 border p-3.5">
        {message.analyzing ? (
          <>
            <div className="flex items-center gap-2">
              <Text
                as="p"
                className="text-ehs-normal-blue text-[13px] font-bold"
              >
                Neptune AI is analyzing...
              </Text>
              <span
                className="flex gap-1 motion-reduce:hidden"
                aria-hidden="true"
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="bg-ehs-muted-text size-1 animate-pulse rounded-full"
                    style={{ animationDelay: `${String(delay)}ms` }}
                  />
                ))}
              </span>
            </div>

            <ul className="flex flex-col gap-1.5">
              {message.analyzing.doneSteps.map((step) => (
                <li key={step} className="flex items-center gap-2">
                  <Icon
                    icon="mdi:check"
                    className="text-ehs-green size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <Text as="span" className="text-ehs-slate text-xs">
                    {step}
                  </Text>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <Icon
                  icon="mdi:loading"
                  className="text-ehs-normal-blue size-3.5 shrink-0 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <Text
                  as="span"
                  className="text-ehs-normal-blue text-xs font-semibold"
                >
                  {message.analyzing.activeStep}
                </Text>
              </li>
            </ul>
          </>
        ) : (
          <>
            <Text as="p" className="text-ehs-normal-blue text-[13px] font-bold">
              {message.authorName}
            </Text>

            {message.body ? (
              <Text as="p" className="text-ehs-slate text-[13px] leading-5.5">
                {message.body}
              </Text>
            ) : null}

            {message.chart ? <ReplyChart chart={message.chart} /> : null}
            {message.table ? <ReplyTable table={message.table} /> : null}

            {message.results?.map((result) => (
              <div
                key={result.id}
                className="border-ehs-normal-blue/10 bg-ehs-surface/70 flex flex-col gap-0.5 rounded-lg border p-2.5"
              >
                <Text as="p" className="text-ehs-darker text-xs font-bold">
                  {result.title}
                </Text>
                <Text as="p" className="text-ehs-gray text-[11px]">
                  {result.detail}
                </Text>
              </div>
            ))}

            {message.insights ? (
              <div className="flex flex-col gap-1">
                <Text as="p" className="text-ehs-darker text-xs font-bold">
                  {message.insights.title}
                </Text>
                <Text as="p" className="text-ehs-gray text-xs leading-4.5">
                  {message.insights.points
                    .map((point, index) => `${String(index + 1)}. ${point}`)
                    .join(" ")}
                </Text>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/** The main column before any conversation is chosen — "start a conversation". */
function EmptyThread() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Text as="h2" className="text-ehs-darker text-lg font-bold">
        Start a conversation with Neptune AI
      </Text>
      <Text as="p" className="text-ehs-muted-text max-w-90 text-xs leading-4.5">
        Ask about safety incidents, compliance reports, hazard trends, and more.
        Your digital EHS assistant is ready to analyze.
      </Text>
    </div>
  );
}

/** The rail before any conversations exist (reached from "new chat"). */
function EmptyRail() {
  return (
    <EmptyState
      variant="plain"
      icon="mdi:message-outline"
      title="No recent conversations"
      message="Ask Neptune AI something to start one."
    />
  );
}

/**
 * The full Neptune AI workspace: saved conversations on the left, the active thread on the right.
 *
 * "New chat" deselects rather than creating anything — the thread is created by the backend when
 * the first question is answered, and its id comes back on the reply. There is nothing to create
 * up front, and creating an empty thread on every click would litter the rail.
 *
 * The pending question and its analyzing card are held in local state rather than written into
 * the query cache. An answer takes seconds and can fail; a cache write would leave a question
 * sitting in the thread with no answer and no way to retry it.
 */
export function NeptuneAiPageClient() {
  const { user } = useSessionBootstrap();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const conversations = useAssistantConversationsQuery();
  const thread = useAssistantConversationQuery(activeId);
  const ask = useAskAssistantMutation();

  const rows = conversations.data ?? [];
  const isBusy = ask.isPending;

  const messages = useMemo<ChatMessage[]>(() => {
    const stored = (thread.data?.messages ?? []).map(toChatMessage);

    if (pendingQuestion === null) {
      return stored;
    }

    // The question is echoed straight away and the analyzing card sits under it, so the wait
    // happens where the answer will appear rather than somewhere else on the page.
    return [
      ...stored,
      {
        id: "pending-question",
        author: "user" as const,
        authorName: "You",
        body: pendingQuestion,
      },
      {
        id: "pending-answer",
        author: "ai" as const,
        authorName: "Neptune AI",
        body: "",
        analyzing: {
          doneSteps: [],
          activeStep: ANALYZING_STEPS[0]!,
        },
      },
    ];
  }, [thread.data, pendingQuestion]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function send(question: string) {
    const trimmed = question.trim();

    // Two questions at once would race into the same thread and come back out of order.
    if (trimmed === "" || isBusy) {
      return;
    }

    setFailure(null);
    setDraft("");
    setPendingQuestion(trimmed);

    ask.mutate(
      {
        payload: { message: trimmed },
        conversationId: activeId ?? undefined,
      },
      {
        onSuccess: async (reply) => {
          setPendingQuestion(null);

          if (!reply) {
            setFailure("The assistant did not return an answer. Try again.");
            return;
          }

          // Selecting the new thread is what makes its stored turns — question and answer
          // both — become the rendered list, which is why the pending pair can be dropped.
          setActiveId(reply.conversationId);
          await thread.refetch();
        },
        onError: () => {
          setPendingQuestion(null);
          setFailure(
            "The assistant could not answer that right now. Your question was not saved — try again.",
          );
        },
      },
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
        <header className="flex flex-wrap items-center gap-2">
          <LogoMark
            className="text-ehs-normal-blue size-8 shrink-0"
            decorative
          />
          <Text
            as="h1"
            className="text-ehs-normal-blue text-[26px] font-bold tracking-[-0.52px]"
          >
            Neptune AI
          </Text>
        </header>

        <div className="grid min-w-0 flex-1 gap-3.5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          <GlassCard className="h-fit gap-3">
            <div className="flex items-center justify-between gap-2">
              <Text as="h2" className="text3 text-ehs-darker">
                Recent Chats
              </Text>
              <button
                type="button"
                onClick={() => {
                  setActiveId(null);
                  setFailure(null);
                }}
                aria-label="Start a new chat"
                className="bg-ehs-normal-blue/12 text-ehs-normal-blue hover:bg-ehs-normal-blue/20 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors"
              >
                <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
              </button>
            </div>

            {rows.length === 0 ? (
              <EmptyRail />
            ) : (
              <div className="flex flex-col gap-1">
                {rows.map((conversation) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={{
                      title: conversation.title,
                      timestamp: formatConversationTimestamp(
                        conversation.lastMessageAt,
                      ),
                      preview: conversation.preview ?? "",
                    }}
                    isActive={conversation.id === activeId}
                    onSelect={() => {
                      setActiveId(conversation.id);
                      setFailure(null);
                    }}
                  />
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="min-w-0 justify-between gap-4">
            {messages.length > 0 ? (
              <div className="flex min-w-0 flex-col gap-5">
                {messages.map((message) => (
                  <PageMessage
                    key={message.id}
                    message={message}
                    displayName={user.displayName}
                    initials={user.initials}
                    profileUrl={user.profileUrl}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            ) : (
              <EmptyThread />
            )}

            <div className="flex flex-col gap-3">
              {failure ? (
                <Text
                  as="p"
                  role="alert"
                  className="text-ehs-red text-xs font-semibold"
                >
                  {failure}
                </Text>
              ) : null}

              <div className="flex scrollbar-none gap-2 overflow-x-auto">
                {PAGE_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      send(suggestion);
                    }}
                    className="border-ehs-border-ink/8 bg-ehs-surface text-ehs-gray hover:bg-ehs-surface-inverse/4 shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60"
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
                className="border-ehs-border-ink/8 bg-ehs-surface flex items-center gap-3 rounded-full border px-4 py-2.5"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                  }}
                  disabled={isBusy}
                  maxLength={2000}
                  placeholder="Ask Neptune AI anything about EHS..."
                  aria-label="Ask Neptune AI"
                  className="text-ehs-dark-bg placeholder:text-ehs-muted-text min-w-0 flex-1 bg-transparent text-[13px] outline-none disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isBusy || draft.trim() === ""}
                  aria-label="Send message"
                  className="bg-ehs-normal-blue text-ehs-on-accent inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon
                    icon={isBusy ? "mdi:loading" : "mdi:arrow-up"}
                    className={`size-4 ${isBusy ? "animate-spin motion-reduce:animate-none" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </form>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
