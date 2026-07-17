import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { RECORDABLES_BY_SITE } from "@/components/incidents/dashboard/incident-kpis-data";

export type RecordablesBySiteCardProps = Readonly<{
  className?: string;
}>;

export function RecordablesBySiteCard(
  props: Readonly<RecordablesBySiteCardProps>,
) {
  const { className = "" } = props;
  const maxCount = Math.max(...RECORDABLES_BY_SITE.map((item) => item.count), 1);

  return (
    <IncidentGlassCard
      paddingClassName="px-[23px] pt-[23px] pb-6"
      className={["min-h-[326px]", className].filter(Boolean).join(" ")}
    >
      <div className="mb-[14px] flex flex-col gap-0.5">
        <Text
          as="h3"
          className="text-ehs-darker text-[14px] font-bold tracking-[-0.14px]"
        >
          Recordables by site
        </Text>
        <Text as="p" className="text-ehs-muted-text text-[11px]">
          Year to date
        </Text>
      </div>

      <div className="flex flex-col gap-3">
        {RECORDABLES_BY_SITE.map((item) => {
          const widthPercent = (item.count / maxCount) * 100;

          return (
            <div key={item.site} className="flex flex-col gap-[5px]">
              <div className="flex items-center justify-between gap-2">
                <Text as="span" className="text-[#2a3446] text-xs">
                  {item.site}
                </Text>
                <Text as="span" className="text-ehs-gray text-[11px] tabular-nums">
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
        })}
      </div>
    </IncidentGlassCard>
  );
}
