"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { TextInput } from "@/components/inputs/TextInput";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useSaveSiteWorkHoursMutation } from "@/hooks/use-incident-kpi-mutations";
import { useSiteWorkHoursQuery } from "@/hooks/use-incident-kpi-queries";
import { getCurrentUser } from "@/lib/current-user";
import { toast } from "@/lib/toast";
import {
  hasSiteWorkHours,
  MIN_WORK_HOURS_FOR_RATES,
  sumSiteWorkHoursForYear,
} from "@/services/mappers/incident-kpi.mapper";

const MIN_MONTHLY_WORK_HOURS = 1000;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function canManageSiteWorkHours(): boolean {
  const { role } = getCurrentUser();
  if (!role) {
    return false;
  }

  const normalized = role.trim().toLowerCase().replace(/[-_]+/g, " ");
  return normalized === "ehs manager" || normalized === "ehs director";
}

function formatHoursTotal(hours: number): string {
  return hours.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export type SiteWorkHoursSectionProps = Readonly<{
  className?: string;
}>;

export function SiteWorkHoursSection(props: Readonly<SiteWorkHoursSectionProps>) {
  const { className = "" } = props;
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const canEdit = canManageSiteWorkHours();

  const currentYear = new Date().getUTCFullYear();
  const workHoursQuery = useSiteWorkHoursQuery(isClientReady && hasToken);
  const saveMutation = useSaveSiteWorkHoursMutation();
  const [draftHours, setDraftHours] = useState<Record<number, string>>({});

  const records = workHoursQuery.data?.dataModel ?? [];

  const savedByMonth = useMemo(() => {
    const map: Record<number, number> = {};
    for (const record of records) {
      if (record.year === currentYear) {
        map[record.month] = record.hours;
      }
    }
    return map;
  }, [records, currentYear]);

  const ytdHours = sumSiteWorkHoursForYear(records, currentYear);
  const hasHours = hasSiteWorkHours(records);

  const getDisplayValue = (month: number): string => {
    if (draftHours[month] !== undefined) {
      return draftHours[month]!;
    }

    const saved = savedByMonth[month];
    return saved != null ? String(saved) : "";
  };

  const handleSave = async () => {
    if (!canEdit || saveMutation.isPending) {
      return;
    }

    const updates: { month: number; hours: number }[] = [];

    for (let month = 1; month <= 12; month += 1) {
      const raw = getDisplayValue(month).trim();
      if (!raw) {
        continue;
      }

      const hours = Number(raw);
      if (!Number.isFinite(hours) || hours < 0) {
        toast.error(`Enter a valid hour total for ${MONTH_LABELS[month - 1]}.`);
        return;
      }

      if (hours > 0 && hours < MIN_MONTHLY_WORK_HOURS) {
        toast.error(
          `${MONTH_LABELS[month - 1]} needs at least ${String(MIN_MONTHLY_WORK_HOURS)} workforce hours (you entered ${String(Math.round(hours))}).`,
        );
        return;
      }

      if (savedByMonth[month] === hours) {
        continue;
      }

      updates.push({ month, hours });
    }

    if (updates.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    try {
      await Promise.all(
        updates.map(({ month, hours }) =>
          saveMutation.mutateAsync({ year: currentYear, month, hours }),
        ),
      );
      setDraftHours({});
      toast.success("Site work hours saved. Recordable rates will refresh.");
    } catch (error) {
      toast.error(
        getMutationErrorMessage(error, "Could not save work hours. Try again."),
      );
    }
  };

  if (!isClientReady) {
    return null;
  }

  if (!hasToken) {
    return null;
  }

  if (workHoursQuery.isLoading) {
    return (
      <IncidentGlassCard className={className}>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-4 h-24 w-full" />
      </IncidentGlassCard>
    );
  }

  return (
    <IncidentGlassCard className={className}>
      {!hasHours ? (
        <div className="border-ehs-yellow/30 bg-ehs-yellow/10 mb-4 flex items-start gap-3 rounded-xl border px-4 py-3">
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-yellow mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <Text as="p" className="text-ehs-darker text-sm font-semibold">
              Work hours required for Recordable Rate
            </Text>
            <Text as="p" className="text-ehs-muted-text mt-1 text-sm leading-snug">
              RIR and LTIR stay at 0 until monthly hours are entered for this
              site. Add hours below to calculate rates per 200,000 hours worked.
            </Text>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Text
            as="h2"
            className="text-ehs-darker text-base font-bold tracking-tight"
          >
            Site Work Hours
          </Text>
          <Text
            as="p"
            className="text-ehs-muted-text mt-1 text-sm"
          >{`${String(currentYear)} year-to-date: ${formatHoursTotal(ytdHours)} hrs`}</Text>
          <Text
            as="p"
            className="text-ehs-muted-text mt-2 max-w-2xl text-xs leading-snug"
          >{`Enter total employee hours worked each month (e.g. 16,000 for ~100 FTEs). Rates need at least ${MIN_WORK_HOURS_FOR_RATES.toLocaleString()} YTD hours before they display.`}</Text>
        </div>

        {canEdit ? (
          <Button
            type="button"
            variant="primary"
            disabled={saveMutation.isPending}
            onClick={() => {
              void handleSave();
            }}
          >
            {saveMutation.isPending ? "Saving…" : "Save hours"}
          </Button>
        ) : (
          <Text as="p" className="text-ehs-muted-text max-w-xs text-right text-xs">
            Contact your EHS Manager to update hours.
          </Text>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {MONTH_LABELS.map((label, index) => {
          const month = index + 1;
          return (
            <TextInput
              key={label}
              label={`${label} ${String(currentYear)}`}
              placeholder="0"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              disabled={!canEdit || saveMutation.isPending}
              value={getDisplayValue(month)}
              onChange={(event) => {
                setDraftHours((current) => ({
                  ...current,
                  [month]: event.target.value,
                }));
              }}
            />
          );
        })}
      </div>
    </IncidentGlassCard>
  );
}
