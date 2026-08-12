import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type {
  TargetDirection,
  TargetStatus,
} from "@/components/incidents/dashboard/incident-kpis-data";

export type TargetProgressProps = Readonly<{
  current: number;
  target: number | null;
  targetLabel: string | null;
  direction?: TargetDirection;
  compact?: boolean;
  className?: string;
}>;

const TARGET_MARKER_PCT = 78;

export function resolveTargetStatus(
  current: number,
  target: number,
  direction: TargetDirection = "lower-better",
): TargetStatus {
  if (direction === "higher-better") {
    return current >= target ? "on" : "off";
  }

  return current <= target ? "on" : "off";
}

/**
 * Fill is deliberately direction-agnostic: the marker sits at
 * TARGET_MARKER_PCT and represents the target value, so scaling by
 * `current / target` puts the fill head exactly on the marker when the two
 * are equal, whichever direction is better. Direction changes only the
 * pass/fail reading, which `resolveTargetStatus` owns.
 */
function getFillPercent(current: number, target: number) {
  if (target === 0) {
    return current === 0 ? 8 : 100;
  }

  return Math.min(100, Math.max(6, (current / target) * TARGET_MARKER_PCT));
}

export function TargetProgress(props: Readonly<TargetProgressProps>) {
  const {
    current,
    target,
    targetLabel,
    direction = "lower-better",
    compact = false,
    className = "",
  } = props;

  if (target == null) {
    return (
      <div
        className={[
          "flex w-full flex-col",
          compact ? "gap-1" : "gap-1.5",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            "relative w-full rounded-full bg-[rgba(136,146,163,0.18)]",
            compact ? "h-1.5" : "h-1.5",
          ].join(" ")}
        >
          <div
            className="bg-ehs-muted-text/35 absolute inset-y-0 left-0 w-[8%] rounded-full"
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Text
            as="span"
            className={[
              "text-ehs-muted-text font-medium",
              compact ? "text-[9.2px] leading-normal" : "text-[10.3px]",
            ].join(" ")}
          >
            No target configured
          </Text>
          <Text
            as="span"
            className={[
              "text-ehs-muted-text whitespace-nowrap",
              compact ? "text-[9.5px] leading-normal" : "text-xs",
            ].join(" ")}
          >
            {targetLabel ?? ""}
          </Text>
        </div>
      </div>
    );
  }

  const status = resolveTargetStatus(current, target, direction);
  const fillPercent = getFillPercent(current, target);
  const isOn = status === "on";

  return (
    <div
      className={[
        "flex w-full flex-col",
        compact ? "gap-1" : "gap-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "relative w-full rounded-full bg-[rgba(136,146,163,0.18)]",
          compact ? "h-1.5" : "h-1.5",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-y-0 left-0 rounded-full",
            isOn ? "bg-ehs-green" : "bg-ehs-red",
          ].join(" ")}
          style={{ width: `${fillPercent}%` }}
        />
        <div
          className={[
            "bg-ehs-slate absolute -top-0.5 -bottom-0.5 w-0.5 rounded-0.5",
          ].join(" ")}
          style={{ left: `${TARGET_MARKER_PCT}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="flex items-start justify-between gap-2">
        <span
          className={[
            "inline-flex items-center gap-0.75 font-bold",
            compact ? "text-[9.2px] leading-normal" : "text-[10.3px]",
            isOn ? "text-ehs-green" : "text-ehs-red",
          ].join(" ")}
        >
          <Icon
            icon={isOn ? "mdi:check-circle" : "mdi:trending-up"}
            className={compact ? "size-2.5" : "text-sm"}
            aria-hidden="true"
          />
          {isOn ? "On / under target" : "Off target"}
        </span>

        <Text
          as="span"
          className={[
            "text-ehs-muted-text py-px whitespace-nowrap",
            compact ? "text-[9.5px] leading-normal" : "text-xs",
          ].join(" ")}
        >
          {targetLabel ?? ""}
        </Text>
      </div>
    </div>
  );
}
