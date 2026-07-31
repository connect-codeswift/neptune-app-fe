export type IncidentBadgeTone =
  | "neutral"
  | "teal"
  | "muted"
  | "danger"
  | "warn";

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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold whitespace-nowrap",
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
