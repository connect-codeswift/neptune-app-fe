/** One shift row in the PUT /api/v1/sites/work-weeks body. */
export type SaveSiteWorkWeekShiftRequestDto = {
  title: string;
  /** 24-hour "HH:mm". */
  startTime: string;
  /** 24-hour "HH:mm". May be earlier than `startTime` — the shift crosses midnight. */
  endTime: string;
  /** People on this shift, not the site total. */
  headcount: number;
};

/**
 * Request body for PUT /api/v1/sites/work-weeks.
 *
 * `weekStartDate` may be any date inside the target week; the server snaps it to the Monday.
 */
export type SaveSiteWorkWeekRequestDto = {
  weekStartDate: string;
  /** ISO weekdays, 1 = Monday … 7 = Sunday. */
  workingDays: number[];
  shifts: SaveSiteWorkWeekShiftRequestDto[];
};
