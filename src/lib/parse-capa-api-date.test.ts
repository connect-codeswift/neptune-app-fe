import { describe, expect, it } from "vitest";
import {
  formatCapaApiDateForDisplay,
  parseCapaApiDate,
} from "@/lib/parse-capa-api-date";

describe("parseCapaApiDate", () => {
  it("takes the calendar day off the front of an ISO instant", () => {
    expect(parseCapaApiDate("2026-09-01T00:00:00Z")).toBe("2026-09-01");
  });

  it.each([
    ["a bare date", "2026-09-01"],
    ["an explicit positive offset", "2026-09-01T00:00:00+05:00"],
    ["an explicit negative offset", "2026-09-01T00:00:00-05:00"],
    ["fractional seconds", "2026-09-01T00:00:00.123Z"],
    ["a late-evening UTC instant", "2026-09-01T23:59:59Z"],
  ])("reads the same day from %s", (_label, value) => {
    expect(parseCapaApiDate(value)).toBe("2026-09-01");
  });

  it("does not shift the day for a viewer behind UTC", () => {
    // Round-tripping midnight UTC through `new Date()` renders 31 August in New
    // York, which is the wrong day on a compliance record. The string is sliced,
    // never parsed, so the result cannot depend on the machine's timezone.
    expect(parseCapaApiDate("2026-09-01T00:00:00Z")).toBe("2026-09-01");
    expect(parseCapaApiDate("2026-01-01T00:00:00Z")).toBe("2026-01-01");
  });

  it("trims surrounding whitespace before reading the date", () => {
    expect(parseCapaApiDate("  2026-09-01T00:00:00Z  ")).toBe("2026-09-01");
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
    ["whitespace only", "   "],
  ])("returns null for %s", (_label, value) => {
    expect(parseCapaApiDate(value)).toBeNull();
  });

  it.each([
    ["a legacy day-first string", "01-09-2026 14:30"],
    ["free text", "next Tuesday"],
  ])(
    "passes %s through unchanged rather than inventing a date",
    (_label, value) => {
      // A visibly odd string is easier to trace than a plausible wrong one.
      expect(parseCapaApiDate(value)).toBe(value);
    },
  );
});

describe("formatCapaApiDateForDisplay", () => {
  it("renders the calendar day for a real date", () => {
    expect(formatCapaApiDateForDisplay("2026-09-01T00:00:00Z")).toBe(
      "2026-09-01",
    );
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
  ])("renders an em dash for %s", (_label, value) => {
    expect(formatCapaApiDateForDisplay(value)).toBe("—");
  });
});
