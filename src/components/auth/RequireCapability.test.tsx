/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequireCapability } from "@/components/auth/RequireCapability";
import type { AppNavItem } from "@/lib/app-nav";
import type { Capabilities } from "@/lib/capabilities";

const { useCapabilities, usePathname, findNavItemForPath } = vi.hoisted(() => ({
  useCapabilities: vi.fn(),
  usePathname: vi.fn(),
  findNavItemForPath: vi.fn(),
}));

vi.mock("@/lib/capabilities", () => ({ useCapabilities }));
vi.mock("next/navigation", () => ({ usePathname }));
// `findNavItemForPath` is stubbed because these tests drive the nav entry directly, but
// `passesRoleGate` is the real one: it is the rule under test in the role-gate block below,
// and stubbing it would leave the test asserting against itself.
vi.mock("@/lib/app-nav", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/app-nav")>()),
  findNavItemForPath,
}));

function setSession(
  options: {
    held?: readonly string[];
    modules?: readonly string[];
    isReady?: boolean;
    role?: string | null;
  } = {},
) {
  const {
    held = [],
    modules = ["INSP"],
    isReady = true,
    role = "Ehs_Director",
  } = options;

  const can = (capability: string | undefined) =>
    capability !== undefined && held.includes(capability);

  useCapabilities.mockReturnValue({
    can,
    canAll: (capabilities: readonly string[]) => capabilities.every(can),
    canAny: (capabilities: readonly string[]) => capabilities.some(can),
    hasModule: (code: string | undefined) =>
      code !== undefined && modules.includes(code),
    role,
    isReady,
  } satisfies Capabilities);
}

function setRoute(pathname: string, navItem?: Partial<AppNavItem>) {
  usePathname.mockReturnValue(pathname);
  findNavItemForPath.mockReturnValue(
    navItem
      ? ({
          label: "Inspections",
          href: "/dashboard/inspections",
          icon: "mdi:clipboard",
          ...navItem,
        } as AppNavItem)
      : undefined,
  );
}

function Page() {
  return <p>Inspection register</p>;
}

describe("RequireCapability", () => {
  beforeEach(() => {
    setSession();
    setRoute("/dashboard/inspections");
  });

  describe("while the session is loading", () => {
    it("renders the pending node, not a refusal", () => {
      // Showing the refusal first and the page a moment later is how a correctly
      // permitted user gets told they have no access on every hard refresh.
      setSession({ held: [], isReady: false });
      setRoute("/dashboard/inspections", { capability: "Inspection.View" });

      render(
        <RequireCapability pending={<p>Loading</p>}>
          <Page />
        </RequireCapability>,
      );

      expect(screen.getByText("Loading")).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByText("Inspection register")).not.toBeInTheDocument();
    });

    it("renders nothing when no pending node is given", () => {
      setSession({ held: [], isReady: false });
      setRoute("/dashboard/inspections", { capability: "Inspection.View" });

      const { container } = render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("a route with no capability behind it", () => {
    it("renders for everyone when the nav entry names none", () => {
      // Chat, Dashboard, Settings and the profile pages have no capability, and
      // every user needs them.
      setSession({ held: [] });
      setRoute("/dashboard/settings", { label: "Settings" });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.getByText("Inspection register")).toBeInTheDocument();
    });

    it("renders when the route matches no nav entry at all", () => {
      setSession({ held: [] });
      setRoute("/dashboard/some-unlisted-route");

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.getByText("Inspection register")).toBeInTheDocument();
    });
  });

  describe("the role gate", () => {
    it("refuses a role the item's allowedRoles list leaves out", () => {
      // Policy Maker is the live case: a Worker holds Document.View so they could
      // reach the listing screen through the capability alone, and every endpoint
      // behind it refuses them.
      setSession({ held: ["Document.View"], role: "Worker" });
      setRoute("/dashboard/policy-maker", {
        label: "Policy Maker",
        capability: "Document.View",
        allowedRoles: ["Ehs_Director", "Ehs_Lead", "Ehs_Manager", "Supervisor"],
      });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.queryByText("Inspection register")).not.toBeInTheDocument();
      expect(
        screen.getByText("You do not have access to Policy Maker"),
      ).toBeInTheDocument();
    });

    it("renders for a role the list names", () => {
      setSession({ held: ["Document.View"], role: "Supervisor" });
      setRoute("/dashboard/policy-maker", {
        label: "Policy Maker",
        capability: "Document.View",
        allowedRoles: ["Ehs_Director", "Ehs_Lead", "Ehs_Manager", "Supervisor"],
      });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.getByText("Inspection register")).toBeInTheDocument();
    });

    it("matches a role however the token spaced or cased it", () => {
      setSession({ held: ["Document.View"], role: "ehs lead" });
      setRoute("/dashboard/policy-maker", {
        label: "Policy Maker",
        capability: "Document.View",
        allowedRoles: ["Ehs_Director", "Ehs_Lead"],
      });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.getByText("Inspection register")).toBeInTheDocument();
    });

    it("refuses before the capability check, so a held capability cannot widen it", () => {
      // The sidebar checks allowedRoles first for this reason; the route has to
      // agree or the two disagree about who may reach the same screen.
      setSession({ held: [], role: "Worker" });
      setRoute("/dashboard/policy-maker", {
        label: "Policy Maker",
        allowedRoles: ["Ehs_Director"],
      });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.queryByText("Inspection register")).not.toBeInTheDocument();
    });

    it("leaves an item with no allowedRoles list alone", () => {
      setSession({ held: ["Inspection.View"], role: "Worker" });
      setRoute("/dashboard/inspections", { capability: "Inspection.View" });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.getByText("Inspection register")).toBeInTheDocument();
    });
  });

  describe("the capability gate", () => {
    it("renders the page to a user who holds the requirement", () => {
      setSession({ held: ["Inspection.View"] });
      setRoute("/dashboard/inspections", { capability: "Inspection.View" });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.getByText("Inspection register")).toBeInTheDocument();
    });

    it("refuses a user who does not, naming the page and the way to fix it", () => {
      setSession({ held: ["Inspection.Create"] });
      setRoute("/dashboard/inspections", { capability: "Inspection.View" });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.queryByText("Inspection register")).not.toBeInTheDocument();
      expect(
        screen.getByText("You do not have access to Inspections"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Roles & Rights/)).toBeInTheDocument();
    });

    it("falls back to a generic title when the nav entry has no label", () => {
      setSession({ held: [] });
      usePathname.mockReturnValue("/dashboard/inspections");
      findNavItemForPath.mockReturnValue(undefined);

      render(
        <RequireCapability capability="Inspection.View">
          <Page />
        </RequireCapability>,
      );

      expect(
        screen.getByText("You do not have access to this page"),
      ).toBeInTheDocument();
    });
  });

  describe("an explicit capability prop", () => {
    it("overrides the requirement read from the nav entry", () => {
      setSession({ held: ["Inspection.View"] });
      setRoute("/dashboard/inspections", { capability: "Inspection.View" });

      render(
        <RequireCapability capability="Inspection.Delete">
          <Page />
        </RequireCapability>,
      );

      expect(screen.queryByText("Inspection register")).not.toBeInTheDocument();
    });

    it("guards a route whose nav entry names no capability", () => {
      setSession({ held: ["Inspection.Delete"] });
      setRoute("/dashboard/inspections", { label: "Inspections" });

      render(
        <RequireCapability capability="Inspection.Delete">
          <Page />
        </RequireCapability>,
      );

      expect(screen.getByText("Inspection register")).toBeInTheDocument();
    });
  });

  describe("the module licence gate", () => {
    it("says the module is not enabled, not that the role lacks access", () => {
      // The two refusals are fixed by different people — CodeSwift versus the
      // company's own administrator — so sending someone to the wrong one wastes
      // everybody's time.
      setSession({ held: ["Inspection.View"], modules: [] });
      setRoute("/dashboard/inspections", {
        capability: "Inspection.View",
        moduleCode: "INSP" as AppNavItem["moduleCode"],
      });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(
        screen.getByText("Inspections is not enabled"),
      ).toBeInTheDocument();
      expect(screen.getByText(/CodeSwift administrator/)).toBeInTheDocument();
      expect(screen.queryByText(/Roles & Rights/)).not.toBeInTheDocument();
    });

    it("checks the licence before the role, so the message names the true reason", () => {
      // A user who lacks both should be told the module is off: granting them the
      // capability would not let them in either.
      setSession({ held: [], modules: [] });
      setRoute("/dashboard/inspections", {
        capability: "Inspection.View",
        moduleCode: "INSP" as AppNavItem["moduleCode"],
      });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(
        screen.getByText("Inspections is not enabled"),
      ).toBeInTheDocument();
    });

    it("renders the page when both the licence and the role allow it", () => {
      setSession({ held: ["Inspection.View"], modules: ["INSP"] });
      setRoute("/dashboard/inspections", {
        capability: "Inspection.View",
        moduleCode: "INSP" as AppNavItem["moduleCode"],
      });

      render(
        <RequireCapability>
          <Page />
        </RequireCapability>,
      );

      expect(screen.getByText("Inspection register")).toBeInTheDocument();
    });
  });

  it("announces a refusal as a status region", () => {
    setSession({ held: [] });
    setRoute("/dashboard/inspections", { capability: "Inspection.View" });

    render(
      <RequireCapability>
        <Page />
      </RequireCapability>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
