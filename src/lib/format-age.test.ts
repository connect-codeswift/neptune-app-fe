import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatAge } from "@/lib/format-age";

const NOW = new Date("2026-09-03T12:00:00Z");

describe("formatAge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["seconds", "2026-09-03T11:59:15Z", "45s"],
    ["minutes once a minute has passed", "2026-09-03T11:48:00Z", "12m"],
    ["hours once an hour has passed", "2026-09-03T06:00:00Z", "6h"],
    ["days once a day has passed", "2026-08-31T12:00:00Z", "3d"],
  ])("reports %s", (_label, timestamp, expected) => {
    expect(formatAge(timestamp)).toBe(expected);
  });

  it.each([
    ["59 seconds", "2026-09-03T11:59:01Z", "59s"],
    ["exactly one minute", "2026-09-03T11:59:00Z", "1m"],
    ["59 minutes", "2026-09-03T11:01:00Z", "59m"],
    ["exactly one hour", "2026-09-03T11:00:00Z", "1h"],
    ["23 hours", "2026-09-02T13:00:00Z", "23h"],
    ["exactly one day", "2026-09-02T12:00:00Z", "1d"],
  ])("rolls over to the next unit at %s", (_label, timestamp, expected) => {
    expect(formatAge(timestamp)).toBe(expected);
  });

  it("treats a naive timestamp as UTC rather than local time", () => {
    // The backend sends no offset and .NET writes UTC. Letting the browser apply
    // the viewer's zone would shift every age by that offset.
    expect(formatAge("2026-09-03T11:48:00")).toBe("12m");
  });

  it.each([
    ["a trailing Z", "2026-09-03T11:48:00Z"],
    ["an explicit +00:00", "2026-09-03T11:48:00+00:00"],
    ["an offset without a colon", "2026-09-03T16:48:00+0500"],
  ])("honours %s on the wire", (_label, timestamp) => {
    expect(formatAge(timestamp)).toBe("12m");
  });

  it("floors a future timestamp to zero instead of showing a negative age", () => {
    // Clock skew between the server and the viewer must not render "-3s".
    expect(formatAge("2026-09-03T12:00:30Z")).toBe("0s");
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
  ])("renders an em dash for %s", (_label, timestamp) => {
    expect(formatAge(timestamp)).toBe("—");
  });

  it("renders an em dash for an unparseable value", () => {
    expect(formatAge("not a date")).toBe("—");
  });

  it.each([
    [".NET DateTime zero", "0001-01-01T00:00:00Z"],
    ["any pre-2000 default", "1970-01-01T00:00:00Z"],
  ])(
    "renders an em dash for %s rather than an enormous age",
    (_label, timestamp) => {
      expect(formatAge(timestamp)).toBe("—");
    },
  );

  it("formats a genuine age from 2000 onwards", () => {
    // The 2000 floor filters unset defaults, not real history.
    expect(formatAge("2000-01-01T12:00:00Z")).toMatch(/^\d+d$/);
  });
});
