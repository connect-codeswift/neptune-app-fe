"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  EMPTY_PEOPLE_PHOTO_INDEX,
  lookupPeoplePhoto,
  type PeoplePhotoIndex,
} from "@/components/incidents/detail/people/people-photos";
import type { ResponderMember } from "@/components/incidents/detail/incident-detail-types";
import { isAffectedNamePlaceholder } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";

export type { ResponderMember };

export type IncidentDetailPeopleCardProps = Readonly<{
  affectedName?: string;
  /** The affected person's profile photo, when their user record carries one. */
  affectedProfileUrl?: string | null;
  /** Roster photos for the responders, keyed by name. */
  peoplePhotos?: PeoplePhotoIndex;
  /**
   * Whether the incident records an affected person at all. Decided by the
   * mapper, which has the record; this was inferred here by comparing the name
   * against the placeholder the mapper had just supplied, so an incident with
   * injury details but no name rendered as though nobody was involved.
   */
  hasAffectedPerson?: boolean;
  affectedRole?: string;
  affectedEmpId?: string;
  affectedInjuryLabel?: string;
  bodyPart?: string;
  treatment?: string;
  daysAway?: string | number;
  responders?: readonly ResponderMember[];
  isEditing?: boolean;
  onChangeBodyPart?: (value: string) => void;
  onChangeTreatment?: (value: string) => void;
  onChangeDaysAway?: (value: string) => void;
  bodyPartError?: string | null;
  treatmentError?: string | null;
  daysAwayError?: string | null;
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

function FieldError(props: Readonly<{ message?: string | null }>) {
  const { message } = props;
  if (!message) {
    return null;
  }
  return (
    <span className="text-ehs-red text6 leading-normal" role="alert">
      {message}
    </span>
  );
}

export function IncidentDetailPeopleCard(
  props: Readonly<IncidentDetailPeopleCardProps>,
) {
  const {
    affectedName = "",
    affectedProfileUrl = null,
    peoplePhotos = EMPTY_PEOPLE_PHOTO_INDEX,
    hasAffectedPerson = false,
    affectedRole = "Affected person",
    affectedEmpId = "—",
    affectedInjuryLabel = "—",
    bodyPart = "—",
    treatment = "None required",
    daysAway = "—",
    responders = [],
    isEditing = false,
    onChangeBodyPart,
    onChangeTreatment,
    onChangeDaysAway,
    bodyPartError = null,
    treatmentError = null,
    daysAwayError = null,
    className = "",
  } = props;

  // Identity fields come from the incident report module and stay read-only in
  // this scope — the People tab edits the injury outcome, not who was involved.
  // While editing the card must render regardless: body part, treatment and
  // days away are editable even on a record that carries no person name.
  //
  // A real name still counts on its own, so a caller that predates the
  // `hasAffectedPerson` flag does not lose the card.
  const hasRecordedName =
    Boolean(affectedName.trim()) && !isAffectedNamePlaceholder(affectedName);
  const hasAffected = isEditing || hasAffectedPerson || hasRecordedName;

  // A photo always wins. Failing that, initials need a name with letters in it
  // — an employee number has none, and "90" sliced off "9005" says nothing, so
  // that case falls through to the person glyph instead.
  const hasPhotoOrInitials =
    Boolean(affectedProfileUrl?.trim()) ||
    (/\p{L}/u.test(affectedName) && !isAffectedNamePlaceholder(affectedName));
  // The mapper no longer falls the name back to the id, so the two should not
  // collide — this stays as a guard against an empty dash row and against a
  // caller still supplying the old shape.
  const showEmpIdRow =
    affectedEmpId.trim().length > 0 &&
    affectedEmpId !== "—" &&
    affectedEmpId.trim().toLowerCase() !== affectedName.trim().toLowerCase();

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
              {hasPhotoOrInitials ? (
                <UserAvatar
                  name={affectedName}
                  profileUrl={affectedProfileUrl}
                  sizeClassName="size-12 rounded-[14px]"
                  sizes="48px"
                />
              ) : (
                <div className="bg-ehs-dark-blue-bg-light text-ehs-dark-blue flex size-12 shrink-0 items-center justify-center rounded-[14px]">
                  <Icon
                    icon="mdi:account-outline"
                    className="size-6"
                    aria-hidden="true"
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-ehs-dark-bg text4 leading-normal font-bold">
                  {affectedName}
                </span>
                <span className="text-ehs-gray text4 truncate leading-normal">
                  {affectedRole}
                </span>
                {showEmpIdRow ? (
                  <span className="text-ehs-muted-text text4 leading-normal">
                    {affectedEmpId}
                  </span>
                ) : null}
              </div>
              <span className="bg-ehs-surface-inverse/14 text-ehs-gray text4 shrink-0 rounded-full px-2.25 pt-[3px] pb-[3px] leading-normal font-bold tracking-wide">
                {affectedInjuryLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
              <div className="rounded-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 flex flex-col gap-0.75 border p-3.25">
                <span className="text-ehs-muted-text text6">Body part</span>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editableDisplayValue(bodyPart)}
                      onChange={(event) =>
                        onChangeBodyPart?.(event.target.value)
                      }
                      placeholder="e.g. Head / face"
                      className={fieldInputClass}
                      aria-label="Body part"
                      aria-invalid={bodyPartError != null}
                      required
                    />
                    <FieldError message={bodyPartError} />
                  </>
                ) : (
                  <span className="text-ehs-dark-bg text4 leading-normal">
                    {bodyPart}
                  </span>
                )}
              </div>
              <div className="rounded-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 flex flex-col gap-0.75 border p-3.25">
                <span className="text-ehs-muted-text text6">Treatment</span>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editableDisplayValue(treatment)}
                      onChange={(event) =>
                        onChangeTreatment?.(event.target.value)
                      }
                      placeholder="e.g. First aid on site"
                      className={fieldInputClass}
                      aria-label="Treatment"
                      aria-invalid={treatmentError != null}
                      required
                    />
                    <FieldError message={treatmentError} />
                  </>
                ) : (
                  <span className="text-ehs-dark-bg text4 leading-normal">
                    {treatment}
                  </span>
                )}
              </div>
              <div className="rounded-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 flex flex-col gap-0.75 border p-3.25">
                <span className="text-ehs-muted-text text6">Days away</span>
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={editableDisplayValue(String(daysAway))}
                      onChange={(event) =>
                        onChangeDaysAway?.(event.target.value)
                      }
                      placeholder="0"
                      className={fieldInputClass}
                      aria-label="Days away from work"
                      aria-invalid={daysAwayError != null}
                      required
                    />
                    <FieldError message={daysAwayError} />
                  </>
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
              // ResponderMember carries no stable id and the list is never
              // reordered or filtered, so the index is the key. Rows are
              // read-only now, so there is no caret to lose on a remount.
              key={index}
              className="border-ehs-border-ink/8 flex items-center gap-3 border-t pt-3.25 pb-3"
            >
              <UserAvatar
                name={person.name}
                profileUrl={lookupPeoplePhoto(
                  peoplePhotos,
                  person.name,
                  person.empId,
                )}
                sizeClassName="rounded-2.5 size-8.5"
                sizes="34px"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="text-ehs-dark-bg text4 leading-normal font-bold">
                  {person.name}
                </span>
                <span className="text-ehs-gray text4 truncate leading-normal">
                  {person.role}
                </span>
              </div>
              <span className="text-ehs-muted-text text4 shrink-0 leading-normal">
                {person.empId}
              </span>
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
