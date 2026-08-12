import type { HazcomBadgeTone } from "@/components/hazcom/shared/hazcom-types";

export type HazcomBadgeProps = Readonly<{
  label: string;
  tone?: HazcomBadgeTone;
  showDot?: boolean;
  className?: string;
}>;

const toneClassName: Record<HazcomBadgeTone, string> = {
  neutral: "bg-ehs-dark-bg/16 text-ehs-gray",
  teal: "bg-ehs-normal-blue/18 text-ehs-dark-blue",
  muted: "bg-ehs-dark-bg/14 text-ehs-gray",
  danger: "bg-ehs-red/10 text-ehs-red",
  warn: "bg-ehs-yellow/15 text-ehs-yellow",
  success: "bg-ehs-green/10 text-ehs-green",
};

const dotClassName: Record<HazcomBadgeTone, string> = {
  neutral: "bg-ehs-gray",
  teal: "bg-ehs-dark-blue",
  muted: "bg-ehs-muted-text",
  danger: "bg-ehs-red",
  warn: "bg-ehs-yellow",
  success: "bg-ehs-green",
};

export function HazcomBadge(props: Readonly<HazcomBadgeProps>) {
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

export function sdsStatusTone(value: string): HazcomBadgeTone {
  switch (value) {
    case "Compliant":
      return "success";
    case "Due Soon":
      return "warn";
    case "Overdue":
      return "danger";
    default:
      return "neutral";
  }
}

export function chemicalStatusTone(value: string): HazcomBadgeTone {
  return value === "Active" ? "teal" : "muted";
}

export function riskLevelTone(value: string): HazcomBadgeTone {
  switch (value) {
    case "Low":
      return "success";
    case "Medium":
      return "warn";
    case "High":
      return "danger";
    case "Critical":
      return "danger";
    default:
      return "neutral";
  }
}

export function assessmentStatusTone(value: string): HazcomBadgeTone {
  switch (value) {
    case "Approved":
      return "success";
    case "Pending":
      return "warn";
    case "Draft":
      return "muted";
    default:
      return "neutral";
  }
}

export function trainingStatusTone(value: string): HazcomBadgeTone {
  return value === "Completed" ? "success" : "teal";
}
