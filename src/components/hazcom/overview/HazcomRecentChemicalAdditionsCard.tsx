import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import {
  HAZCOM_CHEMICALS,
  HazcomBadge,
  HazcomGlassCard,
  type HazcomBadgeTone,
  type HazcomSignalWord,
} from "@/components/hazcom/shared";

const RECENT_ADDITIONS_LIMIT = 4;

/** Most recently added chemicals first, by `addedOn` descending. */
const RECENT_CHEMICALS = [...HAZCOM_CHEMICALS]
  .sort((a, b) => (a.addedOn < b.addedOn ? 1 : a.addedOn > b.addedOn ? -1 : 0))
  .slice(0, RECENT_ADDITIONS_LIMIT);

function signalWordTone(signalWord: HazcomSignalWord): HazcomBadgeTone {
  return signalWord === "Danger" ? "danger" : "warn";
}

export type HazcomRecentChemicalAdditionsCardProps = Readonly<{
  className?: string;
}>;

export function HazcomRecentChemicalAdditionsCard(
  props: Readonly<HazcomRecentChemicalAdditionsCardProps>,
) {
  const { className = "" } = props;

  return (
    <HazcomGlassCard
      paddingClassName="p-5"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" className="text-ehs-darker text-base font-bold">
          Recent Chemical Additions
        </Text>
        <Link
          href="/dashboard/hazcom/chemicals"
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover inline-flex items-center gap-0.5 text-xs font-semibold"
        >
          View all
          <Icon icon="mdi:arrow-right" className="text-sm" aria-hidden="true" />
        </Link>
      </div>

      <div className="divide-ehs-border mt-4 flex flex-col divide-y">
        {RECENT_CHEMICALS.map((chemical) => (
          <div
            key={chemical.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="bg-ehs-dark-bg/6 text-ehs-gray flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Icon
                icon="mdi:flask-outline"
                className="text-base"
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0 flex-1">
              <Text
                as="p"
                className="text-ehs-darker truncate text-sm font-semibold"
              >
                {chemical.name}
              </Text>
              <Text as="p" className="text-ehs-muted-text truncate text-xs">
                {`${chemical.location} · CAS ${chemical.casNumber}`}
              </Text>
            </div>
            <HazcomBadge
              label={chemical.signalWord.toUpperCase()}
              tone={signalWordTone(chemical.signalWord)}
              className="shrink-0"
            />
          </div>
        ))}
      </div>
    </HazcomGlassCard>
  );
}
