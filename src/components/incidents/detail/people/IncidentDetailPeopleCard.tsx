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
    daysAway = "—",
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
      className={["flex flex-col gap-3.5", className].filter(Boolean).join(" ")}
    >
      <IncidentGlassCard
        paddingClassName="p-[23px]"
        incidentGlassCardClassName="gap-3.5"
        className={isEditing ? "ring-ehs-normal-blue/25 ring-1" : ""}
      >
        <Text as="h3" className="text-ehs-dark-bg text3">
          Affected person
        </Text>

        {hasAffected ? (
          <>
            <div className="flex items-center gap-3.5">
              <div className="bg-ehs-dark-blue-bg-light text-ehs-dark-blue flex size-12 shrink-0 items-center justify-center rounded-[14.4px] text5">
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
                    <span className="text-ehs-gray truncate text4 leading-normal">
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
                    <span className="text-ehs-dark-bg text4 leading-normal font-bold">
                      {affectedName}
                    </span>
                    <span className="text-ehs-gray truncate text4 leading-normal">
                      {affectedRole}
                    </span>
                    <span className="text-ehs-muted-text text4 leading-normal">
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
                <span className="bg-ehs-dark-bg/14 text-ehs-gray shrink-0 rounded-full px-[9px] pt-[2.5px] pb-[2.89px] text4 leading-normal font-bold tracking-wide">
                  {affectedInjuryLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
              <div className="flex flex-col gap-[3px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[13px]">
                <span className="text-ehs-muted-text text6">
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
                  <span className="text-ehs-dark-bg text4 leading-normal">
                    {bodyPart}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-[3px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[13px]">
                <span className="text-ehs-muted-text text6">
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
                  <span className="text-ehs-dark-bg text4 leading-normal">
                    {treatment}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-[3px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[13px]">
                <span className="text-ehs-muted-text text6">
                  Days away
                </span>
                <span className="text-ehs-dark-bg text4 leading-normal">
                  {daysAway}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-ehs-muted-text py-6 text-center text4">
            No affected person returned by the API.
          </div>
        )}
      </IncidentGlassCard>

      <IncidentGlassCard
        paddingClassName="p-[23px]"
        className={isEditing ? "ring-ehs-normal-blue/25 ring-1" : ""}
      >
        <div className="pb-3.5">
          <Text as="h3" className="text-ehs-dark-bg text3">
            Responders & assignees
          </Text>
          <span className="text-ehs-muted-text text4 leading-normal">
            {responders.length} people
          </span>
        </div>

        {responders.length === 0 ? (
          <div className="text-ehs-muted-text border-t border-[rgba(15,23,42,0.08)] py-6 text-center text4">
            No responders returned by the API.
          </div>
        ) : (
          responders.map((person, index) => (
            <div
              // Index, not the person's fields: `name` is edited in place here,
              // so keying on it remounted the row and dropped the caret on
              // every keystroke. ResponderMember carries no stable id, and the
              // list is not reordered or filtered while editing.
              key={index}
              className="flex items-center gap-3 border-t border-[rgba(15,23,42,0.08)] pt-[13px] pb-3"
            >
              <div className="bg-ehs-dark-blue-bg-light text-ehs-dark-blue flex size-[34px] shrink-0 items-center justify-center rounded-[10.2px] text5">
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
                      className={`${fieldInputClass} mt-1 text4`}
                      aria-label="Role"
                    />
                  </>
                ) : (
                  <>
                    <span className="text-ehs-dark-bg text4 leading-normal font-bold">
                      {person.name}
                    </span>
                    <span className="text-ehs-gray truncate text4 leading-normal">
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
                  className={`${fieldInputClass} max-w-[140px] shrink-0 text4`}
                  aria-label="Employee ID or email"
                />
              ) : (
                <span className="text-ehs-muted-text shrink-0 text4 leading-normal">
                  {person.empId}
                </span>
              )}
              <span
                className={[
                  "shrink-0 rounded-full px-[9px] pt-[2.5px] pb-[2.89px] text4 leading-normal font-bold tracking-wide",
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
