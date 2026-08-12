"use client";

import { useMemo } from "react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { useWalkTalkTopFindingsQuery } from "@/hooks/use-walk-talk-queries";
import { toWalkTalkTopFindings } from "@/lib/map-walk-talk";
import type {
  FindingTone,
  WalkTalkFinding,
} from "@/app/dashboard/walk-talk/walk-talk-data";

const toneColor: Record<FindingTone, string> = {
  primary: "#0891a6",
  muted: "#8892a3",
};

/** One category: label + count above a proportional bar. */
function FindingRow(
  props: Readonly<{ finding: WalkTalkFinding; max: number }>,
) {
  const { finding, max } = props;
  const percent = max > 0 ? (finding.count / max) * 100 : 0;

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <Text as="span" className="text4 text-ehs-darker min-w-0 truncate">
          {finding.label}
        </Text>
        <Text
          as="span"
          className="text7 text-ehs-muted-text shrink-0"
        >
          {finding.count}
        </Text>
      </div>

      <span
        className="h-2 w-full overflow-hidden rounded-full bg-[rgba(136,146,163,0.18)]"
        aria-hidden="true"
      >
        <span
          className="block h-full rounded-full"
          style={{
            width: `${String(percent)}%`,
            backgroundColor: toneColor[finding.tone],
          }}
        />
      </span>
    </li>
  );
}

export type WalkTalkTopFindingsCardProps = Readonly<{
  className?: string;
}>;

export function WalkTalkTopFindingsCard(props: WalkTalkTopFindingsCardProps) {
  const { className = "" } = props;
  const findingsQuery = useWalkTalkTopFindingsQuery();

  const findings = useMemo(
    () => toWalkTalkTopFindings(findingsQuery.data?.dataModel),
    [findingsQuery.data?.dataModel],
  );

  const max = findings.reduce(
    (highest, finding) => Math.max(highest, finding.count),
    0,
  );

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["min-w-0", className].filter(Boolean).join(" ")}
      incidentGlassCardClassName="gap-4"
    >
      <header className="flex flex-col gap-0.5">
        <Text as="h3" className="text3 text-ehs-darker">
          Top Findings
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          Top categories observed
        </Text>
      </header>

      {findingsQuery.isPending ? (
        <Text as="p" className="text8 text-ehs-muted-text">
          Loading…
        </Text>
      ) : findings.length === 0 ? (
        <Text as="p" className="text8 text-ehs-muted-text">
          No findings recorded.
        </Text>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {findings.map((finding) => (
            <FindingRow key={finding.label} finding={finding} max={max} />
          ))}
        </ul>
      )}
    </IncidentGlassCard>
  );
}
