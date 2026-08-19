"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import {
  LOGO_MARK_RING_RADIUS,
  LOGO_MARK_RING_WIDTH,
  LogoMark,
  NEPTUNE_N_PATH,
} from "@/components/LogoMark";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  PAGE_SUGGESTIONS,
  SAMPLE_CONVERSATIONS,
  type ChatChart,
  type ChatConversation,
  type ChatMessage,
  type ChatTable,
  type ChatTableSeverity,
  type ChatTableStatus,
} from "@/components/neptune-ai/neptune-ai-data";
import { AvatarPreview } from "@/components/profile/ProfileAvatarUpload";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";

/** Severity pill and status ink, matching the design's red/amber/green reading. */
const SEVERITY_PILL: Readonly<Record<ChatTableSeverity, string>> = {
  High: "bg-ehs-red/12 text-ehs-red",
  Medium: "bg-ehs-yellow/15 text-ehs-yellow-ink-soft",
  Low: "bg-ehs-green/12 text-ehs-green",
};

const STATUS_INK: Readonly<Record<ChatTableStatus, string>> = {
  Unresolved: "text-ehs-red",
  "In Progress": "text-ehs-yellow-ink-soft",
  Resolved: "text-ehs-green",
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
    conversation: ChatConversation;
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
              {["Category", "Count", "Severity", "Status"].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="text-ehs-darker px-2.5 py-2 text-[11px] font-bold first:rounded-l-md last:rounded-r-md"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr
                key={row.category}
                className="border-ehs-border-ink/6 border-b last:border-0"
              >
                <td className="text-ehs-darker px-2.5 py-2.5 text-xs">
                  {row.category}
                </td>
                <td className="text-ehs-darker px-2.5 py-2.5 text-xs tabular-nums">
                  {String(row.count)}
                </td>
                <td className="px-2.5 py-2.5">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${SEVERITY_PILL[row.severity]}`}
                  >
                    {row.severity}
                  </span>
                </td>
                <td
                  className={`px-2.5 py-2.5 text-xs font-semibold ${STATUS_INK[row.status]}`}
                >
                  {row.status}
                </td>
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
    <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
      <Icon
        icon="mdi:message-outline"
        className="text-ehs-muted-text size-6"
        aria-hidden="true"
      />
      <Text as="p" className="text-ehs-muted-text text-[11px]">
        No recent conversations
      </Text>
    </div>
  );
}

/**
 * The full Neptune AI workspace: saved conversations on the left, the active thread on the right.
 *
 * "New chat" deselects into the empty state rather than creating anything — there is no API to
 * create against yet, and the empty screen is a designed state worth being able to reach.
 */
export function NeptuneAiPageClient() {
  const { user } = useSessionBootstrap();
  const [activeId, setActiveId] = useState<string | null>(
    SAMPLE_CONVERSATIONS[0]!.id,
  );

  const active =
    SAMPLE_CONVERSATIONS.find((entry) => entry.id === activeId) ?? null;
  const suggestions = active?.suggestions ?? PAGE_SUGGESTIONS;

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
          <Text
            as="span"
            className="border-ehs-warning-border bg-ehs-warning-surface text-ehs-warning-ink ml-2 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase"
          >
            Preview — not connected
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
                onClick={() => setActiveId(null)}
                aria-label="Start a new chat"
                className="bg-ehs-normal-blue/12 text-ehs-normal-blue hover:bg-ehs-normal-blue/20 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors"
              >
                <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
              </button>
            </div>

            {SAMPLE_CONVERSATIONS.length === 0 ? (
              <EmptyRail />
            ) : (
              <div className="flex flex-col gap-1">
                {SAMPLE_CONVERSATIONS.map((conversation) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={conversation}
                    isActive={conversation.id === activeId}
                    onSelect={() => setActiveId(conversation.id)}
                  />
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="min-w-0 justify-between gap-4">
            {active ? (
              <div className="flex min-w-0 flex-col gap-5">
                {active.messages.map((message) => (
                  <PageMessage
                    key={message.id}
                    message={message}
                    displayName={user.displayName}
                    initials={user.initials}
                    profileUrl={user.profileUrl}
                  />
                ))}
              </div>
            ) : (
              <EmptyThread />
            )}

            <div className="flex flex-col gap-3">
              <div className="flex scrollbar-none gap-2 overflow-x-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled
                    className="border-ehs-border-ink/8 bg-ehs-surface text-ehs-gray shrink-0 cursor-not-allowed rounded-full border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="border-ehs-border-ink/8 bg-ehs-surface flex items-center gap-3 rounded-full border px-4 py-2.5">
                <Icon
                  icon="mdi:paperclip"
                  className="text-ehs-muted-text size-4 shrink-0"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  disabled
                  placeholder="Ask Neptune AI anything about EHS..."
                  aria-label="Ask Neptune AI"
                  className="text-ehs-dark-bg placeholder:text-ehs-muted-text min-w-0 flex-1 bg-transparent text-[13px] outline-none disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled
                  aria-label="Send message"
                  className="bg-ehs-normal-blue text-ehs-on-accent inline-flex size-9 shrink-0 cursor-not-allowed items-center justify-center rounded-full opacity-60"
                >
                  <Icon
                    icon="mdi:arrow-up"
                    className="size-4"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
