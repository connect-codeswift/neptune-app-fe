"use client";

import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import type { ChecklistTally } from "./checklist-state";

type Bucket = Readonly<{
  key: keyof Omit<ChecklistTally, "total">;
  label: string;
  dotClassName: string;
}>;

const BUCKETS: readonly Bucket[] = [
  { key: "pass", label: "Pass", dotClassName: "bg-ehs-green" },
  { key: "action", label: "Action", dotClassName: "bg-ehs-orange" },
  { key: "critical", label: "Critical", dotClassName: "bg-ehs-red" },
  { key: "pending", label: "Pending", dotClassName: "bg-ehs-gray/40" },
];

export type ChecklistTallyProps = Readonly<{ tally: ChecklistTally }>;

/**
 * The same four counts the detail summary reports, shown while the audit is
 * still being filled in — so the auditor can see what they are about to submit
 * without leaving the checklist.
 */
export function ChecklistTallyCard(props: ChecklistTallyProps) {
  const { tally } = props;
  const answered = tally.total - tally.pending;
  const completion = tally.total > 0 ? (answered / tally.total) * 100 : 0;

  return (
    <IncidentGlassCard paddingClassName="px-5 py-4" className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text4 text-ehs-gray">
          Items:{" "}
          <span className="text5 text-ehs-darker tabular-nums">
            {`${String(answered)}/${String(tally.total)} answered`}
          </span>
        </p>

        <ul className="flex flex-wrap items-center gap-4">
          {BUCKETS.map((bucket) => (
            <li key={bucket.key} className="flex items-center gap-1.5">
              <span
                className={`size-2 shrink-0 rounded-full ${bucket.dotClassName}`}
                aria-hidden
              />
              <Text as="span" className="text8 text-ehs-gray">
                {bucket.label}
              </Text>
              <Text as="span" className="text8 text-ehs-darker tabular-nums">
                {String(tally[bucket.key])}
              </Text>
            </li>
          ))}
        </ul>

        <span
          className="bg-ehs-form-classes-bg h-1.5 w-48 shrink-0 overflow-hidden rounded-full"
          aria-hidden
        >
          <span
            className="bg-ehs-surface-inverse block h-full rounded-full transition-[width]"
            style={{ width: `${String(completion)}%` }}
          />
        </span>
      </div>
    </IncidentGlassCard>
  );
}
