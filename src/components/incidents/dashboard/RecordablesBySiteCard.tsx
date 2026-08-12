import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { SiteRecordable } from "@/components/incidents/dashboard/incident-kpis-data";

export type RecordablesBySiteCardProps = Readonly<{
  sites: readonly SiteRecordable[];
  className?: string;
}>;

export function RecordablesBySiteCard(
  props: Readonly<RecordablesBySiteCardProps>,
) {
  const { sites, className = "" } = props;
  const maxCount = Math.max(...sites.map((item) => item.count), 1);

  return (
    <IncidentGlassCard
      paddingClassName="px-4 pt-4 pb-5 md:px-5.75 md:pt-5.75 md:pb-6"
      className={[
        "flex max-h-72 flex-col overflow-hidden md:h-100 md:max-h-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-3.5 flex shrink-0 flex-col gap-0.5">
        <Text
          as="h3"
          className="text-ehs-darker text-sm font-bold tracking-[-0.14px]"
        >
          Recordables by site
        </Text>
        <Text as="p" className="text-ehs-muted-text text-sm">
          Year to date
        </Text>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-3">
        {sites.length === 0 ? (
          <Text as="p" className="text-ehs-muted-text text-sm">
            No recordables by site returned.
          </Text>
        ) : (
          sites.map((item) => {
            const widthPercent = (item.count / maxCount) * 100;

            return (
              <div key={item.site} className="flex flex-col gap-1.25">
                <div className="flex items-center justify-between gap-2">
                  <Text as="span" className="text-ehs-slate text-xs">
                    {item.site}
                  </Text>
                  <Text
                    as="span"
                    className="text-ehs-gray text-sm tabular-nums"
                  >
                    {String(item.count)}
                  </Text>
                </div>
                <div className="bg-ehs-muted-text/15 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-ehs-normal-blue h-full rounded-full"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </IncidentGlassCard>
  );
}
