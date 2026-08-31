"use client";

import { useId, type ReactNode } from "react";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { Text } from "@/components/Text";
import {
  CapaHierarchySelector,
  type ControlLevel,
} from "@/components/incidents/shared/capa/CapaHierarchySelector";
import { CapaModalFieldLabel } from "@/components/incidents/shared/capa/CapaModalFieldLabel";
import { CapaSegmentedToggle } from "@/components/incidents/shared/capa/CapaSegmentedToggle";
import { DateInput } from "@/components/inputs/DateInput";
import { UserPickerInput } from "@/components/inputs/UserPickerInput";
import { FIELD_TEXTAREA_WITH_CONTROLS_CLASS } from "@/components/ui/field-styles";
import { useCurrentSite } from "@/hooks/use-current-site";
import { getAuthContext } from "@/lib/auth-context";
import { todayMmDdYyyy } from "@/lib/date-time-field";

/**
 * The two halves of the Create CAPA form — the control-level triangle and the
 * field stack — shared by the standalone `/dashboard/capa/new` page and the
 * Add CAPA modal raised from an incident, hazard or near miss.
 *
 * They were two independent builds of the same form (the page went through
 * FormBuilder, the modal hand-rolled the controls), so a change to one silently
 * left the other behind. Only the chrome differs now: the page frames these in
 * a card, the modal in `IncidentModalShell`, and each arranges them itself.
 */

export const CAPA_TYPE_OPTIONS = ["Corrective", "Preventive"] as const;
export const CAPA_PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;

export type CapaCoreFieldsValue = Readonly<{
  description: string;
  type: string;
  /** Display name of the owner. Free text is allowed — the payload carries both. */
  owner: string;
  ownerUserId: string;
  /** MM/DD/YYYY. */
  dueDate: string;
  priority: string;
}>;

export function CapaStepBadge(props: Readonly<{ step: string }>) {
  return (
    <span className="bg-ehs-normal-blue text-ehs-on-accent inline-flex size-6 shrink-0 items-center justify-center rounded-full pt-[2px] pb-[3px] text-sm leading-5">
      {props.step}
    </span>
  );
}

export type CapaStepHeadingProps = Readonly<{
  step: string;
  title: string;
  subtitle?: string;
  className?: string;
}>;

export function CapaStepHeading(props: Readonly<CapaStepHeadingProps>) {
  const { step, title, subtitle, className = "" } = props;

  return (
    <div className={`flex flex-col gap-1.25 ${className}`}>
      <div className="flex items-center gap-2.5">
        <CapaStepBadge step={step} />
        <Text
          as="h3"
          className="text-ehs-dark-bg text-base leading-6 font-normal"
        >
          {title}
        </Text>
      </div>
      {subtitle ? (
        <Text as="p" className="text-ehs-gray text-sm leading-[19.5px]">
          {subtitle}
        </Text>
      ) : null}
    </div>
  );
}

export type CapaControlLevelStepProps = Readonly<{
  step?: string;
  value: ControlLevel | null;
  onChange: (level: ControlLevel) => void;
  headingClassName?: string;
}>;

/** Step 1 — the hierarchy-of-controls triangle, with its heading. */
export function CapaControlLevelStep(
  props: Readonly<CapaControlLevelStepProps>,
) {
  const {
    step = "1",
    value,
    onChange,
    headingClassName = "mb-4 sm:mb-6",
  } = props;

  return (
    <>
      <CapaStepHeading
        step={step}
        title="Select control level"
        subtitle="Most → least effective. Prefer higher-order controls."
        className={headingClassName}
      />
      <CapaHierarchySelector value={value} onChange={onChange} />
    </>
  );
}

export type CapaCoreFieldsProps = Readonly<{
  value: CapaCoreFieldsValue;
  onChange: (patch: Partial<CapaCoreFieldsValue>) => void;
  dueDateError?: string | null;
  /** Which AI prompt set the description assistant uses. */
  aiModule?: "incident";
  /** Rendered after Priority — the tasks checklist, where the layout wants it inline. */
  children?: ReactNode;
}>;

/** Step 2 — description, type, owner, due date, priority. */
export function CapaCoreFields(props: Readonly<CapaCoreFieldsProps>) {
  const {
    value,
    onChange,
    dueDateError = null,
    aiModule = "incident",
    children,
  } = props;

  const descriptionFieldId = useId();
  const site = useCurrentSite();
  const auth = getAuthContext();
  // A CAPA cannot be assigned to whoever raised it, so its author never appears
  // in the roster rather than being rejected on submit.
  const currentUserId = auth && auth.userId > 0 ? auth.userId : null;
  const excludeUserIds =
    currentUserId != null ? [String(currentUserId)] : undefined;

  return (
    <div className="flex flex-col gap-4.5">
      <div className="flex flex-col gap-1.5">
        <CapaModalFieldLabel htmlFor={descriptionFieldId} required>
          Action description
        </CapaModalFieldLabel>
        <div className="relative">
          <textarea
            id={descriptionFieldId}
            value={value.description}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="Describe the corrective / preventive action..."
            rows={3}
            className={FIELD_TEXTAREA_WITH_CONTROLS_CLASS}
          />
          <AiTextAssistant
            module={aiModule}
            value={value.description}
            onApply={(next) => onChange({ description: next })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <CapaModalFieldLabel>Type</CapaModalFieldLabel>
        <CapaSegmentedToggle
          ariaLabel="CAPA type"
          options={CAPA_TYPE_OPTIONS}
          value={value.type}
          onChange={(next) => onChange({ type: next })}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-2">
        <UserPickerInput
          variant="embedded"
          label="Assigned"
          value={{ userId: value.ownerUserId, name: value.owner }}
          onChange={({ name, userId }) => {
            onChange({ owner: name, ownerUserId: userId });
          }}
          allowFreeText
          siteId={site.id}
          siteName={site.name}
          showRosterHeading={false}
          emptyRosterMessage="Ask admin to register more users."
          placeholder="e.g. M. Torres"
          excludeUserIds={excludeUserIds}
        />

        <DateInput
          variant="embedded"
          label="Due date"
          // POST /api/Capa/AddCapa rejects a past due date.
          minDate={todayMmDdYyyy()}
          error={dueDateError}
          value={value.dueDate}
          onChange={(next) => onChange({ dueDate: next })}
          placeholder="MM/DD/YYYY"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <CapaModalFieldLabel>Priority</CapaModalFieldLabel>
        <CapaSegmentedToggle
          ariaLabel="CAPA priority"
          options={CAPA_PRIORITY_OPTIONS}
          value={value.priority}
          onChange={(next) => onChange({ priority: next })}
        />
      </div>

      {children}
    </div>
  );
}

/** Names the one thing still missing, in the order the form is filled. */
export function resolveCapaFooterHint(
  state: Readonly<{
    controlLevel: string | null;
    description: string;
    hasAtLeastOneTask: boolean;
  }>,
): string {
  if (!state.controlLevel) {
    return "Select a control level to continue";
  }
  if (state.description.trim().length === 0) {
    return "Describe the action to continue";
  }
  if (!state.hasAtLeastOneTask) {
    return "Add at least one task to continue";
  }
  return `${state.controlLevel} selected`;
}
