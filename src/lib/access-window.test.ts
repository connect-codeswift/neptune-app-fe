/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  consumeAuthRedirectMessage,
  formatAccessWindowRemaining,
  getCachedAccessWindow,
  readAccessWindowFromAuthPayload,
  setAuthRedirectMessage,
  setCachedAccessWindow,
  shouldShowAccessWindowBanner,
  unwrapAuthPayload,
} from "@/lib/access-window";

describe("unwrapAuthPayload", () => {
  it("unwraps the standard API envelope", () => {
    expect(unwrapAuthPayload({ dataModel: { accessToken: "abc" } })).toEqual({
      accessToken: "abc",
    });
  });

  it("unwraps a PascalCase envelope", () => {
    // The API has shipped both spellings; reading only one loses the window.
    expect(unwrapAuthPayload({ DataModel: { accessToken: "abc" } })).toEqual({
      accessToken: "abc",
    });
  });

  it("tolerates a bare payload with no envelope", () => {
    expect(unwrapAuthPayload({ accessToken: "abc" })).toEqual({
      accessToken: "abc",
    });
  });

  it("treats a non-object dataModel as the payload itself", () => {
    expect(unwrapAuthPayload({ dataModel: "nope", other: 1 })).toEqual({
      dataModel: "nope",
      other: 1,
    });
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["a string", "nope"],
    ["a number", 42],
  ])("returns null for %s", (_label, value) => {
    expect(unwrapAuthPayload(value)).toBeNull();
  });
});

describe("readAccessWindowFromAuthPayload", () => {
  it("reads the window out of an enveloped login response", () => {
    const window = readAccessWindowFromAuthPayload({
      dataModel: {
        accessExpiresAt: "2026-12-31T00:00:00Z",
        accessDaysRemaining: 14,
      },
    });

    expect(window).toEqual({
      accessExpiresAt: "2026-12-31T00:00:00Z",
      daysRemaining: 14,
    });
  });

  it.each([
    ["accessDaysRemaining", "accessDaysRemaining"],
    ["AccessDaysRemaining", "AccessDaysRemaining"],
    ["daysRemaining", "daysRemaining"],
    ["DaysRemaining", "DaysRemaining"],
  ])("accepts the day count under the key %s", (_label, key) => {
    const window = readAccessWindowFromAuthPayload({
      accessExpiresAt: "2026-12-31T00:00:00Z",
      [key]: 14,
    });

    expect(window?.daysRemaining).toBe(14);
  });

  it("accepts a numeric day count sent as a string", () => {
    const window = readAccessWindowFromAuthPayload({
      accessExpiresAt: "2026-12-31T00:00:00Z",
      accessDaysRemaining: "14",
    });

    expect(window?.daysRemaining).toBe(14);
  });

  it("truncates a fractional day count", () => {
    const window = readAccessWindowFromAuthPayload({
      accessExpiresAt: "2026-12-31T00:00:00Z",
      accessDaysRemaining: 14.9,
    });

    expect(window?.daysRemaining).toBe(14);
  });

  it("keeps a zero day count rather than reading it as absent", () => {
    // Zero is the last day of the window - the one the banner most needs to show.
    const window = readAccessWindowFromAuthPayload({
      accessExpiresAt: "2026-12-31T00:00:00Z",
      accessDaysRemaining: 0,
    });

    expect(window?.daysRemaining).toBe(0);
  });

  it("keeps a negative day count for an already-expired window", () => {
    const window = readAccessWindowFromAuthPayload({
      accessExpiresAt: "2026-01-01T00:00:00Z",
      accessDaysRemaining: -3,
    });

    expect(window?.daysRemaining).toBe(-3);
  });

  it.each([
    ["the expiry is missing", { accessDaysRemaining: 14 }],
    ["the expiry is blank", { accessExpiresAt: "  ", accessDaysRemaining: 14 }],
    ["the day count is missing", { accessExpiresAt: "2026-12-31T00:00:00Z" }],
    [
      "the day count is not a number",
      { accessExpiresAt: "2026-12-31T00:00:00Z", accessDaysRemaining: "soon" },
    ],
    ["the payload is not an object", "nope"],
  ])("returns null when %s", (_label, payload) => {
    expect(readAccessWindowFromAuthPayload(payload)).toBeNull();
  });

  it("returns null for a login response with no window at all", () => {
    // Most orgs are not time-boxed; a window must not be invented for them.
    expect(
      readAccessWindowFromAuthPayload({ dataModel: { accessToken: "abc" } }),
    ).toBeNull();
  });
});

describe("shouldShowAccessWindowBanner", () => {
  it("shows once the org has a time-boxed window", () => {
    expect(shouldShowAccessWindowBanner("2026-12-31T00:00:00Z")).toBe(true);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
  ])("stays hidden for %s", (_label, value) => {
    expect(shouldShowAccessWindowBanner(value)).toBe(false);
  });
});

describe("formatAccessWindowRemaining", () => {
  it("counts plural days", () => {
    expect(formatAccessWindowRemaining(14)).toBe("14 days left");
  });

  it("uses the singular at one day", () => {
    expect(formatAccessWindowRemaining(1)).toBe("1 day left");
  });

  it.each([
    ["zero", 0],
    ["a past-due window", -5],
    ["null", null],
    ["undefined", undefined],
  ])("reads %s as ending today", (_label, days) => {
    expect(formatAccessWindowRemaining(days)).toBe("Ends today");
  });
});

describe("the cached access window", () => {
  beforeEach(() => {
    globalThis.sessionStorage.clear();
    // The module memoises the last raw string it read; writing through the setter
    // keeps that cache and storage in step.
    setCachedAccessWindow(null);
  });

  it("returns null before anything is cached", () => {
    expect(getCachedAccessWindow()).toBeNull();
  });

  it("round-trips a window through session storage", () => {
    const window = {
      accessExpiresAt: "2026-12-31T00:00:00Z",
      daysRemaining: 14,
    };

    setCachedAccessWindow(window);

    expect(getCachedAccessWindow()).toEqual(window);
  });

  it("clears the cache when set to null", () => {
    setCachedAccessWindow({
      accessExpiresAt: "2026-12-31T00:00:00Z",
      daysRemaining: 14,
    });
    setCachedAccessWindow(null);

    expect(getCachedAccessWindow()).toBeNull();
  });

  it("re-reads after storage changes underneath it", () => {
    setCachedAccessWindow({
      accessExpiresAt: "2026-12-31T00:00:00Z",
      daysRemaining: 14,
    });

    globalThis.sessionStorage.setItem(
      "neptune-access-window",
      JSON.stringify({
        accessExpiresAt: "2027-01-31T00:00:00Z",
        daysRemaining: 45,
      }),
    );

    expect(getCachedAccessWindow()).toEqual({
      accessExpiresAt: "2027-01-31T00:00:00Z",
      daysRemaining: 45,
    });
  });

  it.each([
    ["malformed JSON", "{not json"],
    ["a JSON value that is not an object", '"nope"'],
    ["an object missing the expiry", '{"daysRemaining":14}'],
    [
      "an object missing the day count",
      '{"accessExpiresAt":"2026-12-31T00:00:00Z"}',
    ],
  ])("returns null for %s rather than throwing", (_label, raw) => {
    globalThis.sessionStorage.setItem("neptune-access-window", raw);

    expect(getCachedAccessWindow()).toBeNull();
  });
});

describe("the auth redirect message", () => {
  beforeEach(() => {
    globalThis.sessionStorage.clear();
  });

  it("returns null when no message is waiting", () => {
    expect(consumeAuthRedirectMessage()).toBeNull();
  });

  it("hands the message back once", () => {
    setAuthRedirectMessage("Your session expired.");

    expect(consumeAuthRedirectMessage()).toBe("Your session expired.");
    // Consuming clears it, so the toast cannot reappear on the next navigation.
    expect(consumeAuthRedirectMessage()).toBeNull();
  });

  it("keeps only the most recent message", () => {
    setAuthRedirectMessage("First");
    setAuthRedirectMessage("Second");

    expect(consumeAuthRedirectMessage()).toBe("Second");
  });
});
