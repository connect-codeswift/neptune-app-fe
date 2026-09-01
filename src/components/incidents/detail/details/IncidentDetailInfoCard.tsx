"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Text } from "@/components/Text";
import type {
  IncidentDetailInfoItem,
  IncidentDetailInfoItemKind,
} from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";

/**
 * "" ("Select…") is a real, pickable entry — the native select allowed
 * clearing back to unset, so the replacement must too.
 */
const YES_NO_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
] as const;

export type { IncidentDetailInfoItem, IncidentDetailInfoItemKind };

export type IncidentDetailInfoCardProps = Readonly<{
  items?: readonly IncidentDetailInfoItem[];
  isEditing?: boolean;
  onChangeItem?: (key: string, value: string) => void;
  className?: string;
}>;

const fieldInputClass = FIELD_INPUT_CLASS;

function editableDisplayValue(value: string): string {
  return value === "—" ? "" : value;
}

/**
 * Options for a `select` field, always including a blank "Select…" entry so the
 * field can be cleared back to unset the way the text input allowed.
 *
 * A value already on the record that is not in the list is added to it. Records
 * predate these option lists — and the wizard's add-your-own fields write values
 * no fixed list contains — so without this, opening the edit view on such an
 * incident would show a blank picker and quietly overwrite a real answer with ""
 * on the next save.
 */
function selectOptionsFor(item: IncidentDetailInfoItem) {
  const current = editableDisplayValue(item.value);
  const labels = item.options ?? [];
  const known = labels.some((label) => label === current);

  return [
    { value: "", label: "Select…" },
    ...(current && !known ? [{ value: current, label: current }] : []),
    ...labels.map((label) => ({ value: label, label })),
  ];
}

export function IncidentDetailInfoCard(
  props: Readonly<IncidentDetailInfoCardProps>,
) {
  const { items = [], isEditing = false, onChangeItem, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-5.75"
      incidentGlassCardClassName="gap-3.5"
      className={[className, isEditing ? "ring-ehs-normal-blue/25 ring-1" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <Text as="h3" className="text-ehs-dark-bg text3">
        Incident details
      </Text>

      <div className="grid grid-cols-1 gap-x-4.5 gap-y-4.5 sm:grid-cols-2">
        {items.length === 0 ? (
          <EmptyState
            variant="plain"
            icon="mdi:information-outline"
            title="No detail fields"
            message="Fields recorded for this incident appear here."
            className="col-span-full"
          />
        ) : (
          items.map((item) => {
            const kind = item.kind ?? "text";
            const canEdit = isEditing && kind !== "readonly";

            return (
              <div key={item.key} className="flex flex-col gap-0.75">
                <span className="text-ehs-muted-text text6">{item.label}</span>
                {canEdit && kind === "yesno" ? (
                  <GlassSelect
                    options={YES_NO_OPTIONS}
                    value={
                      item.value === "Yes" || item.value === "No"
                        ? item.value
                        : ""
                    }
                    onChange={(value) => onChangeItem?.(item.key, value)}
                    aria-label={item.label}
                    triggerClassName={fieldInputClass}
                  />
                ) : null}
                {canEdit && kind === "select" ? (
                  <GlassSelect
                    options={selectOptionsFor(item)}
                    value={editableDisplayValue(item.value)}
                    onChange={(value) => onChangeItem?.(item.key, value)}
                    aria-label={item.label}
                    triggerClassName={fieldInputClass}
                  />
                ) : null}
                {canEdit && kind === "text" ? (
                  <input
                    type="text"
                    value={editableDisplayValue(item.value)}
                    onChange={(event) =>
                      onChangeItem?.(item.key, event.target.value)
                    }
                    className={fieldInputClass}
                    aria-label={item.label}
                  />
                ) : null}
                {!canEdit ? (
                  <span className="text-ehs-dark-bg text4 leading-normal">
                    {item.value}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </IncidentGlassCard>
  );
}
