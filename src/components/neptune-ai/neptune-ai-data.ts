/**
 * The chat surfaces' shared vocabulary.
 *
 * A reply is plain text plus any number of typed blocks — result cards, a bar chart, a table, an
 * insights list, or an in-flight analyzing checklist. These types mirror the backend's
 * `AssistantMessageDto` field for field, so a reply from `/api/v1/assistant` becomes a
 * `ChatMessage` without a mapping layer.
 *
 * Everything here used to be hardcoded sample content, rendered behind a "not connected" badge.
 * The transport is real now; what remains is the shape and the two lists of starter prompts.
 */

export type ChatAuthor = "ai" | "user";

/** A structured result the assistant can attach under its reply — a hazard, an action, a doc. */
export type ChatResultCard = Readonly<{
  id: string;
  title: string;
  detail: string;
}>;

/** The "Neptune AI is analyzing…" progress card: finished steps plus the one in flight. */
export type ChatAnalyzing = Readonly<{
  doneSteps: readonly string[];
  activeStep: string;
}>;

export type ChatChartBar = Readonly<{ label: string; value: number }>;

/** A small titled bar chart rendered inside the reply. */
export type ChatChart = Readonly<{
  title: string;
  bars: readonly ChatChartBar[];
}>;

/**
 * How a cell should read, not what colour it should be.
 *
 * The assistant is asked whether a value is bad, watch-it or fine — never asked to pick red.
 * Naming colours on the wire would put this palette in the API contract and mean a theme change
 * had to be negotiated with a prompt.
 */
export type ChatCellTone = "critical" | "warning" | "ok" | "neutral";

export type ChatCell = Readonly<{
  text: string;
  tone?: ChatCellTone | null;
}>;

/**
 * A titled data table with whatever columns the answer needs.
 *
 * The first cut of this type fixed the columns at category/count/severity/status, which fits
 * exactly one question — "open CAPAs by owner and due date" could not be expressed in it. The
 * backend guarantees every row has as many cells as there are columns.
 */
export type ChatTable = Readonly<{
  title: string;
  columns: readonly string[];
  rows: readonly (readonly ChatCell[])[];
}>;

export type ChatInsights = Readonly<{
  title: string;
  points: readonly string[];
}>;

export type ChatMessage = Readonly<{
  id: string;
  author: ChatAuthor;
  /** Shown above the bubble on the full page, omitted in the compact popup. */
  authorName: string;
  body: string;
  results?: readonly ChatResultCard[];
  analyzing?: ChatAnalyzing;
  chart?: ChatChart;
  table?: ChatTable;
  insights?: ChatInsights;
}>;

export type ChatConversation = Readonly<{
  id: string;
  title: string;
  /** Right-aligned in the rail: a clock time for today, otherwise a short date. */
  timestamp: string;
  preview: string;
  messages: readonly ChatMessage[];
  /** Contextual quick prompts for this thread; falls back to PAGE_SUGGESTIONS. */
  suggestions?: readonly string[];
}>;

/**
 * The opening line in the compact popup, shown before anything has been asked.
 *
 * Local rather than fetched: the greeting is the same every time and waiting on a round trip to
 * say hello would make the panel feel slower than it is.
 */
export const POPUP_GREETING: ChatMessage = {
  id: "greeting",
  author: "ai",
  authorName: "Neptune AI",
  body: "Hello! I am Neptune, your EHS assistant. I can fetch incident summaries, track audits, or find corrective action status.",
};

/**
 * The steps shown while an answer is in flight.
 *
 * Fixed, and honestly so. The backend answers in one request rather than streaming its progress,
 * so these describe the shape of the work rather than reporting it — the checklist advances on a
 * timer, not on anything the server said. Replace this with real events if the endpoint ever
 * streams them.
 */
export const ANALYZING_STEPS: readonly string[] = [
  "Reading your question",
  "Gathering your site's data",
  "Checking the numbers",
  "Writing the answer",
];

/** Quick prompts under the popup's message list. */
export const POPUP_SUGGESTIONS: readonly string[] = [
  "Summarize TRIR",
  "My pending actions",
];

/** Default quick prompts on the full page. */
export const PAGE_SUGGESTIONS: readonly string[] = [
  "Summarize today's incidents",
  "Show compliance deadlines",
  "Analyze hazard trends",
  "What are my open actions?",
];

/**
 * One API turn as the renderers want it.
 *
 * The block fields already match, so this is mostly a null-to-undefined pass: the backend sends
 * `null` for a block it did not use, and the optional properties here read better as absent.
 */
export function toChatMessage(message: {
  id: number;
  author: "ai" | "user";
  authorName?: string;
  body: string;
  results?: readonly ChatResultCard[] | null;
  chart?: ChatChart | null;
  table?: ChatTable | null;
  insights?: ChatInsights | null;
}): ChatMessage {
  return {
    id: String(message.id),
    author: message.author,
    authorName:
      message.authorName ?? (message.author === "user" ? "You" : "Neptune AI"),
    body: message.body,
    results: message.results ?? undefined,
    chart: message.chart ?? undefined,
    table: message.table ?? undefined,
    insights: message.insights ?? undefined,
  };
}

/** A clock time for today, a short date for anything older — the rail's right-hand column. */
export function formatConversationTimestamp(iso: string): string {
  const when = new Date(iso);

  if (Number.isNaN(when.getTime())) {
    return "";
  }

  const now = new Date();
  const isToday =
    when.getFullYear() === now.getFullYear() &&
    when.getMonth() === now.getMonth() &&
    when.getDate() === now.getDate();

  if (isToday) {
    return when.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (
    when.getFullYear() === yesterday.getFullYear() &&
    when.getMonth() === yesterday.getMonth() &&
    when.getDate() === yesterday.getDate()
  ) {
    return "Yesterday";
  }

  return when.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
