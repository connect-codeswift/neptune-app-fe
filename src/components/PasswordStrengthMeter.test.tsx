/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { PASSWORD_STRENGTH_SEGMENTS } from "@/lib/password-strength";

/** The five bars, in order. They are aria-hidden, so query the DOM directly. */
function segments(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>("[aria-hidden='true'] > div"),
  ];
}

function filledCount(container: HTMLElement): number {
  return segments(container).filter(
    (s) => !s.className.includes("bg-ehs-border"),
  ).length;
}

describe("PasswordStrengthMeter", () => {
  it("exposes the score to assistive tech through a meter", () => {
    // The bars themselves are decorative; the meter is the only accessible name
    // and value a screen reader has to work with.
    render(<PasswordStrengthMeter password="Passw0r!" />);

    const meter = screen.getByText("Password strength");

    expect(meter).toHaveAttribute("value", String(PASSWORD_STRENGTH_SEGMENTS));
    expect(meter).toHaveAttribute("min", "0");
    expect(meter).toHaveAttribute("max", String(PASSWORD_STRENGTH_SEGMENTS));
  });

  it("hides the decorative bars from assistive tech", () => {
    const { container } = render(<PasswordStrengthMeter password="Passw0r!" />);

    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("always draws five segments", () => {
    const { container } = render(<PasswordStrengthMeter password="" />);

    expect(segments(container)).toHaveLength(PASSWORD_STRENGTH_SEGMENTS);
  });

  it.each([
    ["an empty password", "", 0],
    ["letters only", "abc", 1],
    ["all three classes but too short", "ab1!cd", 3],
    ["a password that meets the rule", "Passw0r!", 5],
  ])("fills one segment per point for %s", (_label, password, expected) => {
    const { container } = render(<PasswordStrengthMeter password={password} />);

    expect(filledCount(container)).toBe(expected);
  });

  it("fills segments from the left", () => {
    const { container } = render(<PasswordStrengthMeter password="abc" />);
    const bars = segments(container);

    expect(bars[0].className).not.toContain("bg-ehs-border");
    expect(bars[1].className).toContain("bg-ehs-border");
  });

  it.each([
    ["red at a weak score", "abc", "bg-ehs-red"],
    ["amber at a middling score", "ab1!cd", "bg-ehs-yellow"],
    ["green once the password passes", "Passw0r!", "bg-ehs-green"],
  ])("reads %s", (_label, password, expectedClass) => {
    const { container } = render(<PasswordStrengthMeter password={password} />);
    const filled = segments(container).filter(
      (s) => !s.className.includes("bg-ehs-border"),
    );

    expect(filled.length).toBeGreaterThan(0);
    for (const bar of filled) {
      expect(bar.className).toContain(expectedClass);
    }
  });

  it("never shows green for a password the API would reject", () => {
    // Green is the signal that the form will submit; showing it for a password
    // the backend refuses sends the user into a failing request.
    for (const weak of ["password", "password1", "12345678", "Pas0!rd"]) {
      const { container, unmount } = render(
        <PasswordStrengthMeter password={weak} />,
      );

      expect(container.innerHTML).not.toContain("bg-ehs-green");
      unmount();
    }
  });

  it("leaves every segment empty for a blank password", () => {
    const { container } = render(<PasswordStrengthMeter password="" />);

    for (const bar of segments(container)) {
      expect(bar.className).toContain("bg-ehs-border");
    }
  });
});
