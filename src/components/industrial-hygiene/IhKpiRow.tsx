"use client";

import { MetricCard } from "@/components/ui/MetricCard";
import { IH_DASHBOARD_KPIS } from "@/components/industrial-hygiene/ih-dashboard-data";

export type IhKpiRowProps = Readonly<{
  className?: string;
}>;

/** KPI row — Figma 5298:22257. */
export function IhKpiRow(props: Readonly<IhKpiRowProps>) {
  const { className = "" } = props;

  return (
    <div
      className={[
        "grid min-w-0 gap-3.5 sm:grid-cols-2 xl:grid-cols-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {IH_DASHBOARD_KPIS.map((kpi) => (
        <MetricCard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          description={kpi.description}
        />
      ))}
    </div>
  );
}
