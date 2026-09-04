import { describe, expect, it } from "vitest";
import {
  REGISTER_STATUS_FILTERS,
  formatRunStatus,
  toApiStatusFilter,
} from "@/lib/audit-inspection-status";

describe("formatRunStatus", () => {
  it.each([
    ["InProgress", "In progress"],
    ["Completed", "Closed"],
  ])("relabels the API value %s as %s", (api, display) => {
    expect(formatRunStatus(api)).toBe(display);
  });

  it.each(["Scheduled", "Submitted", "Overdue", "Cancelled"])(
    "shows %s as the API spells it",
    (status) => {
      expect(formatRunStatus(status)).toBe(status);
    },
  );

  it("trims surrounding whitespace before matching", () => {
    expect(formatRunStatus("  InProgress  ")).toBe("In progress");
  });

  it("passes an unrecognised status through rather than blanking it", () => {
    expect(formatRunStatus("Archived")).toBe("Archived");
  });

  it("is case sensitive, matching the API contract exactly", () => {
    // The contract pins the casing; a value that differs is not the same status.
    expect(formatRunStatus("inprogress")).toBe("inprogress");
  });
});

describe("toApiStatusFilter", () => {
  it("drops the param entirely for All", () => {
    expect(toApiStatusFilter("All")).toBeUndefined();
  });

  it.each([
    ["In progress", "InProgress"],
    ["Closed", "Completed"],
  ])("maps the display label %s back to the API value %s", (display, api) => {
    expect(toApiStatusFilter(display)).toBe(api);
  });

  it.each(["Scheduled", "Submitted", "Overdue", "Cancelled"])(
    "sends %s unchanged",
    (status) => {
      expect(toApiStatusFilter(status)).toBe(status);
    },
  );

  it("round-trips every filter the toolbar offers", () => {
    // A label the toolbar shows but the mapping cannot translate would silently
    // filter on a value the API does not recognise.
    for (const filter of REGISTER_STATUS_FILTERS) {
      if (filter === "All") continue;

      const apiValue = toApiStatusFilter(filter);

      expect(apiValue).toBeDefined();
      expect(formatRunStatus(apiValue as string)).toBe(filter);
    }
  });
});
