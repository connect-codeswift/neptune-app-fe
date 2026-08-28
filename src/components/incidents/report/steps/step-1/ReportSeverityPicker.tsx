"use client";

import {
  SEVERITY_OPTIONS,
  type SeverityId,
} from "@/forms/incident-module/index";
import {
  ReportOptionCards,
  type ReportOptionCardOption,
} from "@/components/incidents/report/shared/ReportOptionCards";

export type ReportSeverityPickerProps<T extends string = SeverityId> =
  Readonly<{
    value: T;
    onChange: (value: T) => void;
    options?: readonly ReportOptionCardOption<T>[];
    label?: string;
    required?: boolean;
    trailingHint?: string;
    error?: string | null;
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
    error,
    variant = "chip",
    className = "",
  } = props;

  const resolvedOptions =
    (options as readonly ReportOptionCardOption<T>[] | undefined) ??
    (DEFAULT_SEVERITY_OPTIONS as unknown as readonly ReportOptionCardOption<T>[]);

  return (
    <ReportOptionCards
      label={label}
      required={required}
      trailingHint={trailingHint}
      error={error}
      options={resolvedOptions}
      value={value}
      onChange={onChange}
      variant={variant}
      className={className}
    />
  );
}
