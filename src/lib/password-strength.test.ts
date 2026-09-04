import { describe, expect, it } from "vitest";
import {
  PASSWORD_STRENGTH_SEGMENTS,
  getPasswordStrengthScore,
  isStrongPassword,
} from "@/lib/password-strength";

describe("isStrongPassword", () => {
  // The rule mirrors the backend UserDto validator. A password the meter calls
  // strong but the API rejects is a signup that fails after the form said it passed.
  it.each([
    ["letters, a digit and a symbol at exactly 8 characters", "Passw0r!"],
    ["a long passphrase", "correct-horse-battery-staple-9"],
    ["a symbol that is not ASCII punctuation", "password1£"],
    ["a space as the symbol", "pass word1"],
    ["unicode letters", "pässword1!"],
  ])("accepts %s", (_label, password) => {
    expect(isStrongPassword(password)).toBe(true);
  });

  it.each([
    ["too short even though it has all three classes", "Pas0!rd"],
    ["no digit", "password!"],
    ["no symbol", "password1"],
    ["no letter", "12345678!"],
    ["empty", ""],
  ])("rejects a password that is %s", (_label, password) => {
    expect(isStrongPassword(password)).toBe(false);
  });

  it("anchors the rule so a strong tail cannot rescue a weak start", () => {
    // An unanchored regex would match the strong substring inside a longer value.
    expect(isStrongPassword("\nPassw0r!")).toBe(false);
  });
});

describe("getPasswordStrengthScore", () => {
  it("scores an empty password zero", () => {
    expect(getPasswordStrengthScore("")).toBe(0);
  });

  it("gives one point for a short letters-only password", () => {
    expect(getPasswordStrengthScore("abc")).toBe(1);
  });

  it("gives a point per class met, without the length or strong bonus", () => {
    // letters + digit + symbol, but only 6 characters.
    expect(getPasswordStrengthScore("ab1!cd")).toBe(3);
  });

  it("gives length, all three classes and the strong bonus a full score", () => {
    expect(getPasswordStrengthScore("Passw0r!")).toBe(
      PASSWORD_STRENGTH_SEGMENTS,
    );
  });

  it("never exceeds the number of segments the meter can draw", () => {
    const score = getPasswordStrengthScore("a-very-long-strong-passphrase-1!");

    expect(score).toBeLessThanOrEqual(PASSWORD_STRENGTH_SEGMENTS);
    expect(score).toBe(PASSWORD_STRENGTH_SEGMENTS);
  });

  it("never scores a rejected password full marks", () => {
    // The meter must not read as complete for a password the API will refuse.
    for (const weak of ["password", "password1", "12345678", "Pas0!rd"]) {
      expect(getPasswordStrengthScore(weak)).toBeLessThan(
        PASSWORD_STRENGTH_SEGMENTS,
      );
    }
  });

  it("rises monotonically as classes are added", () => {
    const scores = [
      getPasswordStrengthScore("abcdefgh"),
      getPasswordStrengthScore("abcdefg1"),
      getPasswordStrengthScore("abcdef1!"),
    ];

    expect(scores[0]).toBeLessThan(scores[1]);
    expect(scores[1]).toBeLessThan(scores[2]);
  });
});
