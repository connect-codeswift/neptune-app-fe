export type IncidentBadgeTone =
  | "neutral"
  | "teal"
  | "muted"
  | "danger"
  | "warn"
  | "success";

export type IncidentBadgeProps = Readonly<{
  label: string;
  tone?: IncidentBadgeTone;
  showDot?: boolean;
  className?: string;
}>;

const toneClassName: Record<IncidentBadgeTone, string> = {
  neutral: "bg-ehs-dark-bg/16 text-ehs-gray",
  teal: "bg-ehs-normal-blue/18 text-ehs-dark-blue",
  muted: "bg-ehs-dark-bg/14 text-ehs-gray",
  danger: "bg-ehs-red/10 text-ehs-red",
  warn: "bg-ehs-yellow/15 text-ehs-yellow",
  success: "bg-ehs-green/10 text-ehs-green",
};

const dotClassName: Record<IncidentBadgeTone, string> = {
  neutral: "bg-ehs-gray",
  teal: "bg-ehs-dark-blue",
  muted: "bg-ehs-muted-text",
  danger: "bg-ehs-red",
  warn: "bg-ehs-yellow",
  success: "bg-ehs-green",
};

export function IncidentBadge(props: Readonly<IncidentBadgeProps>) {
  const { label, tone = "neutral", showDot = false, className = "" } = props;

  return (
    <span
      className={[
        "text5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 whitespace-nowrap",
        toneClassName[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showDot ? (
        <span
          className={[
            "size-1.5 shrink-0 rounded-[3px]",
            dotClassName[tone],
          ].join(" ")}
          aria-hidden="true"
        />
      ) : null}
      {label}
    </span>
  );
}

export function severityTone(severity: string): IncidentBadgeTone {
  const lower = severity.trim().toLowerCase();

  if (lower.includes("first aid") || lower === "first-aid") {
    return "success";
  }

  if (
    lower === "sip" ||
    lower.includes("lost time") ||
    lower === "lti" ||
    lower.includes("lost-time")
  ) {
    return "warn";
  }

  if (lower === "sia" || lower.includes("recordable") || lower === "osha") {
    return "danger";
  }

  return "neutral";
}

export function stateTone(state: string): IncidentBadgeTone {
  return state === "Open" ? "teal" : "muted";
}
