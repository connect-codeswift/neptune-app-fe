export type IncidentBadgeTone = "neutral" | "teal" | "muted" | "danger" | "warn";

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
};

const dotClassName: Record<IncidentBadgeTone, string> = {
  neutral: "bg-ehs-gray",
  teal: "bg-ehs-dark-blue",
  muted: "bg-ehs-muted-text",
  danger: "bg-ehs-red",
  warn: "bg-ehs-yellow",
};

export function IncidentBadge(props: Readonly<IncidentBadgeProps>) {
  const { label, tone = "neutral", showDot = false, className = "" } = props;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-[9px] pt-[2.5px] pb-[2.89px] text-[11px] leading-[15.4px] font-bold tracking-[0.11px] whitespace-nowrap",
        toneClassName[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showDot ? (
        <span
          className={["size-1.5 shrink-0 rounded-[3px]", dotClassName[tone]].join(
            " ",
          )}
          aria-hidden="true"
        />
      ) : null}
      {label}
    </span>
  );
}

export function severityTone(_severity: string): IncidentBadgeTone {
  return "neutral";
}

export function stateTone(state: string): IncidentBadgeTone {
  return state === "Open" ? "teal" : "muted";
}

export function stageTone(_stage: string): IncidentBadgeTone {
  return "muted";
}
