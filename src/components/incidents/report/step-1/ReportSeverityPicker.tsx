"use client";

import { Text } from "@/components/Text";
import {
  SEVERITY_OPTIONS,
  type SeverityId,
} from "@/components/incidents/report/shared/report-incident-data";

export type ReportSeverityPickerProps = Readonly<{
  value: SeverityId;
  onChange: (value: SeverityId) => void;
  className?: string;
}>;

export function ReportSeverityPicker(
  props: Readonly<ReportSeverityPickerProps>,
) {
  const { value, onChange, className = "" } = props;

  return (
    <div
      className={["flex flex-col gap-1.5 pt-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-end gap-1.5">
        <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
          Severity
        </Text>
        <Text as="span" className="text-ehs-red text-[12px]">
          *
        </Text>
        <Text as="span" className="text-ehs-muted-text ml-auto text-[9.8px]">
          Drives routing & recordability. You can change it later.
        </Text>
      </div>

      <div
        className="flex flex-wrap gap-[11px]"
        role="radiogroup"
        aria-label="Severity"
      >
        {SEVERITY_OPTIONS.map((option) => {
          const isSelected = option.id === value;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.id)}
              className={[
                "flex min-h-[66px] w-[96px] min-w-[96px] flex-col items-start gap-1.5 rounded-[10px] border px-[13px] py-[11px] text-left transition-colors",
                isSelected
                  ? "border-ehs-normal-blue bg-ehs-normal-blue/14"
                  : "border-[rgba(15,23,42,0.08)] bg-white/62 hover:border-[rgba(15,23,42,0.16)]",
              ].join(" ")}
            >
              <span
                className={[
                  "size-2 shrink-0 rounded",
                  isSelected ? "bg-ehs-normal-blue" : "bg-ehs-gray",
                ].join(" ")}
              />
              <span
                className={[
                  "text-[12.5px] leading-[15px] font-bold",
                  isSelected ? "text-ehs-normal-blue" : "text-ehs-dark-bg",
                ].join(" ")}
              >
                {option.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
