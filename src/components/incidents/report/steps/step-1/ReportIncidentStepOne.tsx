"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  CLASSIFICATION_FIELDS,
  YES_NO_OPTIONS,
  type ReportIncidentFormState,
  type SeverityId,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportDateField } from "@/components/incidents/report/shared/ReportDateField";
import {
  ReportSelectField,
  ReportTextField,
} from "@/components/incidents/report/shared/ReportFormField";
import { ReportTimeField } from "@/components/incidents/report/shared/ReportTimeField";
import { ReportSeverityPicker } from "@/components/incidents/report/steps/step-1/ReportSeverityPicker";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";

export type ReportIncidentStepOneProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

export function ReportIncidentStepOne(
  props: Readonly<ReportIncidentStepOneProps>,
) {
  const { form, onChange, onBack, onContinue, className = "" } = props;

  // Reporter fields are no longer shown — stamp them from the signed-in user.
  useEffect(() => {
    const auth = getAuthContext();
    const nextReportedBy = getAuthDisplayName("").trim();
    const nextEmail = auth?.email?.trim() ?? "";
    const needsName = !form.reportedBy.trim() && Boolean(nextReportedBy);
    const needsEmail = !form.reporterEmail.trim() && Boolean(nextEmail);

    if (!needsName && !needsEmail) {
      return;
    }

    onChange({
      ...(needsName ? { reportedBy: nextReportedBy } : {}),
      ...(needsEmail ? { reporterEmail: nextEmail } : {}),
    });
  }, [form.reportedBy, form.reporterEmail, onChange]);

  return (
    <IncidentGlassCard
      paddingClassName="p-[29px]"
      incidentGlassCardClassName="gap-7"
      className={[
        "min-w-0 flex-1 bg-[rgba(255,255,255,0.82)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-1.5">
          <Text
            as="p"
            className="text-[10px] font-bold tracking-[1.4px] text-[#056e7e] uppercase"
          >
            Step 1
          </Text>
          <Text
            as="h2"
            className="text-[21.3px] font-bold tracking-[-0.44px] text-[#0b1320]"
          >
            What & where
          </Text>
          <Text as="p" className="text-[12px] text-[#566072]">
            Classify the incident, then capture where and when it occurred.
          </Text>
        </div>

        <ReportSeverityPicker
          value={form.severity}
          onChange={(severity: SeverityId) => onChange({ severity })}
          className="pt-3"
        />

        <div className="flex flex-col pt-[18px]">
          <ReportTextField
            label="Affected person"
            value={form.affectedPerson}
            onChange={(event) =>
              onChange({ affectedPerson: event.target.value })
            }
            trailingHint="Search by name or employee ID."
            placeholder="Maria Lopez · EMP-04821"
          />

          <ReportTextField
            label="Plant / Location"
            required
            value={form.location}
            onChange={(event) => onChange({ location: event.target.value })}
            trailingHint="Type-ahead — start typing a site, line, or area."
            endIcon="mdi:magnify"
            placeholder="Plant A · Line 2 — Press #4"
            className="pt-3"
          />

          <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-3 sm:gap-x-3">
            <ReportDateField
              label="Date of Incident"
              required
              value={form.incidentDate}
              onChange={(incidentDate) => onChange({ incidentDate })}
              className="pb-[6px] sm:pb-[18px]"
            />
            <ReportTimeField
              label="Time of Incident"
              required
              value={form.incidentTime}
              onChange={(incidentTime) => onChange({ incidentTime })}
              className="pb-[6px] sm:pb-[18px]"
            />
            <ReportDateField
              label="Report Date"
              required
              value={form.reportDate}
              onChange={(reportDate) => onChange({ reportDate })}
              className="pb-[6px] sm:pb-[18px]"
            />
          </div>
        </div>

        <div className="mt-1 flex flex-col">
          <Text
            as="p"
            className="pt-px text-[10px] font-bold tracking-[1px] text-[#8892a3] uppercase"
          >
            Classification
          </Text>
          <div className="grid grid-cols-1 gap-x-3 pt-1 sm:grid-cols-2">
            {CLASSIFICATION_FIELDS.map((field) => (
              <div key={field.id} className="pb-[18px]">
                <ReportSelectField
                  label={field.label}
                  required
                  hint={field.hint}
                  value={form.classifications[field.id]}
                  onChange={(event) =>
                    onChange({
                      classifications: {
                        ...form.classifications,
                        [field.id]: event.target.value as "Yes" | "No",
                      },
                    })
                  }
                  options={[...YES_NO_OPTIONS]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(15,23,42,0.08)] pt-[21px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="tertiary"
            onClick={onBack}
            className="rounded-[10px] border border-[rgba(15,23,42,0.14)] bg-transparent px-[15px] pt-2.5 pb-[10.5px] text-[13px] font-bold text-[#2a3446] opacity-40 transition hover:opacity-70"
          >
            <Icon
              icon="mdi:chevron-left"
              className="size-[13px]"
              aria-hidden="true"
            />
            Back
          </Button>

          <p className="min-w-0 flex-1 text-[10.8px] text-[#8892a3]">
            Required fields marked with{" "}
            <span className="text-[#ef4444]">*</span>
          </p>

          <Button
            type="button"
            variant="primary"
            onClick={onContinue}
            className="rounded-[10px] bg-[#0891a6] px-[15px] pt-2.5 pb-[10.5px] text-[13px] font-bold text-white shadow-[0px_6px_18px_-6px_#0891a6] transition hover:bg-[#067a8c]"
          >
            Continue
            <Icon
              icon="mdi:chevron-right"
              className="size-[13px]"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
