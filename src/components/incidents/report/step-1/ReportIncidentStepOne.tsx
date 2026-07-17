"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import {
  CLASSIFICATION_FIELDS,
  YES_NO_OPTIONS,
  type ReportIncidentFormState,
  type SeverityId,
} from "@/components/incidents/report/shared/report-incident-data";
import {
  ReportSelectField,
  ReportTextField,
} from "@/components/incidents/report/shared/ReportFormField";
import { ReportSeverityPicker } from "@/components/incidents/report/step-1/ReportSeverityPicker";

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

  return (
    <IncidentGlassCard
      paddingClassName="p-[29px]"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-1.5">
          <Text
            as="p"
            className="text-ehs-dark-blue text-[10px] font-bold tracking-[1.4px] uppercase"
          >
            Step 1
          </Text>
          <Text
            as="h2"
            className="text-ehs-dark-bg text-[21.3px] font-bold tracking-[-0.44px]"
          >
            What & where
          </Text>
          <Text as="p" className="text-ehs-gray text-[12px]">
            Classify the incident, then capture where and when it occurred.
          </Text>

          <ReportSeverityPicker
            value={form.severity}
            onChange={(severity: SeverityId) => onChange({ severity })}
          />

          <div className="flex flex-col gap-4 pt-[18px]">
            <ReportTextField
              label="Affected person"
              value={form.affectedPerson}
              onChange={(event) =>
                onChange({ affectedPerson: event.target.value })
              }
              trailingHint="Search by name or employee ID."
              placeholder="Name or employee ID"
            />

            <ReportTextField
              label="Plant / Location"
              required
              value={form.location}
              onChange={(event) => onChange({ location: event.target.value })}
              helperText="Type-ahead — start typing a site, line, or area."
              endIcon="mdi:magnify"
              placeholder="Site, line, or area"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReportTextField
                label="Incident Reported By"
                required
                value={form.reportedBy}
                onChange={(event) =>
                  onChange({ reportedBy: event.target.value })
                }
                placeholder="Reporter name"
              />
              <ReportTextField
                label="Reporter Email"
                type="email"
                value={form.reporterEmail}
                onChange={(event) =>
                  onChange({ reporterEmail: event.target.value })
                }
                placeholder="name@company.com"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ReportTextField
                label="Date of Incident"
                required
                value={form.incidentDate}
                onChange={(event) =>
                  onChange({ incidentDate: event.target.value })
                }
                endIcon="mdi:calendar-outline"
                placeholder="MM/DD/YYYY"
              />
              <ReportTextField
                label="Time of Incident"
                required
                value={form.incidentTime}
                onChange={(event) =>
                  onChange({ incidentTime: event.target.value })
                }
                endIcon="mdi:clock-outline"
                trailingHint="ⓘ 24-hour"
                placeholder="HH:MM"
              />
              <ReportTextField
                label="Report Date"
                required
                value={form.reportDate}
                onChange={(event) =>
                  onChange({ reportDate: event.target.value })
                }
                endIcon="mdi:calendar-outline"
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3.5">
            <Text
              as="p"
              className="text-ehs-muted-text text-[10.5px] font-bold tracking-[1.05px] uppercase"
            >
              Classification
            </Text>
            <div className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2">
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
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold opacity-40"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-[13px]"
                aria-hidden="true"
              />
              Back
            </Button>

            <p className="text-ehs-muted-text min-w-0 flex-1 text-[10.8px]">
              Required fields marked with{" "}
              <span className="text-ehs-red">*</span>
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={onContinue}
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold shadow-[0px_6px_18px_-6px_#0891a6]"
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
      </div>
    </IncidentGlassCard>
  );
}
