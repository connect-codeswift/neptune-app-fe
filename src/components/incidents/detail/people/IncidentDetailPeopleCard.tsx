"use client";

import { Text } from "@/components/Text";
import type { ResponderMember } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";

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

const fieldInputClass = FIELD_INPUT_CLASS;

function responderBadgeClass(tone: ResponderMember["badgeTone"]): string {
  if (tone === "teal" || tone === "green" || tone === "blue") {
    return "bg-ehs-dark-blue-bg-light text-ehs-dark-blue";
  }
  return "bg-ehs-dark-bg/14 text-ehs-gray";
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
        className={isEditing ? "ring-1 ring-ehs-normal-blue/25" : ""}
      >
        <Text
          as="h3"
          className="text-ehs-dark-bg text-lg font-semibold"
        >
          Affected person
        </Text>

        {hasAffected ? (
          <>
            <div className="flex items-center gap-[14px]">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[14.4px] bg-ehs-dark-blue-bg-light text-base font-bold text-ehs-dark-blue">
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
                    <span className="truncate text-sm leading-normal text-ehs-gray">
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
                    <span className="text-base leading-normal font-bold text-ehs-dark-bg">
                      {affectedName}
                    </span>
                    <span className="truncate text-sm leading-normal text-ehs-gray">
                      {affectedRole}
                    </span>
                    <span className="text-sm leading-normal text-ehs-muted-text">
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
                <span className="shrink-0 rounded-full bg-ehs-dark-bg/14 px-[9px] pt-[2.5px] pb-[2.89px] text-sm leading-normal font-bold tracking-wide text-ehs-gray">
                  {affectedInjuryLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
              <div className="flex flex-col gap-[3px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[13px]">
                <span className="text-xs font-bold tracking-wide text-ehs-muted-text uppercase">
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
                  <span className="text-base leading-normal text-ehs-dark-bg">
                    {bodyPart}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-[3px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[13px]">
                <span className="text-xs font-bold tracking-wide text-ehs-muted-text uppercase">
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
                  <span className="text-base leading-normal text-ehs-dark-bg">
                    {treatment}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-[3px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[13px]">
                <span className="text-xs font-bold tracking-wide text-ehs-muted-text uppercase">
                  Days away
                </span>
                <span className="text-base leading-normal text-ehs-dark-bg">
                  {daysAway}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-sm text-ehs-muted-text">
            No affected person returned by the API.
          </div>
        )}
      </IncidentGlassCard>

      <IncidentGlassCard
        paddingClassName="p-[23px]"
        className={isEditing ? "ring-1 ring-ehs-normal-blue/25" : ""}
      >
        <div className="pb-[14px]">
          <Text
            as="h3"
            className="text-ehs-dark-bg text-lg font-semibold"
          >
            Responders & assignees
          </Text>
          <span className="text-sm leading-normal text-ehs-muted-text">
            {responders.length} people
          </span>
        </div>

        {responders.length === 0 ? (
          <div className="border-t border-[rgba(15,23,42,0.08)] py-6 text-center text-sm text-ehs-muted-text">
            No responders returned by the API.
          </div>
        ) : (
          responders.map((person, index) => (
            <div
              key={`${person.role}-${person.name}-${String(index)}`}
              className="flex items-center gap-3 border-t border-[rgba(15,23,42,0.08)] pt-[13px] pb-3"
            >
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[10.2px] bg-ehs-dark-blue-bg-light text-sm font-bold text-ehs-dark-blue">
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
                      className={`${fieldInputClass} mt-1 text-sm`}
                      aria-label="Role"
                    />
                  </>
                ) : (
                  <>
                    <span className="text-sm leading-normal font-bold text-ehs-dark-bg">
                      {person.name}
                    </span>
                    <span className="truncate text-sm leading-normal text-ehs-gray">
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
                  className={`${fieldInputClass} max-w-[140px] shrink-0 text-sm`}
                  aria-label="Employee ID or email"
                />
              ) : (
                <span className="shrink-0 text-sm leading-normal text-ehs-muted-text">
                  {person.empId}
                </span>
              )}
              <span
                className={[
                  "shrink-0 rounded-full px-[9px] pt-[2.5px] pb-[2.89px] text-sm leading-normal font-bold tracking-wide",
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
