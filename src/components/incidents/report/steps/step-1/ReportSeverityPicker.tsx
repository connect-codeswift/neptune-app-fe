"use client";

import {
  SEVERITY_OPTIONS,
  type SeverityId,
} from "@/components/incidents/report/shared/report-incident-data";
import {
  ReportOptionCards,
  type ReportOptionCardOption,
} from "@/components/incidents/report/shared/ReportOptionCards";

export type ReportSeverityPickerProps<T extends string = SeverityId> =
  Readonly<{
    /** `""` means nothing picked yet — severity has no default. */
    value: T | "";
    onChange: (value: T) => void;
    options?: readonly ReportOptionCardOption<T>[];
    label?: string;
    required?: boolean;
    trailingHint?: string;
    variant?: "chip" | "tile";
    className?: string;
  }>;

const DEFAULT_SEVERITY_OPTIONS: readonly ReportOptionCardOption<SeverityId>[] =
  SEVERITY_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
    lines: option.lines,
  }));

export function ReportSeverityPicker<T extends string = SeverityId>(
  props: Readonly<ReportSeverityPickerProps<T>>,
) {
  const {
    value,
    onChange,
    options,
    label = "Severity",
    required = true,
    trailingHint,
    variant = "chip",
    className = "",
  } = props;

  const resolvedOptions =
    (options as readonly ReportOptionCardOption<T>[] | undefined) ??
    (DEFAULT_SEVERITY_OPTIONS as unknown as readonly ReportOptionCardOption<T>[]);

  const resolvedHint =
    trailingHint !== undefined
      ? trailingHint
      : variant === "chip"
        ? "Drives routing & recordability. You can change it later."
        : undefined;

  return (
    <ReportOptionCards
      label={label}
      required={required}
      trailingHint={resolvedHint}
      options={resolvedOptions}
      value={value}
      onChange={onChange}
      variant={variant}
      className={className}
    />
  );
}
