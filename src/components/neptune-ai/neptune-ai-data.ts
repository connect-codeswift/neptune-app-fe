/**
 * Sample content for the Neptune AI surfaces.
 *
 * Every string here is placeholder. The assistant has no API yet, so both the popup and the
 * full page render this and say so on screen — a chat that answers convincingly from a hardcoded
 * script is worse than an empty one, because nobody can tell which replies were real.
 *
 * The shapes below are the UI's contract: a reply is plain text plus any number of typed
 * blocks — result cards, a bar chart, a table, an insights list, or an in-flight analyzing
 * checklist. Wire the transport to produce these and the components need no changes.
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

export type ChatTableSeverity = "High" | "Medium" | "Low";
export type ChatTableStatus = "Unresolved" | "In Progress" | "Resolved";

export type ChatTableRow = Readonly<{
  category: string;
  count: number;
  severity: ChatTableSeverity;
  status: ChatTableStatus;
}>;

/** A titled data table with a (decorative, for now) CSV export affordance. */
export type ChatTable = Readonly<{
  title: string;
  rows: readonly ChatTableRow[];
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

/** The compact popup opens on this — a greeting and one worked example. */
export const POPUP_MESSAGES: readonly ChatMessage[] = [
  {
    id: "p1",
    author: "ai",
    authorName: "Neptune AI",
    body: "Hello! I am Neptune, your EHS assistant. I can fetch incident summaries, track audits, or find corrective action status.",
  },
  {
    id: "p2",
    author: "user",
    authorName: "You",
    body: "Show active chemical hazards in Warehouse 3",
  },
  {
    id: "p3",
    author: "ai",
    authorName: "Neptune AI",
    body: "Found 2 active chemical hazards in Warehouse 3:",
    results: [
      {
        id: "H-2041",
        title: "H-2041: Acid storage leak risk",
        detail: "SOP requires secondary containment inspect.",
      },
      {
        id: "H-2044",
        title: "H-2044: Solvent drum ventilation",
        detail: "Extraction check overdue by 4 days.",
      },
    ],
  },
];

/** Quick prompts under the popup's message list. */
export const POPUP_SUGGESTIONS: readonly string[] = [
  "Summarize TRIR",
  "My pending actions",
];

/** Default quick prompts on the full page, used when a thread has no contextual ones. */
export const PAGE_SUGGESTIONS: readonly string[] = [
  "Summarize today's incidents",
  "Show compliance deadlines",
  "Analyze hazard trends",
  "Training recommendations",
];

export const SAMPLE_CONVERSATIONS: readonly ChatConversation[] = [
  {
    id: "q3-safety-analysis",
    title: "Q3 Safety Analysis",
    timestamp: "10:24 AM",
    preview: "Incident analysis for Q3 shows high ergonomics risks in line 4…",
    suggestions: [
      "Export this table to PDF",
      "Breakdown by shift team",
      "Show root causes",
    ],
    messages: [
      {
        id: "m1",
        author: "user",
        authorName: "You",
        body: "Show me the incident trends and give me a full breakdown for warehouse operations.",
      },
      {
        id: "m2",
        author: "ai",
        authorName: "Neptune AI",
        body: "Here is the comprehensive EHS performance analysis for Warehouse Operations over the trailing Q3 period, showcasing core incident metrics, categorization distributions, and recommendations:",
        chart: {
          title: "Monthly Incident Count (May - Oct)",
          bars: [
            { label: "May", value: 10 },
            { label: "Jun", value: 15 },
            { label: "Jul", value: 24 },
            { label: "Aug", value: 18 },
            { label: "Sep", value: 22 },
            { label: "Oct", value: 14 },
          ],
        },
        table: {
          title: "Incident Category Distribution",
          rows: [
            {
              category: "Mechanical",
              count: 14,
              severity: "High",
              status: "Unresolved",
            },
            {
              category: "Ergonomics",
              count: 23,
              severity: "Medium",
              status: "In Progress",
            },
            {
              category: "Slip & Fall",
              count: 18,
              severity: "Medium",
              status: "Resolved",
            },
            {
              category: "Electrical",
              count: 8,
              severity: "High",
              status: "Unresolved",
            },
          ],
        },
        insights: {
          title: "Core Insights:",
          points: [
            "Mechanical and ergonomics categories comprise over 55% of all active tickets.",
            "Urgent focus is required on the backlog of Unresolved High severity issues in conveyor belt maintenance workflows.",
          ],
        },
      },
    ],
  },
  {
    id: "warehouse-risk-assessment",
    title: "Warehouse Risk Assessment",
    timestamp: "10:12 AM",
    preview:
      "Generating a comprehensive risk assessment for warehouse operations…",
    suggestions: [
      "Stop generation",
      "Exclude contractor reports",
      "Focus on Plant A only",
    ],
    messages: [
      {
        id: "r1",
        author: "user",
        authorName: "You",
        body: "Generate a comprehensive risk assessment for all warehouse operations this quarter.",
      },
      {
        id: "r2",
        author: "ai",
        authorName: "Neptune AI",
        body: "",
        analyzing: {
          doneSteps: ["Gathering incident data", "Analyzing risk factors"],
          activeStep: "Generating assessment...",
        },
      },
    ],
  },
  {
    id: "compliance-review",
    title: "Compliance Review",
    timestamp: "Yesterday",
    preview:
      "Compliance deadline review for fire marshal permits and safety checklists…",
    messages: [
      {
        id: "c1",
        author: "user",
        authorName: "You",
        body: "Which compliance deadlines land in the next two weeks?",
      },
      {
        id: "c2",
        author: "ai",
        authorName: "Neptune AI",
        body: "Four obligations fall due before the end of the month. Fire marshal permits for Buildings A and C renew first, followed by two quarterly safety checklists.",
      },
    ],
  },
  {
    id: "hazard-trends",
    title: "Hazard Trends",
    timestamp: "Oct 24",
    preview:
      "Hazard trend report shows mechanical hazards down 14% this month…",
    messages: [
      {
        id: "h1",
        author: "user",
        authorName: "You",
        body: "How are hazard trends moving quarter on quarter?",
      },
      {
        id: "h2",
        author: "ai",
        authorName: "Neptune AI",
        body: "Mechanical hazards are down 14% against last month, driven by the conveyor guarding programme. Chemical hazards are flat, and ergonomic reports rose 6% in packaging.",
      },
    ],
  },
  {
    id: "loto-training-check",
    title: "LOTO Training Check",
    timestamp: "Oct 22",
    preview: "Training compliance is currently sitting at 82% overall…",
    messages: [
      {
        id: "l1",
        author: "user",
        authorName: "You",
        body: "Where does lockout/tagout training compliance stand?",
      },
      {
        id: "l2",
        author: "ai",
        authorName: "Neptune AI",
        body: "Overall completion is 82%. Maintenance is fully certified; the gap sits with contractors on the night shift, where 11 people are outstanding.",
      },
    ],
  },
  {
    id: "ppe-inventory-audit",
    title: "PPE Inventory Audit",
    timestamp: "Oct 18",
    preview: "Status update on emergency respiratory protection kit shipments…",
    messages: [
      {
        id: "p1",
        author: "user",
        authorName: "You",
        body: "Any gaps in the emergency respiratory kits?",
      },
      {
        id: "p2",
        author: "ai",
        authorName: "Neptune AI",
        body: "Two of nine stations are below the minimum stock line. Replacement cartridges are on order with delivery expected within the week.",
      },
    ],
  },
];
