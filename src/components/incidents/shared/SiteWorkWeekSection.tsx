"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { TextInput } from "@/components/inputs/TextInput";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useSiteWorkHoursQuery } from "@/hooks/use-incident-kpi-queries";
import { useSaveSiteWorkWeekMutation } from "@/hooks/use-site-work-week-mutations";
import {
  useRecentSiteWorkWeeksQuery,
  useSiteWorkWeekQuery,
} from "@/hooks/use-site-work-week-queries";
import { useCapabilities } from "@/lib/capabilities";
import { toast } from "@/lib/toast";
import {
  hasSufficientSiteWorkHours,
  MIN_WORK_HOURS_FOR_RATES,
  sumSiteWorkHoursForYear,
} from "@/services/mappers/incident-kpi.mapper";
import {
  addWeeks,
  emptyShiftDraft,
  formatHoursTotal,
  formatWeekRange,
  formatWeekStartShort,
  ISO_WEEKDAY_LABELS,
  ISO_WEEKDAYS,
  isWeekSaved,
  previewDailyHours,
  previewHeadcount,
  previewWeekHours,
  shiftHours,
  startOfIsoWeek,
  toIsoDateParam,
  toShiftDrafts,
  type WorkWeekShiftDraft,
} from "@/services/mappers/site-work-week.mapper";

const RECENT_WEEKS = 6;

/** Mirrors the server HH:mm 24-hour check, so a bad time fails before the round trip. */
const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

type WorkWeekForm = Readonly<{
  workingDays: readonly number[];
  shifts: readonly WorkWeekShiftDraft[];
}>;

const EMPTY_FORM: WorkWeekForm = { workingDays: [], shifts: [] };

function SavedBadge(props: Readonly<{ isSaved: boolean }>) {
  const { isSaved } = props;

  return (
    <span
      className={
        isSaved
          ? "text8 text-ehs-green bg-ehs-green/10 rounded-full px-2.5 py-1 font-medium uppercase"
          : "text8 text-ehs-yellow bg-ehs-yellow/15 rounded-full px-2.5 py-1 font-medium uppercase"
      }
    >
      {isSaved ? "Saved" : "Not saved yet"}
    </span>
  );
}

export type SiteWorkWeekSectionProps = Readonly<{
  className?: string;
}>;

/**
 * Weekly working-hours entry — the shift pattern RIR and LTIR divide by.
 *
 * Replaces the twelve monthly boxes. Hours are no longer typed as a lump sum: a manager
 * confirms which days the site ran and who worked each shift, and the backend derives the
 * hours from that. The `dailyHours` on a response stays authoritative; the totals shown
 * while typing are a preview only.
 */
export function SiteWorkWeekSection(props: Readonly<SiteWorkWeekSectionProps>) {
  const { className = "" } = props;

  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const { can } = useCapabilities();
  const canEdit = can("Incident.ManageWorkHours");

  const [weekStart, setWeekStart] = useState(() => startOfIsoWeek(new Date()));
  const [form, setForm] = useState<WorkWeekForm>(EMPTY_FORM);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [nextShiftKey, setNextShiftKey] = useState(0);

  const weekParam = toIsoDateParam(weekStart);
  const weekQuery = useSiteWorkWeekQuery(weekParam, isClientReady && hasToken);
  const recentQuery = useRecentSiteWorkWeeksQuery(
    RECENT_WEEKS,
    isClientReady && hasToken,
  );
  // The monthly rollup this screen exists to produce. Saving a week recalculates that month's
  // SiteWorkHours server-side, so these are derived figures, never typed — and they are what
  // RIR and LTIR actually divide by. The save mutation invalidates this query with the rest.
  const workHoursQuery = useSiteWorkHoursQuery(isClientReady && hasToken);
  const saveMutation = useSaveSiteWorkWeekMutation();

  const week = weekQuery.data?.dataModel ?? null;

  // Adjust the draft during render when a different week arrives, rather than from an effect:
  // writing state in an effect costs a second pass and trips react-hooks/set-state-in-effect.
  if (week && hydratedFor !== weekParam) {
    setHydratedFor(weekParam);
    setForm({
      workingDays: week.workingDays,
      shifts: toShiftDrafts(week.shifts),
    });
  }

  const isSaved = isWeekSaved(week);
  const dailyHours = previewDailyHours(form.shifts);
  const weekHours = previewWeekHours(form.shifts, form.workingDays);
  const headcount = previewHeadcount(form.shifts);

  // The monthly figure this screen exists to produce. Read from the server, never estimated:
  // the backend walks the month a day at a time, so a week spanning two months splits exactly
  // and no 4.33-weeks fudge is involved.
  const workHoursRecords = workHoursQuery.data?.dataModel ?? [];
  const shownYear = weekStart.getUTCFullYear();
  const shownMonth = weekStart.getUTCMonth() + 1;
  const monthHours =
    workHoursRecords.find(
      (record) => record.year === shownYear && record.month === shownMonth,
    )?.hours ?? 0;
  // Same gate the KPI tiles and the missing-hours banner use — called, not re-derived, so the
  // two can never disagree about whether rates are live.
  const ratesReady = hasSufficientSiteWorkHours(workHoursRecords, shownYear);
  // Only used to tell the user how far short they are; the gate itself is the helper above.
  const ytdHours = sumSiteWorkHoursForYear(workHoursRecords, shownYear);
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    timeZone: "UTC",
  }).format(weekStart);

  const toggleDay = (day: number) => {
    setForm((current) => ({
      ...current,
      workingDays: current.workingDays.includes(day)
        ? current.workingDays.filter((entry) => entry !== day)
        : [...current.workingDays, day].sort((left, right) => left - right),
    }));
  };

  const updateShift = (
    key: string,
    field: keyof Omit<WorkWeekShiftDraft, "key">,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      shifts: current.shifts.map((shift) =>
        shift.key === key ? { ...shift, [field]: value } : shift,
      ),
    }));
  };

  const addShift = () => {
    setForm((current) => ({
      ...current,
      shifts: [
        ...current.shifts,
        emptyShiftDraft(`new-${String(nextShiftKey)}`),
      ],
    }));
    setNextShiftKey((current) => current + 1);
  };

  const removeShift = (key: string) => {
    setForm((current) => ({
      ...current,
      shifts: current.shifts.filter((shift) => shift.key !== key),
    }));
  };

  const handleSave = async () => {
    if (!canEdit || saveMutation.isPending) {
      return;
    }

    if (form.workingDays.length === 0) {
      toast.error("Select at least one working day.");
      return;
    }

    if (form.shifts.length === 0) {
      toast.error("Add at least one shift.");
      return;
    }

    for (const shift of form.shifts) {
      const shiftLabel = shift.title.trim() || "every shift";

      if (
        !CLOCK_TIME_PATTERN.test(shift.startTime) ||
        !CLOCK_TIME_PATTERN.test(shift.endTime)
      ) {
        toast.error(`Enter a start and end time for ${shiftLabel}.`);
        return;
      }

      const shiftHeadcount = Number(shift.headcount.trim());
      if (!Number.isFinite(shiftHeadcount) || shiftHeadcount < 0) {
        toast.error(`Enter a valid headcount for ${shiftLabel}.`);
        return;
      }
    }

    if (headcount <= 0) {
      toast.error("Total headcount across shifts must be greater than zero.");
      return;
    }

    try {
      await saveMutation.mutateAsync({
        weekStartDate: weekStart.toISOString(),
        workingDays: [...form.workingDays],
        shifts: form.shifts.map((shift) => ({
          title: shift.title.trim(),
          startTime: shift.startTime,
          endTime: shift.endTime,
          headcount: Number(shift.headcount.trim()) || 0,
        })),
      });
      // Let the refetched week re-hydrate the form, so what is on screen is what was stored.
      setHydratedFor(null);
      toast.success("Work week saved. Recordable rates will refresh.");
    } catch (error) {
      toast.error(
        getMutationErrorMessage(error, "Could not save the week. Try again."),
      );
    }
  };

  const goToWeek = (offset: number) => {
    setWeekStart((current) => addWeeks(current, offset));
    setHydratedFor(null);
  };

  if (!isClientReady || !hasToken) {
    return null;
  }

  if (weekQuery.isLoading) {
    return (
      <IncidentGlassCard className={className}>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-4 h-40 w-full" />
      </IncidentGlassCard>
    );
  }

  if (weekQuery.isError) {
    return (
      <IncidentGlassCard className={className}>
        <Text as="h2" className="text3 text-ehs-darker">
          Working Hours
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text mt-2">
          {getMutationErrorMessage(
            weekQuery.error,
            "Could not load the work week.",
          )}
        </Text>
        <Button
          type="button"
          variant="secondary"
          className="text4 mt-4 self-start"
          onClick={() => void weekQuery.refetch()}
        >
          Try again
        </Button>
      </IncidentGlassCard>
    );
  }

  const recentWeeks = recentQuery.data?.dataModel ?? [];

  return (
    <IncidentGlassCard className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Text as="h2" className="text3 text-ehs-darker">
            Working Hours
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text mt-1 max-w-2xl">
            Confirm the crew that worked each week. Hours are calculated from
            the shifts and headcount below, and feed the Recordable and Lost
            Time rates.
          </Text>
        </div>

        {canEdit ? (
          <Button
            type="button"
            variant="primary"
            className="text4"
            disabled={saveMutation.isPending}
            onClick={() => {
              void handleSave();
            }}
          >
            {saveMutation.isPending ? "Saving…" : "Save week"}
          </Button>
        ) : (
          <Text
            as="p"
            className="text8 text-ehs-muted-text max-w-xs text-right"
          >
            Contact your EHS Manager to update working hours.
          </Text>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="border-ehs-hairline/70 rounded-2.5 flex items-center gap-2 border px-2 py-1.5">
          <button
            type="button"
            aria-label="Previous week"
            className="text-ehs-muted-text hover:text-ehs-darker rounded-full p-1 transition-colors"
            onClick={() => {
              goToWeek(-1);
            }}
          >
            <Icon
              icon="mdi:chevron-left"
              className="size-5"
              aria-hidden="true"
            />
          </button>
          <Text as="span" className="text4 text-ehs-darker px-1">
            {formatWeekRange(weekStart)}
          </Text>
          <button
            type="button"
            aria-label="Next week"
            className="text-ehs-muted-text hover:text-ehs-darker rounded-full p-1 transition-colors"
            onClick={() => {
              goToWeek(1);
            }}
          >
            <Icon
              icon="mdi:chevron-right"
              className="size-5"
              aria-hidden="true"
            />
          </button>
        </div>
        <SavedBadge isSaved={isSaved} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {recentWeeks.map((entry) => (
          <div
            key={entry.weekStartDate}
            className="border-ehs-hairline/70 bg-ehs-surface/40 rounded-2.5 border px-3 py-2.5"
          >
            <Text as="p" className="text8 text-ehs-muted-text">
              {formatWeekStartShort(entry.weekStartDate)}
            </Text>
            <Text as="p" className="text3 text-ehs-darker mt-0.5">
              {formatHoursTotal(entry.weekHours)}
            </Text>
            <Text
              as="p"
              className={
                entry.isSaved
                  ? "text8 text-ehs-green mt-1 uppercase"
                  : "text8 text-ehs-muted-text mt-1 uppercase"
              }
            >
              {entry.isSaved ? "Saved" : "Not entered"}
            </Text>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Text as="h3" className="text5 text-ehs-darker">
          Active days
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text mt-1">
          Days the site ran this week. Untick a public holiday or a shutdown
          day.
        </Text>
        <div className="mt-3 flex flex-wrap gap-2">
          {ISO_WEEKDAYS.map((day) => {
            const isActive = form.workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={isActive}
                disabled={!canEdit || saveMutation.isPending}
                className={[
                  "text4 rounded-2.5 border px-4 py-2 transition-colors",
                  isActive
                    ? "border-ehs-normal-blue text-ehs-normal-blue bg-ehs-normal-blue/10"
                    : "border-ehs-hairline/70 text-ehs-muted-text",
                  canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                ].join(" ")}
                onClick={() => {
                  toggleDay(day);
                }}
              >
                {ISO_WEEKDAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <Text as="h3" className="text5 text-ehs-darker">
          Shifts
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text mt-1">
          Headcount is how many people worked that shift — not the site total.
        </Text>

        <div className="mt-3 flex flex-col gap-3">
          {form.shifts.map((shift) => (
            <div
              key={shift.key}
              className="flex flex-wrap items-end gap-3 sm:flex-nowrap"
            >
              <TextInput
                label="Shift"
                labelClassName="text7 text-ehs-darker block"
                wrapperClassName="flex min-w-0 flex-1 flex-col gap-1.5"
                placeholder="Morning"
                disabled={!canEdit || saveMutation.isPending}
                value={shift.title}
                onChange={(event) => {
                  updateShift(shift.key, "title", event.target.value);
                }}
              />
              <TextInput
                label="Start"
                labelClassName="text7 text-ehs-darker block"
                wrapperClassName="flex w-32 flex-col gap-1.5"
                placeholder="06:00"
                type="time"
                disabled={!canEdit || saveMutation.isPending}
                value={shift.startTime}
                onChange={(event) => {
                  updateShift(shift.key, "startTime", event.target.value);
                }}
              />
              <TextInput
                label="End"
                labelClassName="text7 text-ehs-darker block"
                wrapperClassName="flex w-32 flex-col gap-1.5"
                placeholder="14:00"
                type="time"
                disabled={!canEdit || saveMutation.isPending}
                value={shift.endTime}
                onChange={(event) => {
                  updateShift(shift.key, "endTime", event.target.value);
                }}
              />
              <TextInput
                label="Headcount"
                labelClassName="text7 text-ehs-darker block"
                wrapperClassName="flex w-32 flex-col gap-1.5"
                placeholder="0"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                disabled={!canEdit || saveMutation.isPending}
                value={shift.headcount}
                onChange={(event) => {
                  updateShift(shift.key, "headcount", event.target.value);
                }}
              />
              <Text
                as="span"
                className="text8 text-ehs-muted-text w-10 shrink-0 pb-3"
              >
                {`${formatHoursTotal(shiftHours(shift.startTime, shift.endTime))}h`}
              </Text>
              {canEdit ? (
                <button
                  type="button"
                  aria-label={`Remove ${shift.title.trim() || "shift"}`}
                  className="text-ehs-muted-text hover:text-ehs-red shrink-0 pb-3 transition-colors"
                  disabled={saveMutation.isPending}
                  onClick={() => {
                    removeShift(shift.key);
                  }}
                >
                  <Icon
                    icon="mdi:close"
                    className="size-5"
                    aria-hidden="true"
                  />
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {canEdit ? (
          <button
            type="button"
            className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover mt-3 transition-colors"
            disabled={saveMutation.isPending}
            onClick={addShift}
          >
            + Add shift
          </button>
        ) : null}
      </div>

      <div className="border-ehs-hairline/70 mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t pt-4">
        <Text as="p" className="text8 text-ehs-muted-text">
          {`Headcount: ${formatHoursTotal(headcount)}`}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          {`Per day: ${formatHoursTotal(dailyHours)} hrs`}
        </Text>
        <Text as="p" className="text5 text-ehs-darker">
          {`This week: ${formatHoursTotal(weekHours)} hrs`}
        </Text>
      </div>

      {/*
        The point of weekly entry: the monthly hours OSHA rates divide by. Read from the server,
        never estimated - the backend walks the month a day at a time, so a week spanning two
        months splits exactly. It moves only once a week is saved, so an edited-but-unsaved week
        deliberately does not appear here.
      */}
      <div className="border-ehs-hairline/70 bg-ehs-surface/40 rounded-2.5 mt-4 border px-4 py-3">
        <Text as="p" className="text8 text-ehs-muted-text">
          {`${monthLabel} ${String(shownYear)} — total`}
        </Text>
        <Text as="p" className="text3 text-ehs-darker mt-0.5">
          {`${formatHoursTotal(monthHours)} hrs`}
        </Text>
        {/*
          Only when rates are NOT live. The section description already explains the formula, so
          saying "rates are being calculated" adds nothing - but the 5,000-hour floor below which
          CalculateRate returns 0 is stated nowhere else, and without it a site with some hours
          entered sees rates of 0 and reads it as a bug.
        */}
        {ratesReady ? null : (
          <Text as="p" className="text8 text-ehs-yellow mt-2">
            {`${formatHoursTotal(Math.max(0, MIN_WORK_HOURS_FOR_RATES - ytdHours))} more hours needed this year before RIR and LTIR are calculated.`}
          </Text>
        )}
      </div>
    </IncidentGlassCard>
  );
}
