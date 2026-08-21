import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** One shift row as returned by the work-week endpoints. */
export type SiteWorkWeekShiftDto = {
  title: string;
  /** 24-hour "HH:mm". */
  startTime: string;
  /** 24-hour "HH:mm". Earlier than `startTime` when the shift crosses midnight. */
  endTime: string;
  /** People on this shift, not the site total. */
  headcount: number;
};

/** dataModel shape for GET /api/v1/sites/work-weeks. */
export type SiteWorkWeekDto = {
  /** 0 when nothing has been saved for this week yet. */
  id: number;
  weekStartDate: string;
  /** ISO weekdays, 1 = Monday … 7 = Sunday. */
  workingDays: readonly number[];
  shifts: readonly SiteWorkWeekShiftDto[];
  /** Person-hours for one working day. Server-computed and authoritative. */
  dailyHours: number;
  /** `dailyHours` x the number of working days. Server-computed. */
  weekHours: number;
  headcount: number;
  /**
   * True when the API returned the previous week's pattern as a starting point and
   * nothing has been written for this week. Render the form filled in, badged as unsaved.
   */
  isDraft: boolean;
  updatedAt: string | null;
};

/** One entry in GET /api/v1/sites/work-weeks/recent. */
export type RecentSiteWorkWeekDto = {
  weekStartDate: string;
  weekHours: number;
  /** False means the week was never entered — a gap in the rate denominator. */
  isSaved: boolean;
};

export type GetSiteWorkWeekResponseDto = ApiEnvelopeDto<SiteWorkWeekDto | null>;

export type GetRecentSiteWorkWeeksResponseDto = ApiEnvelopeDto<
  readonly RecentSiteWorkWeekDto[] | null
>;

export type SaveSiteWorkWeekResponseDto = ApiEnvelopeDto<unknown>;
