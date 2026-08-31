"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  LOGO_MARK_RING_RADIUS,
  LOGO_MARK_RING_WIDTH,
  LogoMark,
  NEPTUNE_N_PATH,
} from "@/components/LogoMark";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { BetaBadge } from "@/components/neptune-ai/BetaBadge";
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
import type { AssistantReplyDto } from "@/dtos/res/assistant-response.dto";
import {
  useAskAssistantMutation,
  useAssistantConversationQuery,
  useAssistantConversationsQuery,
  useDropAssistantConversationMutation,
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

/**
 * The rail entry for one saved conversation.
 *
 * A div wrapping two sibling buttons rather than one button, because the
 * delete control cannot legally nest inside the select control. Delete is
 * always visible — behind a confirm dialog it costs nothing to show, and a
 * hover-revealed control is a control most people never find. Below lg the
 * row renders as a fixed-width chip in a horizontal strip with the preview
 * hidden.
 */
function ConversationRow(
  props: Readonly<{
    conversation: Readonly<{
      title: string;
      timestamp: string;
      preview: string;
    }>;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
  }>,
) {
  const { conversation, isActive, onSelect, onDelete } = props;

  return (
    // The border, fill and hover live on this wrapper rather than the select
    // button so the always-visible delete sits inside the same card. Deleting
    // is guarded by the confirm dialog, so a permanent control is safe.
    <div
      className={[
        "rounded-2.5 flex items-start border transition-colors max-lg:w-48 max-lg:shrink-0",
        isActive
          ? "border-ehs-normal-blue/30 bg-ehs-normal-blue/10"
          : "hover:bg-ehs-surface-inverse/3 border-transparent",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? "true" : undefined}
        className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1 p-3 pr-1.5 text-left"
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

        <Text
          as="p"
          className="text-ehs-gray line-clamp-2 text-[11px] leading-4 max-lg:hidden"
        >
          {conversation.preview}
        </Text>
      </button>

      {/* mt-2 lines the trash up with the title row's cap height. */}
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete conversation "${conversation.title}"`}
        className="text-ehs-muted-text hover:text-ehs-red hover:bg-ehs-light-bg mt-2 mr-1.5 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors"
      >
        <Icon
          icon="mdi:trash-can-outline"
          className="size-3.5"
          aria-hidden="true"
        />
      </button>
    </div>
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

function tableToCsv(table: ChatTable): string {
  const escapeCell = (text: string) => `"${text.replaceAll('"', '""')}"`;

  return [
    table.columns.map(escapeCell).join(","),
    ...table.rows.map((row) =>
      row.map((cell) => escapeCell(cell.text)).join(","),
    ),
  ].join("\r\n");
}

/** Client-side CSV download — the table is already fully in hand. */
function downloadTableAsCsv(table: ChatTable) {
  const slug =
    table.title
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-+|-+$/g, "") || "table";

  // The BOM is for Excel, which otherwise reads UTF-8 as the local codepage.
  const blob = new Blob([`\uFEFF${tableToCsv(table)}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug}.csv`;
  anchor.click();

  URL.revokeObjectURL(url);
}

/**
 * One table cell: a tinted pill when the backend gave it a tone, plain text otherwise.
 *
 * Short values must not wrap — "August 1, 2026, at 19:00 UTC" split over five
 * lines is what made these tables unreadable. The columns are arbitrary, so
 * length is the only tell: anything under ~32 characters stays on one line,
 * and genuinely long prose (descriptions) wraps with a width floor so its
 * nowrap neighbours cannot crush it.
 */
function TableCell(props: Readonly<{ cell: ChatCell }>) {
  const { cell } = props;
  const pill = cell.tone ? TONE_PILL[cell.tone] : "";
  const wrapClass =
    cell.text.length <= 32 ? "whitespace-nowrap" : "min-w-44 leading-4.5";

  if (pill) {
    return (
      <td className="px-2.5 py-2.5 align-top">
        <span
          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${pill}`}
        >
          {cell.text}
        </span>
      </td>
    );
  }

  return (
    <td
      className={`text-ehs-darker px-2.5 py-2.5 align-top text-xs ${wrapClass} ${isNumeric(cell.text) ? "tabular-nums" : ""}`}
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
          onClick={() => {
            downloadTableAsCsv(table);
          }}
          className="text-ehs-normal-blue hover:text-ehs-dark-blue inline-flex cursor-pointer items-center gap-1 text-xs font-semibold transition-colors"
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
                  className="text-ehs-darker px-2.5 py-2 text-[11px] font-bold whitespace-nowrap first:rounded-l-md last:rounded-r-md"
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
                className="border-ehs-border-ink/6 hover:bg-ehs-surface-raised/50 border-b transition-colors last:border-0"
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

  // Prose keeps a bubble's measure; a reply carrying data blocks becomes a
  // full-width panel instead. Capping an eight-column table at bubble width
  // strangled every cell while most of the card sat empty.
  const hasBlocks = Boolean(
    message.chart ??
    message.table ??
    message.insights ??
    (message.results && message.results.length > 0 ? message.results : null),
  );

  return (
    <div className="flex w-full items-start gap-3">
      {isAnalyzing ? (
        <AnalyzingMark className="size-9 shrink-0" />
      ) : (
        <LogoMark className="text-ehs-normal-blue size-9 shrink-0" decorative />
      )}

      <div
        className={[
          "rounded-3 border-ehs-normal-blue/10 bg-ehs-normal-blue/10 flex min-w-0 flex-col gap-2.5 border p-3.5",
          hasBlocks ? "max-w-full flex-1" : "max-w-150",
        ].join(" ")}
      >
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
 * Ghost bubbles while an opened conversation loads. Before this, the loading
 * gap rendered `EmptyThread` — "Start a conversation" flashing over a thread
 * that very much exists.
 */
function ThreadSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden">
      <div className="flex justify-end">
        <Skeleton className="rounded-3 h-16 w-3/5" />
      </div>
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <Skeleton className="rounded-3 h-28 w-3/4" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="rounded-3 h-12 w-2/5" />
      </div>
    </div>
  );
}

/** A failed thread load, with the retry where the thread would be. */
function ThreadError(props: Readonly<{ onRetry: () => void }>) {
  const { onRetry } = props;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <Icon
        icon="mdi:alert-circle-outline"
        className="text-ehs-red size-8"
        aria-hidden="true"
      />
      <Text as="p" className="text-ehs-darker text-sm font-bold">
        Couldn&apos;t load this conversation
      </Text>
      <button
        type="button"
        onClick={onRetry}
        className="border-ehs-border-ink/8 bg-ehs-surface text-ehs-gray hover:bg-ehs-surface-inverse/4 cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * One question and, once it lands, its answer — held locally until the
 * refetched thread carries the stored copy. Holding the reply (rather than
 * dropping the pending pair the moment it arrives) is what keeps the landing
 * seamless: the old flow cleared the pair first and refetched after, so the
 * thread flashed empty and the answer then popped in wholesale.
 */
type PendingExchange = Readonly<{
  question: string;
  reply: AssistantReplyDto | null;
}>;

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
  const [pending, setPending] = useState<PendingExchange | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [analyzingStepIndex, setAnalyzingStepIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<Readonly<{
    id: number;
    title: string;
  }> | null>(null);

  const conversations = useAssistantConversationsQuery();
  const thread = useAssistantConversationQuery(activeId);
  const ask = useAskAssistantMutation();
  const drop = useDropAssistantConversationMutation();

  const rows = conversations.data ?? [];
  const isBusy = ask.isPending;

  /**
   * Back to the fresh-chat state. Nothing is created server-side — a conversation
   * only exists once the first question is asked — so this just drops the open
   * thread and clears anything left over from it.
   */
  function startNewChat() {
    setActiveId(null);
    setPending(null);
    setFailure(null);
  }

  // An answer can take up to 120 seconds; a card frozen on "Reading your
  // question" the whole time reads as stuck. The steps walk forward on a
  // timer and the last one holds until the reply lands.
  useEffect(() => {
    if (!isBusy) {
      return;
    }

    const timer = globalThis.setInterval(() => {
      setAnalyzingStepIndex((index) =>
        Math.min(index + 1, ANALYZING_STEPS.length - 1),
      );
    }, 2600);

    return () => {
      globalThis.clearInterval(timer);
    };
  }, [isBusy]);

  const messages = useMemo<ChatMessage[]>(() => {
    const stored = (thread.data?.messages ?? []).map(toChatMessage);

    if (pending === null) {
      return stored;
    }

    // Once the refetched thread carries the reply, the stored copy takes over
    // and the pending pair stops rendering. Content and keys are identical
    // (the reply keeps its real message id), so the handover is invisible.
    const replyMessage = pending.reply?.message ?? null;
    if (
      replyMessage !== null &&
      stored.some((message) => message.id === String(replyMessage.id))
    ) {
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
        body: pending.question,
      },
      replyMessage !== null
        ? toChatMessage(replyMessage)
        : {
            id: "pending-answer",
            author: "ai" as const,
            authorName: "Neptune AI",
            body: "",
            analyzing: {
              doneSteps: ANALYZING_STEPS.slice(0, analyzingStepIndex),
              activeStep:
                ANALYZING_STEPS[analyzingStepIndex] ?? ANALYZING_STEPS.at(-1)!,
            },
          },
    ];
  }, [thread.data, pending, analyzingStepIndex]);

  const threadRef = useRef<HTMLDivElement | null>(null);

  // Whether the reader is at (or near) the bottom. Auto-scroll only applies
  // while this holds — someone scrolled up reading an old answer must not be
  // yanked down when a new one lands. Sending your own question re-pins it.
  const stickToBottomRef = useRef(true);

  // The thread is its own scroll container, so pin it to the bottom directly.
  // `scrollIntoView` walked up to the document instead, which is what pushed
  // the whole page down as a conversation grew.
  //
  // Body length is a dependency as well as message count: when an answer
  // lands it replaces the pending placeholder rather than appending, so the
  // count alone never changes and the reply would arrive off-screen.
  const lastMessage = messages.at(-1);
  const lastMessageLength = lastMessage?.body.length ?? 0;
  const lastIsAnalyzing = Boolean(lastMessage?.analyzing);

  useEffect(() => {
    const container = threadRef.current;
    if (!container || !stickToBottomRef.current) {
      return;
    }

    const reduceMotion = globalThis.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    container.scrollTo({
      top: container.scrollHeight,
      // Smooth only for the short hop after sending (the echoed question and
      // its analyzing card). A full answer or a switched thread can move the
      // scroll a long way, and animating that distance is the lurch the page
      // used to make — those land instantly.
      behavior: !reduceMotion && lastIsAnalyzing ? "smooth" : "auto",
    });
  }, [
    messages.length,
    lastMessageLength,
    lastIsAnalyzing,
    analyzingStepIndex,
    activeId,
  ]);

  function send(question: string) {
    const trimmed = question.trim();

    // Two questions at once would race into the same thread and come back out of order.
    if (trimmed === "" || isBusy) {
      return;
    }

    setFailure(null);
    setDraft("");
    setAnalyzingStepIndex(0);
    stickToBottomRef.current = true;
    setPending({ question: trimmed, reply: null });

    ask.mutate(
      {
        payload: { message: trimmed },
        conversationId: activeId ?? undefined,
      },
      {
        onSuccess: (reply) => {
          if (!reply) {
            setPending(null);
            setDraft((current) => (current === "" ? trimmed : current));
            setFailure("The assistant did not return an answer. Try again.");
            return;
          }

          // The reply renders right here, replacing the analyzing card in
          // place; the pending pair is dropped only once the refetched thread
          // (invalidated by the mutation hook) carries the stored copy. The
          // old flow — clear pending, then refetch — flashed the thread empty
          // and popped the answer in wholesale.
          stickToBottomRef.current = true;
          setPending({ question: trimmed, reply });
          setActiveId(reply.conversationId);
        },
        onError: () => {
          setPending(null);
          // The question goes back into the composer, ready to retry, unless
          // something new has been typed there since.
          setDraft((current) => (current === "" ? trimmed : current));
          setFailure(
            "The assistant could not answer that right now. Your question was not saved — try again.",
          );
        },
      },
    );
  }

  // Assigned across an if/else chain rather than chained ternaries in the JSX
  // (Sonar S3358). The pending guard matters: right after asking in a fresh
  // chat the new thread is still loading, and the skeleton must not cover the
  // live question and answer.
  let threadBody: ReactNode;
  const isOpeningStoredThread = activeId !== null && pending === null;

  if (isOpeningStoredThread && thread.isLoading) {
    threadBody = <ThreadSkeleton />;
  } else if (isOpeningStoredThread && thread.isError) {
    threadBody = (
      <ThreadError
        onRetry={() => {
          void thread.refetch();
        }}
      />
    );
  } else if (messages.length > 0) {
    threadBody = (
      // The one scroller on the page. tabIndex makes it reachable by
      // keyboard, since a scroll region with no focusable child cannot
      // otherwise be scrolled without a pointer; role="log" has new turns
      // announced politely by screen readers.
      <div
        ref={threadRef}
        role="log"
        tabIndex={0}
        aria-label="Conversation"
        aria-busy={isBusy}
        onScroll={(event) => {
          const el = event.currentTarget;
          stickToBottomRef.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 96;
        }}
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain pr-1 focus-visible:outline-none"
      >
        {messages.map((message) => (
          <PageMessage
            key={message.id}
            message={message}
            displayName={user.displayName}
            initials={user.initials}
            profileUrl={user.profileUrl}
          />
        ))}
      </div>
    );
  } else {
    threadBody = <EmptyThread />;
  }

  return (
    // The max-h is what actually pins this page to the viewport. AppShell's
    // content column has only a MIN-height, so it grows with its content —
    // and `flex-1 min-h-0` alone cannot stop a flex child from growing an
    // auto-height parent; the whole document just got taller with the thread.
    // A max-height caps the page's contribution to that auto height, which is
    // the moment the thread's own scrollbar finally has something to do.
    // The numbers mirror AppShell: 3.5rem mobile header + 1rem column
    // padding-top; from lg only the padding. (The org-limits banner, when one
    // shows, adds its height as document scroll — a known, bounded slip.)
    // Every descendant down to the thread still repeats `min-h-0`, because a
    // flex child defaults to min-height:auto and would otherwise refuse to
    // shrink below its content.
    <div className="flex max-h-[calc(100dvh-4.5rem)] min-h-0 flex-1 flex-col lg:max-h-[calc(100dvh-1rem)]">
      {/* The same header the other top-level modules use — CAPA, Inspections,
          PPE — rather than the glass card the detail pages carry, because this
          is a top-level destination. The site switcher is not decoration here:
          selecting a site reissues the session against it, and every answer the
          assistant gives is scoped to that token, so this row is what says which
          site it is talking about. Sits outside the padded column, as on those
          pages, but inside the height cap so the thread yields the space. */}
      <DashboardHeader
        title="Neptune AI"
        badge={<BetaBadge />}
        actionLabel="New chat"
        onActionClick={startNewChat}
        // Unlike the pages this header usually sits on, this column is height
        // capped, so without this the header would be squeezed by the thread
        // rather than the thread yielding to it.
        className="shrink-0"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3.5 px-4 pb-4">
        {/* Stacked on mobile — the rail is a slim chip strip and the chat
            takes the rest; side by side from lg. */}
        <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3.5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:grid-rows-1">
          {/* h-fit so a short list still hugs its content; max-h caps it so a
              long one scrolls inside the card rather than stretching the page.
              With nothing to list, the card vanishes below lg instead of
              spending a third of a phone screen announcing it is empty — the
              composer is the call to action there. */}
          <GlassCard
            className={[
              "h-fit max-h-full min-h-0 gap-3",
              rows.length === 0 ? "max-lg:hidden" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* No "+" of its own any more: the header's New chat button is the
                one affordance, and it is labelled and reachable even here, where
                this whole card is hidden on a phone with no history yet. */}
            <Text as="h2" className="text3 text-ehs-darker shrink-0">
              Recent Chats
            </Text>

            {rows.length === 0 ? (
              <EmptyRail />
            ) : (
              // A vertical list from lg; a horizontal chip strip below it,
              // where a stacked list would spend half the screen before the
              // chat starts.
              <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain max-lg:scrollbar-none max-lg:flex-row max-lg:gap-2 max-lg:overflow-x-auto max-lg:overflow-y-visible">
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
                      stickToBottomRef.current = true;
                      setActiveId(conversation.id);
                      setPending(null);
                      setFailure(null);
                    }}
                    onDelete={() => {
                      setConfirmDelete({
                        id: conversation.id,
                        title: conversation.title,
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="min-h-0 min-w-0 justify-between gap-4 overflow-hidden">
            {threadBody}

            <div className="flex shrink-0 flex-col gap-3">
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
                {/* Typable while an answer is in flight — send() blocks the
                    race, and a disabled input would throw the keyboard away
                    for up to two minutes. text-base below lg: iOS zooms the
                    whole page into any focused input under 16px. */}
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                  }}
                  maxLength={2000}
                  placeholder="Ask Neptune AI anything about EHS..."
                  aria-label="Ask Neptune AI"
                  className="text-ehs-dark-bg placeholder:text-ehs-muted-text min-w-0 flex-1 bg-transparent text-base outline-none lg:text-[13px]"
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

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove this chat?"
        description={
          confirmDelete
            ? `"${confirmDelete.title}" and its messages will be removed from your history.`
            : undefined
        }
        confirmLabel="Remove"
        isConfirming={drop.isPending}
        onCancel={() => {
          setConfirmDelete(null);
        }}
        onConfirm={() => {
          if (!confirmDelete) {
            return;
          }

          drop.mutate(confirmDelete.id, {
            onSuccess: () => {
              // Deleting the open thread leaves nothing to show — fall back
              // to the fresh-chat state rather than a dead id.
              if (activeId === confirmDelete.id) {
                setActiveId(null);
                setPending(null);
              }
              setConfirmDelete(null);
            },
            onError: () => {
              setConfirmDelete(null);
              setFailure("Couldn't delete that conversation. Try again.");
            },
          });
        }}
      />
    </div>
  );
}
