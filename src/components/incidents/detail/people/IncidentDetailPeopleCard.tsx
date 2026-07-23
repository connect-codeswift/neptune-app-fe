"use client";

import { Text } from "@/components/Text";
import type { ResponderMember } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { ResponderMember };

export type IncidentDetailPeopleCardProps = Readonly<{
  affectedName?: string;
  affectedRole?: string;
  affectedEmpId?: string;
  affectedInitials?: string;
  affectedInjuryLabel?: string;
  bodyPart?: string;
  treatment?: string;
  daysAway?: string | number;
  responders?: readonly ResponderMember[];
  isEditing?: boolean;
  onChangeAffectedName?: (value: string) => void;
  onChangeAffectedEmpId?: (value: string) => void;
  onChangeAffectedInjuryLabel?: (value: string) => void;
  onChangeBodyPart?: (value: string) => void;
  onChangeTreatment?: (value: string) => void;
  onChangeResponder?: (
    index: number,
    patch: Partial<Pick<ResponderMember, "name" | "role" | "empId">>,
  ) => void;
  className?: string;
}>;

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white px-2.5 py-1.5 text-[13px] text-[#0b1320] outline-none transition focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20";

function responderBadgeClass(tone: ResponderMember["badgeTone"]): string {
  if (tone === "teal" || tone === "green" || tone === "blue") {
    return "bg-[rgba(8,145,166,0.18)] text-[#056e7e]";
  }
  return "bg-[rgba(11,19,32,0.14)] text-[#566072]";
}

function editableDisplayValue(value: string): string {
  return value === "—" ? "" : value;
}

export function IncidentDetailPeopleCard(
  props: Readonly<IncidentDetailPeopleCardProps>,
) {
  const {
    affectedName = "",
    affectedRole = "Affected person",
    affectedEmpId = "—",
    affectedInitials = "—",
    affectedInjuryLabel = "—",
    bodyPart = "—",
    treatment = "None required",
    daysAway = 0,
    responders = [],
    isEditing = false,
    onChangeAffectedName,
    onChangeAffectedEmpId,
    onChangeAffectedInjuryLabel,
    onChangeBodyPart,
    onChangeTreatment,
    onChangeResponder,
    className = "",
  } = props;

  const hasAffected =
    isEditing ||
    (Boolean(affectedName.trim()) &&
      affectedName !== "No affected person logged");

  return (
    <div
      className={["flex flex-col gap-[14px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <IncidentGlassCard
        paddingClassName="p-[23px]"
        incidentGlassCardClassName="gap-[14px]"
        className={isEditing ? "ring-1 ring-[#0891a6]/25" : ""}
      >
        <Text
          as="h3"
          className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
        >
          Affected person
        </Text>

        {hasAffected ? (
          <>
            <div className="flex items-center gap-[14px]">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[14.4px] bg-[rgba(8,145,166,0.18)] text-[16px] font-bold text-[#056e7e]">
                {affectedInitials}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editableDisplayValue(
                        affectedName === "No affected person logged"
                          ? ""
                          : affectedName,
                      )}
                      onChange={(event) =>
                        onChangeAffectedName?.(event.target.value)
                      }
                      placeholder="Affected person name"
                      className={fieldInputClass}
                      aria-label="Affected person name"
                    />
                    <span className="truncate text-[12px] leading-normal text-[#566072]">
                      {affectedRole}
                    </span>
                    <input
                      type="text"
                      value={editableDisplayValue(affectedEmpId)}
                      onChange={(event) =>
                        onChangeAffectedEmpId?.(event.target.value)
                      }
                      placeholder="Employee / person ID"
                      className={fieldInputClass}
                      aria-label="Employee ID"
                    />
                  </>
                ) : (
                  <>
                    <span className="text-[15px] leading-normal font-bold text-[#0b1320]">
                      {affectedName}
                    </span>
                    <span className="truncate text-[12px] leading-normal text-[#566072]">
                      {affectedRole}
                    </span>
                    <span className="text-[11px] leading-normal text-[#8892a3]">
                      {affectedEmpId}
                    </span>
                  </>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editableDisplayValue(affectedInjuryLabel)}
                  onChange={(event) =>
                    onChangeAffectedInjuryLabel?.(event.target.value)
                  }
                  placeholder="Injury"
                  className={`${fieldInputClass} max-w-[140px] shrink-0`}
                  aria-label="Injury level"
                />
              ) : (
                <span className="shrink-0 rounded-full bg-[rgba(11,19,32,0.14)] px-[9px] pt-[2.5px] pb-[2.89px] text-[11px] leading-[15.4px] font-bold tracking-[0.22px] text-[#566072]">
                  {affectedInjuryLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
              <div className="flex flex-col gap-[3px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[13px]">
                <span className="text-[10px] font-bold tracking-[0.8px] text-[#8892a3] uppercase">
                  Body part
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableDisplayValue(bodyPart)}
                    onChange={(event) => onChangeBodyPart?.(event.target.value)}
                    className={fieldInputClass}
                    aria-label="Body part"
                  />
                ) : (
                  <span className="text-[15px] leading-normal text-[#0b1320]">
                    {bodyPart}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-[3px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[13px]">
                <span className="text-[10px] font-bold tracking-[0.8px] text-[#8892a3] uppercase">
                  Treatment
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableDisplayValue(treatment)}
                    onChange={(event) =>
                      onChangeTreatment?.(event.target.value)
                    }
                    className={fieldInputClass}
                    aria-label="Treatment"
                  />
                ) : (
                  <span className="text-[15px] leading-normal text-[#0b1320]">
                    {treatment}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-[3px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[13px]">
                <span className="text-[10px] font-bold tracking-[0.8px] text-[#8892a3] uppercase">
                  Days away
                </span>
                <span className="text-[15px] leading-normal text-[#0b1320]">
                  {daysAway}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-[12px] text-[#8892a3]">
            No affected person returned by the API.
          </div>
        )}
      </IncidentGlassCard>

      <IncidentGlassCard
        paddingClassName="p-[23px]"
        className={isEditing ? "ring-1 ring-[#0891a6]/25" : ""}
      >
        <div className="pb-[14px]">
          <Text
            as="h3"
            className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
          >
            Responders & assignees
          </Text>
          <span className="text-[11px] leading-normal text-[#8892a3]">
            {responders.length} people
          </span>
        </div>

        {responders.length === 0 ? (
          <div className="border-t border-[rgba(15,23,42,0.08)] py-6 text-center text-[12px] text-[#8892a3]">
            No responders returned by the API.
          </div>
        ) : (
          responders.map((person, index) => (
            <div
              key={`${person.role}-${person.name}-${String(index)}`}
              className="flex items-center gap-3 border-t border-[rgba(15,23,42,0.08)] pt-[13px] pb-3"
            >
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[10.2px] bg-[rgba(8,145,166,0.18)] text-[11.6px] font-bold text-[#056e7e]">
                {person.initials}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-px">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={person.name}
                      onChange={(event) =>
                        onChangeResponder?.(index, {
                          name: event.target.value,
                        })
                      }
                      className={fieldInputClass}
                      aria-label={`${person.role} name`}
                    />
                    <input
                      type="text"
                      value={person.role}
                      onChange={(event) =>
                        onChangeResponder?.(index, {
                          role: event.target.value,
                        })
                      }
                      className={`${fieldInputClass} mt-1 text-[11px]`}
                      aria-label="Role"
                    />
                  </>
                ) : (
                  <>
                    <span className="text-[13px] leading-normal font-bold text-[#0b1320]">
                      {person.name}
                    </span>
                    <span className="truncate text-[11px] leading-normal text-[#566072]">
                      {person.role}
                    </span>
                  </>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editableDisplayValue(person.empId)}
                  onChange={(event) =>
                    onChangeResponder?.(index, { empId: event.target.value })
                  }
                  placeholder="ID / email"
                  className={`${fieldInputClass} max-w-[140px] shrink-0 text-[11px]`}
                  aria-label="Employee ID or email"
                />
              ) : (
                <span className="shrink-0 text-[11px] leading-normal text-[#8892a3]">
                  {person.empId}
                </span>
              )}
              <span
                className={[
                  "shrink-0 rounded-full px-[9px] pt-[2.5px] pb-[2.89px] text-[11px] leading-[15.4px] font-bold tracking-[0.22px]",
                  responderBadgeClass(person.badgeTone),
                ].join(" ")}
              >
                {person.badgeLabel}
              </span>
            </div>
          ))
        )}
      </IncidentGlassCard>
    </div>
  );
}
