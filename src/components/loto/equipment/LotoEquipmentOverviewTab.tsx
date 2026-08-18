"use client";

import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { LotoEquipmentDetail } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import { LotoStatusIcon } from "../LotoStatusIcon";

function MetaCell(props: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text6 text-ehs-muted-text">{props.label}</span>
      <span className="text4 text-ehs-darker">{props.value}</span>
    </div>
  );
}

export type LotoEquipmentOverviewTabProps = Readonly<{
  detail: LotoEquipmentDetail;
  onManagePersonnel: () => void;
  onViewAllHistory: () => void;
}>;

/** Overview tab — Figma 6888:50991. */
export function LotoEquipmentOverviewTab(props: LotoEquipmentOverviewTabProps) {
  const { detail, onManagePersonnel, onViewAllHistory } = props;

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-4">
        <IncidentGlassCard paddingClassName="p-5" className="min-w-0">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="text3 text-ehs-darker">Equipment Details</h2>
            <span className="text5 inline-flex items-center gap-1.5 rounded-full bg-[rgba(15,23,42,0.06)] px-2.5 py-0.5">
              <LotoStatusIcon status={detail.status} className="size-3.5" />
              {detail.status}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetaCell label="Equipment ID" value={detail.equipmentCode} />
            <MetaCell label="Last Inspection" value={detail.lastInspection} />
            <MetaCell label="Location" value={detail.location} />
            <MetaCell
              label="Auth. Personnel"
              value={`${String(detail.authorizedPersonnel.length)} personnel`}
            />
          </div>
        </IncidentGlassCard>

        <IncidentGlassCard paddingClassName="p-5" className="min-w-0">
          <h2 className="text3 text-ehs-darker mb-3">
            Energy Sources to Be Isolated
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {detail.energySources.map((source, index) => (
              <div
                key={source}
                className="rounded-3 border border-black/10 px-4 py-3.5"
              >
                <p className="text4 text-ehs-darker font-semibold">{source}</p>
                <p className="text8 mt-0.5 text-[#8892a3]">
                  {`Isolation Point #${String(index + 1)}`}
                </p>
              </div>
            ))}
          </div>
        </IncidentGlassCard>

        <IncidentGlassCard paddingClassName="p-5" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text3 text-ehs-darker">Authorized Personnel</h2>
            <button
              type="button"
              onClick={onManagePersonnel}
              className="text4 cursor-pointer font-semibold text-[#0891a6] hover:underline"
            >
              Manage →
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {detail.authorizedPersonnel.map((person) => (
              <div
                key={person.id}
                className="rounded-2.5 inline-flex items-center gap-2 border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.7)] px-2.5 py-1.5"
              >
                <span className="text7 flex size-7 items-center justify-center rounded-lg bg-[rgba(8,145,166,0.12)] font-bold text-[#0891a6]">
                  {person.initials}
                </span>
                <span className="text4 text-ehs-darker font-semibold">
                  {person.name}
                </span>
              </div>
            ))}
          </div>
        </IncidentGlassCard>
      </div>

      <IncidentGlassCard paddingClassName="p-4.5" className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text3 text-ehs-darker">Recent Lockouts</h2>
          <button
            type="button"
            onClick={onViewAllHistory}
            className="text4 cursor-pointer font-semibold text-[#0891a6] hover:underline"
          >
            All →
          </button>
        </div>
        <ul className="flex flex-col">
          {detail.recentLockouts.map((lockout, index) => (
            <li
              key={lockout.id}
              className={[
                "py-3",
                index < detail.recentLockouts.length - 1
                  ? "border-b border-[rgba(15,23,42,0.08)]"
                  : "",
              ].join(" ")}
            >
              <p className="text4 text-ehs-darker font-semibold">
                {lockout.purpose}
              </p>
              <p className="text4 mt-1 text-[#8892a3]">
                {`${lockout.operator} · ${lockout.date} · ${lockout.duration}`}
              </p>
            </li>
          ))}
        </ul>
      </IncidentGlassCard>
    </div>
  );
}
