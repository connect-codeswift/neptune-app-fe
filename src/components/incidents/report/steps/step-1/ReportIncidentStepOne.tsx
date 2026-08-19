"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  classificationFieldsForStepOne,
  GENDER_OPTIONS,
  normalizeGender,
  oshaRecordableForSeverity,
  seriousFieldLabelForSeverity,
  seriousFieldToggleOptionsForSeverity,
  SEVERITY_OPTIONS,
  usesSiaSipToggle,
  type ReportIncidentFormState,
  type SeverityId,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportClassificationToggle } from "@/components/incidents/report/shared/ReportClassificationToggle";
import { ReportDateField } from "@/components/incidents/report/shared/ReportDateField";
import { ReportSelectField } from "@/components/incidents/report/shared/ReportFormField";
import {
  ReportPersonSearchField,
  type ReportPersonSelection,
} from "@/components/incidents/report/shared/ReportPersonSearchField";
import { ReportSiteField } from "@/components/incidents/report/shared/ReportSiteField";
import { ReportLocationsField } from "@/components/incidents/report/shared/ReportLocationsField";
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
import { userGenderQueryKey } from "@/hooks/use-user-queries";
import { getUserGenderById } from "@/services/user.service";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";

export type ReportTimingErrors = Readonly<{
  incidentDate: string | null;
  incidentTime: string | null;
  reportDate: string | null;
}>;

export type ReportStepOneErrors = Readonly<{
  severity: string | null;
  affectedPerson: string | null;
  incidentDate: string | null;
  incidentTime: string | null;
  reportDate: string | null;
  classifications: Readonly<Record<string, string | null>>;
}>;

function hasStepOneErrors(errors: ReportStepOneErrors): boolean {
  if (
    errors.severity ||
    errors.affectedPerson ||
    errors.incidentDate ||
    errors.incidentTime ||
    errors.reportDate
  ) {
    return true;
  }

  return Object.values(errors.classifications).some(Boolean);
}

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
function validateTiming(form: ReportIncidentFormState): ReportTimingErrors {
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
function getStepOneErrors(form: ReportIncidentFormState): ReportStepOneErrors {
  const timing = validateTiming(form);
  const classificationErrors = Object.fromEntries(
    classificationFieldsForStepOne(form.severity).map((field) => {
      if (field.id === "serious" && usesSiaSipToggle(form.severity)) {
        const value = form.classifications[field.id];
        return [
          field.id,
          value === "SIA" || value === "SIP" || value === "SIF"
            ? null
            : "Select SIA, SIP, or SIF.",
        ];
      }

      return [
        field.id,
        form.classifications[field.id] === "Yes" ||
        form.classifications[field.id] === "No"
          ? null
          : "Select Yes or No.",
      ];
    }),
  );

  return {
    severity: form.severity ? null : "Select a severity before continuing.",
    affectedPerson: form.affectedPerson.trim()
      ? null
      : "Enter the affected person's name or employee ID.",
    incidentDate:
      timing.incidentDate ??
      (form.incidentDate.trim()
        ? null
        : "Enter the date the incident occurred."),
    incidentTime:
      timing.incidentTime ??
      (form.incidentTime.trim()
        ? null
        : "Enter the time the incident occurred."),
    reportDate: timing.reportDate,
    classifications: classificationErrors,
  };
}

/**
 * First blocking message — kept for callers that only need one string.
 */
export function validateStepOne(form: ReportIncidentFormState): string | null {
  const errors = getStepOneErrors(form);

  if (errors.severity) return errors.severity;
  if (errors.affectedPerson) return errors.affectedPerson;
  if (errors.incidentDate) return errors.incidentDate;
  if (errors.incidentTime) return errors.incidentTime;
  if (errors.reportDate) return errors.reportDate;

  const classificationError = Object.values(errors.classifications).find(
    Boolean,
  );
  if (classificationError) {
    const field = classificationFieldsForStepOne(form.severity).find(
      (item) => errors.classifications[item.id],
    );
    return field
      ? `Answer "${field.id === "serious" ? seriousFieldLabelForSeverity(form.severity) : field.label}" under Classification.`
      : classificationError;
  }

  return null;
}

export type ReportIncidentStepOneProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  /** Set when the stepper blocks a forward jump — surfaces the same inline errors as Continue. */
  showFieldErrors?: boolean;
  className?: string;
}>;

export function ReportIncidentStepOne(
  props: Readonly<ReportIncidentStepOneProps>,
) {
  const {
    form,
    onChange,
    onBack,
    onContinue,
    showFieldErrors = false,
    className = "",
  } = props;

  const [attemptedContinue, setAttemptedContinue] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const showErrors = attemptedContinue || showFieldErrors;
  const fieldErrors = showErrors ? getStepOneErrors(form) : null;

  const site = useCurrentSite();
  const queryClient = useQueryClient();

  // Which person the in-flight gender lookup is for. Picking someone else
  // before the first lookup lands must not let the slower answer win.
  const genderRequestRef = useRef("");

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
   * asked twice.
   *
   * Changing the person invalidates a gender that was read off the previous
   * one — it describes somebody else, and leaving it would quietly attribute
   * one colleague's gender to another on a regulated record. An answer the
   * reporter chose themselves is theirs and survives: that is the whole reason
   * `genderFromProfile` tracks where the value came from.
   */
  const handlePersonChange = (person: ReportPersonSelection) => {
    const identity = {
      affectedPerson: person.name,
      affectedPersonId: person.userId,
    };

    // The roster row already knows — no lookup needed. This is the path taken
    // once `GET /api/v1/sites/{siteId}/users` projects `gender`.
    if (person.gender) {
      genderRequestRef.current = person.userId;
      onChange({ ...identity, gender: person.gender, genderFromProfile: true });
      return;
    }

    // Cleared before the lookup rather than after it comes back empty: showing
    // the last person's gender while this one resolves presents a stale answer
    // as though it were this person's.
    onChange(
      form.genderFromProfile
        ? { ...identity, gender: "", genderFromProfile: false }
        : identity,
    );
    genderRequestRef.current = person.userId;

    if (!person.userId) {
      return;
    }

    // Until that projection exists, the person has to be fetched one at a time.
    // Done here rather than in an effect because it is a response to one
    // deliberate action — picking a name — not a state the screen has to keep
    // in sync. `fetchQuery` still caches, so re-picking the same colleague
    // costs nothing.
    const userId = Number(person.userId);
    void queryClient
      .fetchQuery({
        queryKey: userGenderQueryKey(userId),
        queryFn: () => getUserGenderById(userId),
        staleTime: Infinity,
      })
      .then((raw) => {
        const resolved = normalizeGender(raw);
        // Ignore a late answer for someone who is no longer the affected
        // person, and never overwrite a gender the reporter has since chosen.
        if (!resolved || genderRequestRef.current !== person.userId) {
          return;
        }

        onChange({ gender: resolved, genderFromProfile: true });
      })
      .catch(() => {
        // Silent: gender stays for the reporter to answer by hand. A failed
        // convenience lookup is not worth interrupting an incident report.
      });
  };

  const handleContinue = () => {
    const errors = getStepOneErrors(form);
    if (hasStepOneErrors(errors)) {
      setAttemptedContinue(true);
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector("[data-field-error='true']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    onContinue?.();
  };

  /**
   * Severity owns the "OSHA Recordable?" answer in both directions — see
   * `oshaRecordableForSeverity`. The field stays editable, so a reporter can
   * still override it by hand afterwards.
   */
  const handleSeverityChange = (severity: SeverityId | "") => {
    if (!severity) {
      onChange({ severity: "", title: "" });
      return;
    }

    const osha = oshaRecordableForSeverity(severity);
    const severityTitle =
      SEVERITY_OPTIONS.find((option) => option.id === severity)?.label ??
      form.title;

    const wasSiaSip = usesSiaSipToggle(form.severity);
    const isSiaSip = usesSiaSipToggle(severity);
    let serious = form.classifications.serious;

    if (wasSiaSip !== isSiaSip) {
      if (isSiaSip) {
        serious =
          form.classifications.serious === "Yes"
            ? "SIA"
            : form.classifications.serious === "No"
              ? "SIP"
              : "";
      } else if (
        form.classifications.serious === "SIA" ||
        form.classifications.serious === "SIF"
      ) {
        serious = "Yes";
      } else if (form.classifications.serious === "SIP") {
        serious = "No";
      } else {
        serious = "";
      }
    }

    if (
      form.classifications.osha === osha &&
      serious === form.classifications.serious
    ) {
      onChange({ severity, title: severityTitle });
      return;
    }

    onChange({
      severity,
      title: severityTitle,
      classifications: { ...form.classifications, osha, serious },
    });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-7.25"
      incidentGlassCardClassName="gap-7"
      className={["bg-ehs-surface/82 min-w-0 flex-1", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div ref={formRef} className="flex flex-col gap-1.5">
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

        <ReportSeverityPicker<SeverityId | "">
          value={form.severity}
          onChange={handleSeverityChange}
          error={fieldErrors?.severity ?? null}
          className="pt-3"
        />

        <div className="flex flex-col pt-4.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
            <ReportSelectField
              label="Gender"
              required
              // Says why the field answered itself, because a value that
              // appears without being typed reads as a bug otherwise. An icon
              // rather than the words "From their profile": this column is
              // 180px, and the text wrapped onto a second line, which grew the
              // label and dropped this input below Affected person's.
              trailing={
                form.genderFromProfile ? (
                  <span
                    title="Filled from this person's profile"
                    className="text-ehs-dark-blue inline-flex items-center"
                  >
                    <Icon
                      icon="mdi:account-check-outline"
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    <span className="sr-only">
                      Filled from this person&apos;s profile
                    </span>
                  </span>
                ) : undefined
              }
              value={form.gender}
              onChange={(gender) => {
                // Their answer wins over any lookup still in flight.
                genderRequestRef.current = "";
                onChange({ gender, genderFromProfile: false });
              }}
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
              error={fieldErrors?.affectedPerson ?? null}
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

          <ReportLocationsField
            locations={form.incidentLocations ?? []}
            customLocations={form.customIncidentLocations ?? []}
            onChange={(incidentLocations) => onChange({ incidentLocations })}
            onCustomLocationsChange={(customIncidentLocations) =>
              onChange({ customIncidentLocations })
            }
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
              error={fieldErrors?.incidentDate ?? timing.incidentDate}
              className="pb-1.5 sm:pb-4.5"
            />
            <ReportTimeField
              label="Time of Incident"
              required
              value={form.incidentTime}
              onChange={(incidentTime) => onChange({ incidentTime })}
              showNow
              error={fieldErrors?.incidentTime ?? timing.incidentTime}
              className="pb-1.5 sm:pb-4.5"
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
              error={fieldErrors?.reportDate ?? timing.reportDate}
              className="pb-1.5 sm:pb-4.5"
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
          <div className="grid grid-cols-1 gap-x-3 gap-y-4 pt-2 sm:grid-cols-2">
            {classificationFieldsForStepOne(form.severity).map((field) => (
              <ReportClassificationToggle
                key={field.id}
                label={
                  field.id === "serious"
                    ? seriousFieldLabelForSeverity(form.severity)
                    : field.label
                }
                required
                hint={field.id === "osha" ? "Set from severity" : field.hint}
                value={form.classifications[field.id]}
                options={
                  field.id === "serious"
                    ? seriousFieldToggleOptionsForSeverity(form.severity)
                    : undefined
                }
                error={fieldErrors?.classifications[field.id] ?? null}
                onChange={(answer) =>
                  onChange({
                    classifications: {
                      ...form.classifications,
                      [field.id]: answer,
                    },
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-ehs-border-ink/8 border-t pt-5.25">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="tertiary"
            onClick={onBack}
            className="text-ehs-slate rounded-2.5 border-ehs-border-ink/14 border bg-transparent px-3.75 pt-2.5 pb-[11px] text-sm font-bold opacity-40 transition hover:opacity-70"
          >
            <Icon
              icon="mdi:chevron-left"
              className="size-3.25"
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
            className="bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-active rounded-2.5 px-3.75 pt-2.5 pb-[11px] text-sm font-bold shadow-(--ehs-shadow-button-primary-flat) transition"
          >
            Continue
            <Icon
              icon="mdi:chevron-right"
              className="size-3.25"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
