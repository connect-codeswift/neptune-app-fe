import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { TargetProgress } from "@/components/incidents/dashboard/TargetProgress";
import type { IndicatorMetric } from "@/components/incidents/dashboard/incident-kpis-data";

export type IndicatorCardProps = Readonly<{
  metric: IndicatorMetric;
  className?: string;
}>;

export function IndicatorCard(props: Readonly<IndicatorCardProps>) {
  const { metric, className = "" } = props;
  const titlePrimary = metric.titleLines?.[0] ?? metric.title;
  const titleSecondary = metric.titleLines?.[1];
  const { current, target, targetLabel, hasIndicator } = metric;
  const canRenderIndicator =
    hasIndicator &&
    current !== undefined &&
    target !== undefined &&
    targetLabel !== undefined;

  return (
    <IncidentGlassCard
      paddingClassName="px-5 py-5"
      className={["min-h-[168px]", className].filter(Boolean).join(" ")}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex min-h-[34px] items-start gap-[6px]">
          {metric.titleDot ? (
            <span
              className="mt-[5px] size-[7px] shrink-0 rounded-[2px]"
              style={{ backgroundColor: metric.titleDot }}
              aria-hidden="true"
            />
          ) : null}

          <div className="min-w-0">
            <Text
              as="p"
              className="text-ehs-darker text-[12px] leading-[15px] font-semibold"
            >
              {titlePrimary}
            </Text>
            {titleSecondary ? (
              <Text as="p" className="text-ehs-muted-text text-[11px]">
                {titleSecondary}
              </Text>
            ) : null}
          </div>
        </div>

        <Text
          as="p"
          className="text-ehs-darker text-[32px] leading-[32px] font-medium tracking-[-0.6px] tabular-nums"
        >
          {metric.value}
        </Text>

        <div className="mt-auto flex flex-col gap-2">
          {canRenderIndicator ? (
            <TargetProgress
              current={current}
              target={target}
              targetLabel={targetLabel}
              direction={metric.direction}
              compact
            />
          ) : null}

          {metric.footnote ? (
            <Text as="p" className="text-ehs-muted-text text-[11px]">
              {metric.footnote}
            </Text>
          ) : null}
        </div>
      </div>
    </IncidentGlassCard>
  );
}
