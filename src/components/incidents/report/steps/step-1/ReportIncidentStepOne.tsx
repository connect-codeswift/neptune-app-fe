"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  CLASSIFICATION_FIELDS,
  GENDER_OPTIONS,
  YES_NO_OPTIONS,
  oshaRecordableForSeverity,
  type ReportIncidentFormState,
  type SeverityId,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportDateField } from "@/components/incidents/report/shared/ReportDateField";
import { ReportSelectField } from "@/components/incidents/report/shared/ReportFormField";
import {
  ReportPersonSearchField,
  type ReportPersonSelection,
} from "@/components/incidents/report/shared/ReportPersonSearchField";
import { ReportSiteField } from "@/components/incidents/report/shared/ReportSiteField";
import { ReportTimeField } from "@/components/incidents/report/shared/ReportTimeField";
import {
  formatMmDdYyyy,
  parseMmDdYyyy,
  parseTimeInput,
  startOfDay,
  today,
  todayMmDdYyyy,
} from "@/components/incidents/report/shared/report-date-time";
import { ReportSeverityPicker } from "@/components/incidents/report/steps/step-1/ReportSeverityPicker";
import { useCurrentSite } from "@/hooks/use-current-site";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";
import { toast } from "@/lib/toast";

export type ReportTimingErrors = Readonly<{
  incidentDate: string | null;
  incidentTime: string | null;
  reportDate: string | null;
}>;

/** A date the reporter has finished typing, rather than one mid-keystroke. */
function isComplete(dateValue: string): boolean {
  return dateValue.trim().length === 10;
}

/**
 * Everything that can be wrong with the when of an incident, keyed by field.
 *
 * One function serves both the inline messages under each field and the gate on
 * Continue, so the two can't drift into disagreeing about whether the form is
 * fillable. Incomplete values return no error: half-typed input is not yet a
 * mistake, and flagging it mid-keystroke just argues with the reporter.
 */
export function validateTiming(
  form: ReportIncidentFormState,
): ReportTimingErrors {
  const todayDate = today();
  const incidentDate = parseMmDdYyyy(form.incidentDate);
  const reportDate = parseMmDdYyyy(form.reportDate);
  const incidentTime = parseTimeInput(form.incidentTime);

  // The incident date is deliberately unbounded — only its shape is checked.
  // Backdating and forward-dating are both legitimate here, so the only thing
  // that can be wrong with it is not being a date.
  const incidentDateError =
    isComplete(form.incidentDate) && !incidentDate
      ? "That isn't a real date — try 03/14/2026."
      : null;

  const incidentTimeError =
    form.incidentTime.trim() && !incidentTime ? "Try 14:30 or 2:30 PM." : null;

  // Like the incident date, the report date is unbounded in both directions —
  // only its shape is checked, plus the one rule below that relates it to the
  // incident.
  let reportDateError: string | null = null;
  if (isComplete(form.reportDate) && !reportDate) {
    reportDateError = "That isn't a real date — try 03/14/2026.";
  } else if (
    reportDate &&
    incidentDate &&
    !incidentDateError &&
    // Only meaningful for an incident that has already happened. A
    // forward-dated one is reported before it occurs by definition, so this
    // rule would fire on a perfectly valid entry.
    incidentDate <= todayDate &&
    reportDate < startOfDay(incidentDate)
  ) {
    reportDateError = "A report can't predate the incident it describes.";
  }

  return {
    incidentDate: incidentDateError,
    incidentTime: incidentTimeError,
    reportDate: reportDateError,
  };
}

/**
 * Exported so the view can gate the left-hand stepper too — otherwise clicking
 * straight to Step 2 skips this check entirely.
 */
export function validateStepOne(form: ReportIncidentFormState): string | null {
  if (!form.affectedPerson.trim()) {
    return "Enter the affected person's name or employee ID.";
  }

  // Date and time are marked required here but used to go unchecked until the
  // final review step, four screens later. Catch them where they are asked.
  if (!form.incidentDate.trim()) {
    return "Enter the date the incident occurred.";
  }
  if (!form.incidentTime.trim()) {
    return "Enter the time the incident occurred.";
  }

  const timing = validateTiming(form);
  const timingError =
    timing.incidentDate ?? timing.incidentTime ?? timing.reportDate;
  if (timingError) {
    return timingError;
  }

  // Classification answers start blank rather than defaulting to "No", so an
  // unanswered question can't masquerade as a deliberate one. That only helps
  // if answering is actually enforced — otherwise blank just submits false.
  const unanswered = CLASSIFICATION_FIELDS.find(
    (field) => !form.classifications[field.id],
  );
  if (unanswered) {
    return `Answer "${unanswered.label}" under Classification.`;
  }

  return null;
}

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

  const site = useCurrentSite();

  // Plant / Location is the reporter's own site, not a question. Stamped here
  // rather than in the initial form state because the site name arrives with
  // the session query, which resolves after this form first renders.
  useEffect(() => {
    if (!site.name || form.location === site.name) {
      return;
    }

    onChange({ location: site.name });
  }, [site.name, form.location, onChange]);

  // Reporter fields are no longer shown — stamp them from the signed-in user.
  // Report Date is prefilled with today for the same reason: it's the date the
  // report is being filed, so typing it is friction and a chance to get it wrong.
  // All three stay editable.
  useEffect(() => {
    const auth = getAuthContext();
    const nextReportedBy = getAuthDisplayName("").trim();
    const nextEmail = auth?.email?.trim() ?? "";
    const needsName = !form.reportedBy.trim() && Boolean(nextReportedBy);
    const needsEmail = !form.reporterEmail.trim() && Boolean(nextEmail);
    const needsReportDate = !form.reportDate.trim();

    if (!needsName && !needsEmail && !needsReportDate) {
      return;
    }

    onChange({
      ...(needsName ? { reportedBy: nextReportedBy } : {}),
      ...(needsEmail ? { reporterEmail: nextEmail } : {}),
      ...(needsReportDate ? { reportDate: todayMmDdYyyy() } : {}),
    });
  }, [form.reportedBy, form.reporterEmail, form.reportDate, onChange]);

  const timing = validateTiming(form);
  // The report date floor tracks the incident date, but only when that is a
  // real date in the past: an unparseable one would disable the whole calendar,
  // and a forward-dated incident is reported before it happens by definition.
  const incidentDate = parseMmDdYyyy(form.incidentDate);
  const minReportDate =
    incidentDate && incidentDate <= today()
      ? formatMmDdYyyy(incidentDate)
      : undefined;

  /**
   * The affected person's own record answers the Gender question, so it isn't
   * asked twice — but only when the record actually carries one. Overwriting
   * unconditionally would wipe an answer the reporter had already given every
   * time they picked a name.
   */
  const handlePersonChange = (person: ReportPersonSelection) => {
    const identity = {
      affectedPerson: person.name,
      affectedPersonId: person.userId,
    };

    if (person.gender) {
      onChange({ ...identity, gender: person.gender, genderFromProfile: true });
      return;
    }

    // The value stays for the reporter to correct, but it can no longer claim
    // to have come from this person's profile.
    onChange(
      form.genderFromProfile
        ? { ...identity, genderFromProfile: false }
        : identity,
    );
  };

  const handleContinue = () => {
    const validationError = validateStepOne(form);
    if (validationError) {
      toast.error("Missing required fields", validationError);
      return;
    }
    onContinue?.();
  };

  /**
   * Severity owns the "OSHA Recordable?" answer in both directions — see
   * `oshaRecordableForSeverity`. The field stays editable, so a reporter can
   * still override it by hand afterwards.
   */
  const handleSeverityChange = (severity: SeverityId) => {
    const osha = oshaRecordableForSeverity(severity);

    if (form.classifications.osha === osha) {
      onChange({ severity });
      return;
    }

    onChange({
      severity,
      classifications: { ...form.classifications, osha },
    });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-[29px]"
      incidentGlassCardClassName="gap-7"
      className={["min-w-0 flex-1 bg-[rgba(255,255,255,0.82)]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-1.5">
          <Text
            as="p"
            className="text-ehs-dark-blue text-xs font-bold tracking-[1.4px] uppercase"
          >
            Step 1
          </Text>
          <Text
            as="h2"
            className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
          >
            What & where
          </Text>
          <Text as="p" className="text-ehs-gray text-sm">
            Classify the incident, then capture where and when it occurred.
          </Text>
        </div>

        <ReportSeverityPicker
          value={form.severity}
          onChange={handleSeverityChange}
          className="pt-3"
        />

        <div className="flex flex-col pt-[18px]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
            <ReportSelectField
              label="Gender"
              required
              // Says why the field answered itself. Same treatment as "Set from
              // severity" on OSHA Recordable — a value that appears without
              // being typed reads as a bug unless it explains itself.
              hint={form.genderFromProfile ? "From their profile" : undefined}
              value={form.gender}
              onChange={(gender) =>
                onChange({ gender, genderFromProfile: false })
              }
              options={[...GENDER_OPTIONS]}
            />

            <ReportPersonSearchField
              label="Affected person"
              required
              value={form.affectedPerson}
              selectedUserId={form.affectedPersonId}
              onChange={handlePersonChange}
              siteId={site.id}
              siteName={site.name}
              trailingHint="Search people at your site."
              placeholder="Start typing a name…"
            />
          </div>

          <ReportSiteField
            label="Plant / Location"
            required
            value={form.location}
            onChange={(location) => onChange({ location })}
            siteName={site.name}
            isLoading={site.isLoading}
            className="pt-3"
          />

          <div className="grid grid-cols-1 items-start gap-3 pt-3 sm:grid-cols-3 sm:gap-x-3">
            <ReportDateField
              label="Date of Incident"
              required
              value={form.incidentDate}
              onChange={(incidentDate) => onChange({ incidentDate })}
              // Intentionally unbounded: the calendar opens on any date, past
              // or future.
              quickPicks={["today", "yesterday"]}
              error={timing.incidentDate}
              className="pb-[6px] sm:pb-[18px]"
            />
            <ReportTimeField
              label="Time of Incident"
              required
              value={form.incidentTime}
              onChange={(incidentTime) => onChange({ incidentTime })}
              showNow
              error={timing.incidentTime}
              className="pb-[6px] sm:pb-[18px]"
            />
            <ReportDateField
              label="Report Date"
              required
              value={form.reportDate}
              onChange={(reportDate) => onChange({ reportDate })}
              // Floored at the incident date when that is in the past, and
              // otherwise unbounded — a report can be dated forward.
              minDate={minReportDate}
              quickPicks={["today"]}
              error={timing.reportDate}
              className="pb-[6px] sm:pb-[18px]"
            />
          </div>
        </div>

        <div className="mt-1 flex flex-col">
          <Text
            as="p"
            className="text-ehs-muted-text pt-px text-xs font-bold tracking-[1px] uppercase"
          >
            Classification
          </Text>
          <div className="grid grid-cols-1 gap-x-3 pt-1 sm:grid-cols-2">
            {CLASSIFICATION_FIELDS.map((field) => (
              <div key={field.id} className="pb-[18px]">
                <ReportSelectField
                  label={field.label}
                  required
                  // Say where the answer came from — this one is set by the
                  // severity picker above, so an unexplained "Yes" appearing
                  // here reads like a bug.
                  hint={field.id === "osha" ? "Set from severity" : field.hint}
                  value={form.classifications[field.id]}
                  onChange={(answer) =>
                    onChange({
                      classifications: {
                        ...form.classifications,
                        [field.id]: answer as "Yes" | "No",
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
            className="text-ehs-slate rounded-[10px] border border-[rgba(15,23,42,0.14)] bg-transparent px-[15px] pt-2.5 pb-[10.5px] text-sm font-bold opacity-40 transition hover:opacity-70"
          >
            <Icon
              icon="mdi:chevron-left"
              className="size-[13px]"
              aria-hidden="true"
            />
            Back
          </Button>

          <p className="text-ehs-muted-text min-w-0 flex-1 text-xs">
            Required fields marked with <span className="text-ehs-red">*</span>
          </p>

          <Button
            type="button"
            variant="primary"
            onClick={handleContinue}
            className="bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-normal-blue-active rounded-[10px] px-[15px] pt-2.5 pb-[10.5px] text-sm font-bold shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition"
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
