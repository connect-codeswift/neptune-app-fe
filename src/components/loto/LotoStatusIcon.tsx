import { Icon } from "@iconify/react";
import type { LotoEquipmentStatus } from "@/app/dashboard/lockout-tagout/loto-data";

const statusIcon: Record<
  LotoEquipmentStatus,
  Readonly<{ icon: string; className: string }>
> = {
  Operational: {
    icon: "mdi:lock-open-variant-outline",
    className: "text-ehs-green",
  },
  "Locked Out": { icon: "mdi:lock", className: "text-ehs-red" },
  Maintenance: { icon: "mdi:cog", className: "text-ehs-yellow" },
};

export type LotoStatusIconProps = Readonly<{
  status: LotoEquipmentStatus;
  className?: string;
}>;

/**
 * Equipment status glyph: green unlocked lock for Operational, red lock for
 * Locked Out, yellow gear for Maintenance. The status name stays available to
 * screen readers and as a tooltip — the icon alone is not self-describing.
 */
export function LotoStatusIcon(props: LotoStatusIconProps) {
  const { status, className = "size-5" } = props;
  const config = statusIcon[status];

  return (
    <span title={status}>
      <Icon
        icon={config.icon}
        className={[className, config.className].join(" ")}
        aria-label={status}
        role="img"
      />
    </span>
  );
}
