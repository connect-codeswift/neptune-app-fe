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

function getFillPercent(
  current: number,
  target: number,
  direction: TargetDirection,
) {
  if (target === 0) {
    return current === 0 ? 8 : 100;
  }

  const ratio = current / target;

  if (direction === "higher-better") {
    return Math.min(100, Math.max(6, ratio * TARGET_MARKER_PCT));
  }

  return Math.min(100, Math.max(6, ratio * TARGET_MARKER_PCT));
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
        className={["flex w-full flex-col gap-1.5", className]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="bg-ehs-muted-text/20 relative h-1.5 w-full rounded-full">
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
              compact ? "text-xs" : "text-[10.3px]",
            ].join(" ")}
          >
            No target configured
          </Text>
          <Text
            as="span"
            className={[
              "text-ehs-muted-text whitespace-nowrap",
              compact ? "text-xs" : "text-xs",
            ].join(" ")}
          >
            {targetLabel ?? ""}
          </Text>
        </div>
      </div>
    );
  }

  const status = resolveTargetStatus(current, target, direction);
  const fillPercent = getFillPercent(current, target, direction);
  const isOn = status === "on";

  return (
    <div
      className={["flex w-full flex-col gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="bg-ehs-muted-text/20 relative h-1.5 w-full rounded-full">
        <div
          className={[
            "absolute inset-y-0 left-0 rounded-full",
            isOn ? "bg-ehs-green" : "bg-ehs-red",
          ].join(" ")}
          style={{ width: `${fillPercent}%` }}
        />
        <div
          className="bg-ehs-darker absolute top-[-2px] bottom-[-2px] w-0.5 rounded-[2px]"
          style={{ left: `${TARGET_MARKER_PCT}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={[
            "inline-flex items-center gap-0.5 font-bold",
            compact ? "text-xs" : "text-[10.3px]",
            isOn ? "text-ehs-green" : "text-ehs-red",
          ].join(" ")}
        >
          <Icon
            icon={isOn ? "mdi:check-circle" : "mdi:trending-up"}
            className={compact ? "text-xs" : "text-sm"}
            aria-hidden="true"
          />
          {isOn ? "On / under target" : "Off target"}
        </span>

        <Text
          as="p"
          className={[
            "text-ehs-muted-text whitespace-nowrap",
            compact ? "text-xs" : "text-xs",
          ].join(" ")}
        >
          {targetLabel ?? ""}
        </Text>
      </div>
    </div>
  );
}
