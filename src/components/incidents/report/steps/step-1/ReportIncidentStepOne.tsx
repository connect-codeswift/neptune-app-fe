"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  YES_NO_OPTIONS,
  filterTreatmentsForSeverity,
  normalizeGender,
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
import { userGenderQueryKey } from "@/hooks/use-user-queries";
import { getUserGenderById } from "@/services/user.service";
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
  // No default severity: the intake report is the reporter's best guess, and
  // a pre-selected answer would read as a deliberate one.
  if (!form.severity) {
    return "Pick a severity — your best guess is fine, EHS confirms it later.";
  }

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
  if (!form.classifications.tempWorker) {
    return 'Answer "Temp / Non-Employee Involved?".';
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
   * Gender is never asked — employees carry it on their profile. Picking from
   * the site roster stamps it silently for the submit payload; free-typed
   * names leave it blank.
   */
  const handlePersonChange = (person: ReportPersonSelection) => {
    const identity = {
      affectedPerson: person.name,
      affectedPersonId: person.userId,
    };

    if (person.gender) {
      genderRequestRef.current = person.userId;
      onChange({ ...identity, gender: person.gender, genderFromProfile: true });
      return;
    }

    onChange({ ...identity, gender: "", genderFromProfile: false });
    genderRequestRef.current = person.userId;

    if (!person.userId) {
      return;
    }

    const userId = Number(person.userId);
    void queryClient
      .fetchQuery({
        queryKey: userGenderQueryKey(userId),
        queryFn: () => getUserGenderById(userId),
        staleTime: Infinity,
      })
      .then((raw) => {
        const resolved = normalizeGender(raw);
        if (!resolved || genderRequestRef.current !== person.userId) {
          return;
        }

        onChange({ gender: resolved, genderFromProfile: true });
      })
      .catch(() => {
        // Silent — gender is not a reporter question.
      });
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
   * Severity is picked once, here; OSHA recordability and DART are derived
   * from it (see report-classification.ts) and never asked.
   *
   * Fatality is the one severity that answers two step 4 questions on its own:
   * OSHA must be notified (1904.39, 8-hour clock) and SIF potential is
   * implied. Both stay editable — these are suggestions, not locks.
   */
  const handleSeverityChange = (severity: SeverityId) => {
    // Drop treatments the new severity no longer allows (e.g. First Aid
    // cannot keep ER / medical-beyond-first-aid).
    const nextTreatments = filterTreatmentsForSeverity(
      severity,
      form.initialTreatment,
    );

    if (severity === "fatality") {
      onChange({
        severity,
        initialTreatment: nextTreatments,
        oshaNotificationRequired: "Yes",
        classifications: { ...form.classifications, serious: "Yes" },
      });
      return;
    }

    onChange({ severity, initialTreatment: nextTreatments });
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
            Pick the outcome severity, then capture where and when it occurred.
          </Text>
        </div>

        <ReportSeverityPicker
          value={form.severity}
          onChange={handleSeverityChange}
          trailingHint="Your best guess drives the initial classification. EHS confirms it later."
          className="pt-3"
        />

        <div className="flex flex-col pt-[18px]">
          <ReportSiteField
            label="Plant / Location"
            required
            value={form.location}
            onChange={(location) => onChange({ location })}
            siteName={site.name}
            isLoading={site.isLoading}
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

          <ReportPersonSearchField
            label="Affected person"
            required
            value={form.affectedPerson}
            selectedUserId={form.affectedPersonId}
            onChange={handlePersonChange}
            siteId={site.id}
            siteName={site.name}
            trailingHint="Search employees at your site."
            placeholder="Start typing a name…"
          />

          <div className="pt-3 pb-[18px] sm:max-w-[50%]">
            <ReportSelectField
              label="Temp / Non-Employee Involved?"
              required
              hint="Contractor, agency worker or visitor without an account here."
              value={form.classifications.tempWorker ?? ""}
              onChange={(answer) =>
                onChange({
                  classifications: {
                    ...form.classifications,
                    tempWorker: answer as "Yes" | "No",
                  },
                })
              }
              options={[...YES_NO_OPTIONS]}
            />
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
