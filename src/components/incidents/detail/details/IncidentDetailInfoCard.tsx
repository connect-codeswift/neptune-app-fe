"use client";

import { Text } from "@/components/Text";
import type {
  IncidentDetailInfoItem,
  IncidentDetailInfoItemKind,
} from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";

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
  const {
    items = [],
    isEditing = false,
    onChangeItem,
    className = "",
  } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[23px]"
      incidentGlassCardClassName="gap-[14px]"
      className={[className, isEditing ? "ring-1 ring-ehs-normal-blue/25" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg text-lg font-semibold"
      >
        Incident details
      </Text>

      <div className="grid grid-cols-1 gap-x-[18px] gap-y-[18px] sm:grid-cols-2">
        {items.length === 0 ? (
          <div className="col-span-full py-6 text-center text-sm text-ehs-muted-text">
            No incident detail fields returned by the API.
          </div>
        ) : (
          items.map((item) => {
            const kind = item.kind ?? "text";
            const canEdit = isEditing && kind !== "readonly";

            return (
              <div key={item.key} className="flex flex-col gap-[3px]">
                <span className="text-xs font-bold tracking-wide text-ehs-muted-text uppercase">
                  {item.label}
                </span>
                {canEdit && kind === "yesno" ? (
                  <select
                    value={
                      item.value === "Yes" || item.value === "No"
                        ? item.value
                        : ""
                    }
                    onChange={(event) =>
                      onChangeItem?.(item.key, event.target.value)
                    }
                    className={fieldInputClass}
                    aria-label={item.label}
                  >
                    <option value="">Select…</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
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
                  <span className="text-sm leading-normal text-ehs-dark-bg">
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
