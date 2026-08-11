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
        // White hairline gives the frosted read on glass cards. Deliberately
        // no backdrop-blur: these render dozens-per-table, each blur is its
        // own compositing layer, and at pill size the effect is invisible —
        // the translucent tint + hairline carry the material.
        // text5 matches Incident list badge type scale.
        "text5 inline-flex items-center gap-1.5 rounded-full border border-white/50 px-2.5 py-0.5 whitespace-nowrap",
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
