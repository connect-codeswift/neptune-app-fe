import { describe, expect, it } from "vitest";
import {
  formatRecordDisplayId,
  parseRecordNumericId,
} from "@/lib/format-record-id";

describe("formatRecordDisplayId", () => {
  it("prefixes a bare numeric id", () => {
    expect(formatRecordDisplayId("NM", 6004)).toBe("NM-6004");
  });

  it("accepts the id as a string", () => {
    expect(formatRecordDisplayId("NM", "6004")).toBe("NM-6004");
  });

  it("passes an already-prefixed id through unchanged", () => {
    // Double-prefixing would produce "NM-NM-6004" on any screen that formats twice.
    expect(formatRecordDisplayId("NM", "NM-6004")).toBe("NM-6004");
  });

  it.each([
    ["lower case", "nm-6004"],
    ["mixed case", "Nm-6004"],
  ])(
    "recognises an existing prefix in %s and preserves what was sent",
    (_label, id) => {
      expect(formatRecordDisplayId("NM", id)).toBe(id);
    },
  );

  it("does not mistake a different prefix for its own", () => {
    expect(formatRecordDisplayId("NM", "CHEM-6004")).toBe("NM-CHEM-6004");
  });

  it("trims surrounding whitespace", () => {
    expect(formatRecordDisplayId("NM", "  6004  ")).toBe("NM-6004");
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
    ["whitespace only", "   "],
  ])("renders nothing for %s rather than a bare prefix", (_label, id) => {
    // "NM-" on its own reads as a real record that lost its number.
    expect(formatRecordDisplayId("NM", id)).toBe("");
  });

  it("formats zero rather than treating it as absent", () => {
    expect(formatRecordDisplayId("NM", 0)).toBe("NM-0");
  });
});

describe("parseRecordNumericId", () => {
  it("reads a bare numeric route segment", () => {
    expect(parseRecordNumericId("42")).toBe(42);
  });

  it("reads the number out of a prefixed segment", () => {
    expect(parseRecordNumericId("CHEM-42")).toBe(42);
  });

  it("reads the number out of a multi-part prefix", () => {
    expect(parseRecordNumericId("NEAR-MISS-42")).toBe(42);
  });

  it("trims surrounding whitespace", () => {
    expect(parseRecordNumericId("  42  ")).toBe(42);
  });

  it("parses zero rather than reporting it as missing", () => {
    // `0` is falsy; returning null here would send the API a request for no record.
    expect(parseRecordNumericId("0")).toBe(0);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
    ["whitespace only", "   "],
    ["a segment with no number", "CHEM"],
    ["a segment whose number is not at the end", "42-CHEM"],
    ["a decimal", "4.2"],
  ])("returns null for %s", (_label, segment) => {
    expect(parseRecordNumericId(segment)).toBeNull();
  });
});
