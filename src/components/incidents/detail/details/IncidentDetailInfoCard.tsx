"use client";

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

export function IncidentDetailInfoCard(
  props: Readonly<IncidentDetailInfoCardProps>,
) {
  const { items = [], isEditing = false, onChangeItem, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[23px]"
      incidentGlassCardClassName="gap-3.5"
      className={[className, isEditing ? "ring-ehs-normal-blue/25 ring-1" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <Text as="h3" className="text-ehs-dark-bg text-lg font-semibold">
        Incident details
      </Text>

      <div className="grid grid-cols-1 gap-x-[18px] gap-y-[18px] sm:grid-cols-2">
        {items.length === 0 ? (
          <div className="text-ehs-muted-text col-span-full py-6 text-center text-sm">
            No incident detail fields returned by the API.
          </div>
        ) : (
          items.map((item) => {
            const kind = item.kind ?? "text";
            const canEdit = isEditing && kind !== "readonly";

            return (
              <div key={item.key} className="flex flex-col gap-[3px]">
                <span className="text-ehs-muted-text text-xs font-bold tracking-wide uppercase">
                  {item.label}
                </span>
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
                  <span className="text-ehs-dark-bg text-sm leading-normal">
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
