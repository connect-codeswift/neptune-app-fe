import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { TargetProgress } from "@/components/incidents/dashboard/TargetProgress";
import type { IndicatorMetric } from "@/components/incidents/dashboard/incident-kpis-data";

export type IndicatorCardProps = Readonly<{
  metric: IndicatorMetric;
  className?: string;
}>;

const indicatorCardShellClass =
  "border-white/90 bg-[rgba(255,255,255,0.62)] backdrop-blur-2.5";

export function IndicatorCard(props: Readonly<IndicatorCardProps>) {
  const { metric, className = "" } = props;
  const titlePrimary = metric.titleLines?.[0] ?? metric.title;
  const titleSecondary = metric.titleLines?.[1];
  const { current, target, targetLabel, hasIndicator } = metric;
  const canRenderIndicator = hasIndicator;
  const isFootnoteOnly = !canRenderIndicator && Boolean(metric.footnote);

  return (
    <IncidentGlassCard
      paddingClassName={isFootnoteOnly ? "px-4.25 pt-4.25 pb-6.75" : "p-4.25"}
      className={[indicatorCardShellClass, className].filter(Boolean).join(" ")}
    >
      <div className="flex h-full flex-col gap-2">
        <div
          className={[
            "flex min-h-7.5 w-full items-start",
            metric.titleDot ? "gap-1.5" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {metric.titleDot ? (
            <span
              className="mt-1.25 size-1.75 shrink-0 rounded-[4px]"
              style={{ backgroundColor: metric.titleDot }}
              aria-hidden="true"
            />
          ) : null}

          <div className="min-w-0 pb-[15px]">
            <Text
              as="p"
              className="text-ehs-gray text-2.75 leading-[14.3px] font-bold tracking-[0.11px]"
            >
              {titlePrimary}
            </Text>
            {titleSecondary ? (
              <Text
                as="p"
                className="text-ehs-muted-text pt-px text-[11px] leading-normal"
              >
                {titleSecondary}
              </Text>
            ) : null}
          </div>
        </div>

        <Text
          as="p"
          className="text-ehs-dark-bg text-3xl leading-7.5 font-normal tracking-[-0.75px] tabular-nums"
        >
          {metric.value}
        </Text>

        <div className="mt-auto flex flex-col gap-1">
          {canRenderIndicator ? (
            <TargetProgress
              current={current ?? 0}
              target={target ?? null}
              targetLabel={targetLabel ?? null}
              direction={metric.direction}
              compact
            />
          ) : null}

          {metric.footnote ? (
            <Text
              as="p"
              className="text-ehs-muted-text py-px text-[10px] leading-normal"
            >
              {metric.footnote}
            </Text>
          ) : null}
        </div>
      </div>
    </IncidentGlassCard>
  );
}
