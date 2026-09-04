import { describe, expect, it } from "vitest";
import {
  CAPA_API_STATUS,
  CAPA_LIFECYCLE_STAGES,
  CAPA_STATUS_FILTER_OPTIONS,
  formatCapaStatusDisplay,
  isCapaStatusClosed,
  isCapaStatusCompleted,
  isCapaStatusPendingVerification,
  toCapaListFilterParam,
} from "@/lib/capa-filters";

describe("CAPA status filter options", () => {
  it("sends exactly the values the API pins its Status param to", () => {
    // OpenAPI constrains Status to this set; anything else is a 400, so a chip
    // whose value drifted would break the register rather than filter it.
    const allowed = new Set<string>([
      "",
      "All",
      "Open",
      "In Progress",
      "Completed",
      "Pending Verification",
      "Closed",
      "Overdue",
    ]);

    for (const option of CAPA_STATUS_FILTER_OPTIONS) {
      expect(allowed).toContain(option.value);
    }
  });

  it("offers All as the empty value so the param is omitted", () => {
    expect(CAPA_STATUS_FILTER_OPTIONS[0]).toEqual({ value: "", label: "All" });
  });

  it("lists the five stored stages in lifecycle order", () => {
    expect(CAPA_LIFECYCLE_STAGES).toEqual([
      "Open",
      "In Progress",
      "Completed",
      "Pending Verification",
      "Closed",
    ]);
  });

  it("keeps Overdue out of the stored lifecycle", () => {
    // Overdue is derived from the due date, not a stage a CAPA sits in.
    expect(CAPA_LIFECYCLE_STAGES).not.toContain(CAPA_API_STATUS.overdue);
  });
});

describe("toCapaListFilterParam", () => {
  it("passes a real filter value through", () => {
    expect(toCapaListFilterParam("In Progress")).toBe("In Progress");
  });

  it.each([
    ["an empty value", ""],
    ["whitespace only", "   "],
  ])("collapses %s to empty so the param is dropped", (_label, value) => {
    expect(toCapaListFilterParam(value)).toBe("");
  });
});

describe("formatCapaStatusDisplay", () => {
  it.each([
    ["Open", "Open"],
    ["InProgress", "In Progress"],
    ["in_progress", "In Progress"],
    ["in progress", "In Progress"],
    ["Completed", "Completed"],
    ["complete", "Completed"],
    ["Closed", "Closed"],
    ["Overdue", "Overdue"],
  ])("canonicalises %s to its stored spelling", (raw, expected) => {
    expect(formatCapaStatusDisplay(raw)).toBe(expected);
  });

  it.each([
    "Pending Verification",
    "pendingverification",
    "pending",
    "verified",
  ])("maps %s onto Pending Verification", (raw) => {
    // `verified` is the pre-rename value; a stale cached row must still render
    // as something real rather than an unknown badge.
    expect(formatCapaStatusDisplay(raw)).toBe(
      CAPA_API_STATUS.pendingVerification,
    );
  });

  it("ignores casing and separators", () => {
    expect(formatCapaStatusDisplay("  IN-PROGRESS  ")).toBe("In Progress");
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
    ["whitespace only", "   "],
  ])("renders an em dash for %s", (_label, status) => {
    expect(formatCapaStatusDisplay(status)).toBe("—");
  });

  it("passes an unrecognised status through rather than blanking it", () => {
    expect(formatCapaStatusDisplay("Escalated")).toBe("Escalated");
  });

  it("agrees with the values the filter chips send", () => {
    // A chip and a row must never disagree: filtering on "In Progress" has to
    // match rows the badge also calls "In Progress".
    for (const option of CAPA_STATUS_FILTER_OPTIONS) {
      if (option.value === "" || option.value === CAPA_API_STATUS.all) continue;
      expect(formatCapaStatusDisplay(option.value)).toBe(option.value);
    }
  });
});

describe("CAPA lifecycle predicates", () => {
  it.each(["Closed", "closed", "CLOSED", "dropped", "Dropped"])(
    "treats %s as closed, so the CAPA cannot be reopened or updated",
    (status) => {
      expect(isCapaStatusClosed(status)).toBe(true);
    },
  );

  it.each([
    "Open",
    "In Progress",
    "Completed",
    "Pending Verification",
    "Overdue",
  ])("does not treat %s as closed", (status) => {
    expect(isCapaStatusClosed(status)).toBe(false);
  });

  it.each(["Completed", "completed", "complete", "COMPLETE"])(
    "treats %s as completed",
    (status) => {
      expect(isCapaStatusCompleted(status)).toBe(true);
    },
  );

  it("does not confuse completed with closed", () => {
    // A completed CAPA is still editable; a closed one is not.
    expect(isCapaStatusCompleted("Closed")).toBe(false);
    expect(isCapaStatusClosed("Completed")).toBe(false);
  });

  it.each([
    "Pending Verification",
    "pendingverification",
    "pending",
    "verified",
  ])("treats %s as pending verification", (status) => {
    expect(isCapaStatusPendingVerification(status)).toBe(true);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
  ])("reports %s as none of the terminal states", (_label, status) => {
    expect(isCapaStatusClosed(status)).toBe(false);
    expect(isCapaStatusCompleted(status)).toBe(false);
    expect(isCapaStatusPendingVerification(status)).toBe(false);
  });

  it("keeps the three predicates mutually exclusive across the lifecycle", () => {
    for (const stage of CAPA_LIFECYCLE_STAGES) {
      const matches = [
        isCapaStatusClosed(stage),
        isCapaStatusCompleted(stage),
        isCapaStatusPendingVerification(stage),
      ].filter(Boolean);

      expect(matches.length).toBeLessThanOrEqual(1);
    }
  });
});
