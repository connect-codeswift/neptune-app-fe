/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrganizationLimitsBanner } from "@/components/OrganizationLimitsBanner";
import type { OrganizationLimitsState } from "@/lib/organization-limits";

// The real Icon pulls the Iconify runtime and fetches icon data over the network.
// A stub keeps the test about the banner and off the wire.
vi.mock("@iconify/react", () => ({
  Icon: ({ icon, ...rest }: { icon: string }) => (
    <span data-testid="icon" data-icon={icon} {...rest} />
  ),
}));

const AT_LIMIT: OrganizationLimitsState = {
  maxSeats: 50,
  seatsUsed: 50,
  seatsAvailable: 0,
  atSeatLimit: true,
};

const APPROACHING: OrganizationLimitsState = {
  maxSeats: 50,
  seatsUsed: 46,
  seatsAvailable: 4,
  atSeatLimit: false,
};

describe("OrganizationLimitsBanner", () => {
  it("announces itself as a status rather than an alert", () => {
    // A seat count is information, not an interruption; role="alert" would cut
    // across whatever a screen reader is already reading.
    render(<OrganizationLimitsBanner limits={APPROACHING} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("tells an org at its cap that it cannot invite more users", () => {
    render(<OrganizationLimitsBanner limits={AT_LIMIT} />);

    const banner = screen.getByRole("status");

    expect(banner).toHaveTextContent("reached its user seat limit (50/50)");
    expect(banner).toHaveTextContent("before inviting more users");
  });

  it("tells an org near its cap that it is approaching the limit", () => {
    render(<OrganizationLimitsBanner limits={APPROACHING} />);

    const banner = screen.getByRole("status");

    expect(banner).toHaveTextContent("approaching its user seat limit (46/50)");
    expect(banner).not.toHaveTextContent("reached");
  });

  it("reads red at the cap and amber before it", () => {
    const { container: atLimit } = render(
      <OrganizationLimitsBanner limits={AT_LIMIT} />,
    );
    expect(atLimit.innerHTML).toContain("border-ehs-red/25");

    const { container: approaching } = render(
      <OrganizationLimitsBanner limits={APPROACHING} />,
    );
    expect(approaching.innerHTML).toContain("bg-ehs-warning-surface");
    expect(approaching.innerHTML).not.toContain("border-ehs-red/25");
  });

  it("swaps the icon for the more urgent state", () => {
    render(<OrganizationLimitsBanner limits={AT_LIMIT} />);
    expect(screen.getByTestId("icon")).toHaveAttribute(
      "data-icon",
      "mdi:account-alert-outline",
    );
  });

  it("hides the icon from assistive tech, since the text already says it", () => {
    render(<OrganizationLimitsBanner limits={APPROACHING} />);

    expect(screen.getByTestId("icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("appends a caller's className without dropping its own", () => {
    const { container } = render(
      <OrganizationLimitsBanner limits={APPROACHING} className="mt-6" />,
    );

    const banner = container.firstElementChild as HTMLElement;

    expect(banner.className).toContain("mt-6");
    expect(banner.className).toContain("rounded-xl");
  });

  it("leaves no stray separator when no className is passed", () => {
    const { container } = render(
      <OrganizationLimitsBanner limits={APPROACHING} />,
    );

    const banner = container.firstElementChild as HTMLElement;

    expect(banner.className).not.toMatch(/\s{2,}|\s$/);
  });
});
