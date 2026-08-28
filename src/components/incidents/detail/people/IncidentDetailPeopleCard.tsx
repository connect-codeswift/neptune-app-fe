"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Text } from "@/components/Text";
import type { ResponderMember } from "@/components/incidents/detail/incident-detail-types";
import { isAffectedNamePlaceholder } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import { INITIAL_TREATMENT_OPTIONS } from "@/forms/incident-module/treatment";

export type { ResponderMember };

export type IncidentDetailPeopleCardProps = Readonly<{
  affectedName?: string;
  /**
   * Whether the incident records an affected person at all. Decided by the
   * mapper, which has the record; this was inferred here by comparing the name
   * against the placeholder the mapper had just supplied, so an incident with
   * injury details but no name rendered as though nobody was involved.
   */
  hasAffectedPerson?: boolean;
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
  onChangeDaysAway?: (value: string) => void;
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
  return "bg-ehs-surface-inverse/14 text-ehs-gray";
}

function editableDisplayValue(value: string): string {
  return value === "—" ? "" : value;
}

export function IncidentDetailPeopleCard(
  props: Readonly<IncidentDetailPeopleCardProps>,
) {
  const {
    affectedName = "",
    hasAffectedPerson = false,
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
    onChangeDaysAway,
    onChangeResponder,
    className = "",
  } = props;

  /**
   * The wizard writes this field from a fixed vocabulary (`first-aid-on-site`,
   * `emergency`, and so on) while this card offered a free text box, so the same
   * treatment could be stored three different ways and nothing downstream could group
   * it. A stored value that is not in the list — a custom option added in the wizard,
   * or free text typed here before this change — is kept as its own option so editing
   * an unrelated field cannot silently discard it.
   */
  const treatmentSelectValue = editableDisplayValue(treatment);
  const treatmentOptions = (() => {
    const base = INITIAL_TREATMENT_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
    }));

    const known = new Set(base.map((option) => option.value.toLowerCase()));
    const current = treatmentSelectValue.trim();

    return current && !known.has(current.toLowerCase())
      ? [...base, { value: current, label: current }]
      : base;
  })();

  // A real name still counts on its own, so a caller that predates the flag
  // does not lose the card.
  const hasRecordedName =
    Boolean(affectedName.trim()) && !isAffectedNamePlaceholder(affectedName);
  const hasAffected = isEditing || hasAffectedPerson || hasRecordedName;

  return (
    <div
      className={["flex flex-col gap-3.5", className].filter(Boolean).join(" ")}
    >
      <IncidentGlassCard
        paddingClassName="p-5.75"
        incidentGlassCardClassName="gap-3.5"
        className={isEditing ? "ring-ehs-normal-blue/25 ring-1" : ""}
      >
        <Text as="h3" className="text-ehs-dark-bg text3">
          Affected person
        </Text>

        {hasAffected ? (
          <>
            <div className="flex items-center gap-3.5">
              <div className="bg-ehs-dark-blue-bg-light text-ehs-dark-blue text5 flex size-12 shrink-0 items-center justify-center rounded-[14px]">
                {affectedInitials}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editableDisplayValue(
                        hasRecordedName ? affectedName : "",
                      )}
                      onChange={(event) =>
                        onChangeAffectedName?.(event.target.value)
                      }
                      placeholder="Affected person name"
                      className={fieldInputClass}
                      aria-label="Affected person name"
                    />
                    <span className="text-ehs-gray text4 truncate leading-normal">
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
                    <span className="text-ehs-gray text4 truncate leading-normal">
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
                  className={`${fieldInputClass} max-w-35 shrink-0`}
                  aria-label="Injury level"
                />
              ) : (
                <span className="bg-ehs-surface-inverse/14 text-ehs-gray text4 shrink-0 rounded-full px-2.25 pt-[3px] pb-[3px] leading-normal font-bold tracking-wide">
                  {affectedInjuryLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
              <div className="rounded-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 flex flex-col gap-0.75 border p-3.25">
                <span className="text-ehs-muted-text text6">Body part</span>
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
              <div className="rounded-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 flex flex-col gap-0.75 border p-3.25">
                <span className="text-ehs-muted-text text6">
                  Initial treatment
                </span>
                {isEditing ? (
                  <select
                    value={treatmentSelectValue}
                    onChange={(event) =>
                      onChangeTreatment?.(event.target.value)
                    }
                    className={fieldInputClass}
                    aria-label="Initial treatment"
                  >
                    {treatmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-ehs-dark-bg text4 leading-normal">
                    {treatment}
                  </span>
                )}
              </div>
              <div className="rounded-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 flex flex-col gap-0.75 border p-3.25">
                <span className="text-ehs-muted-text text6">Days away</span>
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    // Empty is a real state, not zero: it means nobody has recorded a
                    // figure yet, which the API stores as null and the card shows as a dash.
                    value={daysAway === "—" ? "" : String(daysAway)}
                    onChange={(event) => onChangeDaysAway?.(event.target.value)}
                    className={fieldInputClass}
                    aria-label="Days away from work"
                  />
                ) : (
                  <span className="text-ehs-dark-bg text4 leading-normal">
                    {daysAway}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-ehs-muted-text text4 py-6 text-center">
            No affected person returned by the API.
          </div>
        )}
      </IncidentGlassCard>

      <IncidentGlassCard
        paddingClassName="p-5.75"
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
          <EmptyState
            variant="plain"
            icon="mdi:account-group-outline"
            title="No responders"
            message="People who responded to this incident appear here."
            className="border-ehs-border-ink/8 border-t"
          />
        ) : (
          responders.map((person, index) => (
            <div
              // Index, not the person's fields: `name` is edited in place here,
              // so keying on it remounted the row and dropped the caret on
              // every keystroke. ResponderMember carries no stable id, and the
              // list is not reordered or filtered while editing.
              key={index}
              className="border-ehs-border-ink/8 flex items-center gap-3 border-t pt-3.25 pb-3"
            >
              <div className="bg-ehs-dark-blue-bg-light text-ehs-dark-blue text5 rounded-2.5 flex size-8.5 shrink-0 items-center justify-center">
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
                      className={`${fieldInputClass} text4 mt-1`}
                      aria-label="Role"
                    />
                  </>
                ) : (
                  <>
                    <span className="text-ehs-dark-bg text4 leading-normal font-bold">
                      {person.name}
                    </span>
                    <span className="text-ehs-gray text4 truncate leading-normal">
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
                  className={`${fieldInputClass} text4 max-w-35 shrink-0`}
                  aria-label="Employee ID or email"
                />
              ) : (
                <span className="text-ehs-muted-text text4 shrink-0 leading-normal">
                  {person.empId}
                </span>
              )}
              <span
                className={[
                  "text4 shrink-0 rounded-full px-2.25 pt-[3px] pb-[3px] leading-normal font-bold tracking-wide",
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
