import { describe, expect, it } from "vitest";
import {
  formatOrganizationLimitsBannerMessage,
  getOrganizationLimitsState,
  shouldShowOrganizationLimitsBanner,
} from "@/lib/organization-limits";

function session(overrides: {
  maxSeats: number;
  seatsUsed: number;
  seatsAvailable?: number | null;
  atSeatLimit?: boolean;
}) {
  return {
    maxSeats: overrides.maxSeats,
    seatsUsed: overrides.seatsUsed,
    seatsAvailable: overrides.seatsAvailable ?? null,
    atSeatLimit: overrides.atSeatLimit ?? false,
  } as Parameters<typeof getOrganizationLimitsState>[0];
}

describe("getOrganizationLimitsState", () => {
  it("reads the seat counts off the session", () => {
    const state = getOrganizationLimitsState(
      session({ maxSeats: 50, seatsUsed: 30, seatsAvailable: 20 }),
    );

    expect(state).toEqual({
      maxSeats: 50,
      seatsUsed: 30,
      seatsAvailable: 20,
      atSeatLimit: false,
    });
  });

  it("defaults a missing seatsAvailable to zero", () => {
    const state = getOrganizationLimitsState(
      session({ maxSeats: 50, seatsUsed: 30, seatsAvailable: null }),
    );

    expect(state?.seatsAvailable).toBe(0);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
  ])("returns null when the session is %s", (_label, value) => {
    expect(getOrganizationLimitsState(value)).toBeNull();
  });

  it("returns null for an org with no seat cap", () => {
    // maxSeats of 0 means uncapped, not "no seats left" - a banner here would be
    // wrong on every page load.
    expect(
      getOrganizationLimitsState(session({ maxSeats: 0, seatsUsed: 30 })),
    ).toBeNull();
  });
});

describe("shouldShowOrganizationLimitsBanner", () => {
  it("stays hidden when there are no limits to report", () => {
    expect(shouldShowOrganizationLimitsBanner(null)).toBe(false);
  });

  it("shows when the org is at its seat limit", () => {
    expect(
      shouldShowOrganizationLimitsBanner({
        maxSeats: 50,
        seatsUsed: 50,
        seatsAvailable: 0,
        atSeatLimit: true,
      }),
    ).toBe(true);
  });

  it.each([
    ["exactly at the 90% threshold", 45, true],
    ["just over the threshold", 46, true],
    ["just under the threshold", 44, false],
    ["well under", 10, false],
  ])("with 50 seats and %s used, shows: %s", (_label, seatsUsed, expected) => {
    expect(
      shouldShowOrganizationLimitsBanner({
        maxSeats: 50,
        seatsUsed,
        seatsAvailable: 50 - seatsUsed,
        atSeatLimit: false,
      }),
    ).toBe(expected);
  });

  it("shows when usage has run past the cap", () => {
    expect(
      shouldShowOrganizationLimitsBanner({
        maxSeats: 50,
        seatsUsed: 60,
        seatsAvailable: 0,
        atSeatLimit: false,
      }),
    ).toBe(true);
  });

  it("does not divide by zero when maxSeats is zero", () => {
    // A 0/0 ratio is NaN, which compares false - but the flag must still win.
    expect(
      shouldShowOrganizationLimitsBanner({
        maxSeats: 0,
        seatsUsed: 0,
        seatsAvailable: 0,
        atSeatLimit: false,
      }),
    ).toBe(false);

    expect(
      shouldShowOrganizationLimitsBanner({
        maxSeats: 0,
        seatsUsed: 0,
        seatsAvailable: 0,
        atSeatLimit: true,
      }),
    ).toBe(true);
  });
});

describe("formatOrganizationLimitsBannerMessage", () => {
  it("says the limit is reached, with the counts, when at the cap", () => {
    const message = formatOrganizationLimitsBannerMessage({
      maxSeats: 50,
      seatsUsed: 50,
      seatsAvailable: 0,
      atSeatLimit: true,
    });

    expect(message).toContain("reached its user seat limit (50/50)");
    expect(message).toContain("before inviting more users");
  });

  it("says the limit is approaching when merely close", () => {
    const message = formatOrganizationLimitsBannerMessage({
      maxSeats: 50,
      seatsUsed: 46,
      seatsAvailable: 4,
      atSeatLimit: false,
    });

    expect(message).toContain("approaching its user seat limit (46/50)");
    expect(message).not.toContain("reached");
  });
});
