/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CapaListView } from "@/components/capa/CapaListView";

const { actionsQuery, getAccessToken, push } = vi.hoisted(() => ({
  actionsQuery: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  },
  getAccessToken: vi.fn(),
  push: vi.fn(),
}));

// `Table` makes a whole row clickable through `useRouter`, which throws outside an app
// router. The list is what is under test here, not where a row navigates to.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/dashboard/capa",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-dashboard-queries", () => ({
  useMyActionsQuery: () => actionsQuery,
}));
vi.mock("@/lib/axios", () => ({ getAccessToken }));
vi.mock("@/hooks/use-auth-mutations", () => ({
  getMutationErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback,
}));

const DAY_MS = 24 * 60 * 60 * 1000;

function inDays(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

/** Four actions spanning every filter dimension the register offers. */
function actions() {
  return [
    {
      id: 501,
      title: "Replace damaged guard",
      capaType: "Corrective",
      priority: "High",
      assignee: "Dana Okafor",
      site: "Line 3",
      status: "Open",
      dueDate: inDays(3),
    },
    {
      id: 502,
      title: "Add pre-start checklist",
      capaType: "Preventive",
      priority: "Medium",
      assignee: "Sam Ito",
      site: "Line 1",
      status: "In Progress",
      dueDate: inDays(-2),
    },
    {
      id: 503,
      title: "Retrain forklift operators",
      capaType: "Preventive",
      priority: "Low",
      assignee: "Dana Okafor",
      site: "Warehouse",
      status: "Closed",
      dueDate: inDays(10),
    },
    {
      id: 504,
      title: "Update lockout procedure",
      capaType: "Corrective",
      priority: "High",
      assignee: "Rae Lindqvist",
      site: "Line 3",
      status: "Completed",
      dueDate: inDays(5),
    },
  ];
}

function loaded(list: unknown[] = actions()) {
  actionsQuery.data = { dataModel: { actions: list } };
  actionsQuery.isLoading = false;
  actionsQuery.isError = false;
  actionsQuery.error = null;
}

/** The register table's body rows, by their leading CAPA code. */
function visibleCodes(): string[] {
  const table = screen.queryByRole("table");
  if (!table) return [];

  return within(table)
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent ?? "");
}

async function choose(
  user: ReturnType<typeof userEvent.setup>,
  segment: string,
  option: string,
) {
  // The bar renders a select for narrow viewports and pills from xl up; both are
  // in the DOM under jsdom, and the select is the labelled one.
  await user.selectOptions(screen.getByLabelText(segment), option);
}

describe("CapaListView", () => {
  beforeEach(() => {
    getAccessToken.mockReturnValue("token");
    actionsQuery.refetch.mockReset();
    loaded();
  });

  describe("before the register can load", () => {
    it("shows a skeleton while the request is in flight", () => {
      actionsQuery.isLoading = true;
      actionsQuery.data = undefined;

      render(<CapaListView />);

      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("State")).not.toBeInTheDocument();
    });

    it("asks an unauthenticated visitor to sign in", () => {
      getAccessToken.mockReturnValue(null);

      render(<CapaListView />);

      expect(
        screen.getByText("Please sign in to load CAPAs."),
      ).toBeInTheDocument();
    });

    it("offers a retry when the request failed", async () => {
      actionsQuery.isError = true;
      actionsQuery.error = new Error("Service unavailable.");
      const user = userEvent.setup();

      render(<CapaListView />);

      expect(screen.getByText("Could not load CAPAs")).toBeInTheDocument();
      expect(screen.getByText("Service unavailable.")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(actionsQuery.refetch).toHaveBeenCalled();
    });
  });

  describe("the register", () => {
    it("lists every action as a row", () => {
      render(<CapaListView />);

      expect(visibleCodes()).toEqual([
        "CAPA-501",
        "CAPA-502",
        "CAPA-503",
        "CAPA-504",
      ]);
    });

    it("counts the rows alongside the search field", () => {
      render(<CapaListView />);

      expect(screen.getByText("4 CAPAs")).toBeInTheDocument();
    });

    it("summarises open, overdue and closed in the KPI tiles", () => {
      // The tiles and the state filter deliberately disagree about `Completed`:
      // `summariseCapaRows` counts only `Closed` as closed, because Completed and
      // Pending Verification are stages *before* Closed and counting them as
      // finished undercounted Open. So 504 (Completed) lands in Open here while
      // the Closed *filter* below still returns it. Overdue is derived from the
      // due date, so 502 is both In Progress and overdue.
      const { container } = render(<CapaListView />);

      // "Open", "Overdue" and "Closed" are also filter options and status
      // badges, so the tiles are read structurally: each is a card holding a
      // label in its header row and the count as its own direct child. The
      // labels are uppercased by CSS, so the DOM carries their written casing.
      const tiles = new Map(
        [...container.querySelectorAll("article")]
          .map((tile): [string, string] => [
            tile.querySelector("div p")?.textContent ?? "",
            tile.querySelector(":scope > p")?.textContent ?? "",
          ])
          .filter(([label, value]) => label !== "" && value !== ""),
      );

      expect(tiles.get("Total CAPAs")).toBe("4");
      expect(tiles.get("Open")).toBe("3");
      expect(tiles.get("Overdue")).toBe("1");
      expect(tiles.get("Closed")).toBe("1");
    });
  });

  describe("filtering by state", () => {
    it("shows only open CAPAs", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await choose(user, "State", "Open");

      expect(visibleCodes()).toEqual(["CAPA-501", "CAPA-502"]);
    });

    it("shows only closed CAPAs, counting Completed as closed", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await choose(user, "State", "Closed");

      expect(visibleCodes()).toEqual(["CAPA-503", "CAPA-504"]);
    });

    it("shows only overdue CAPAs, whatever their status", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await choose(user, "State", "Overdue");

      expect(visibleCodes()).toEqual(["CAPA-502"]);
    });

    it("returns everything when set back to All", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await choose(user, "State", "Open");
      await choose(user, "State", "All");

      expect(visibleCodes()).toHaveLength(4);
    });
  });

  describe("filtering by priority and type", () => {
    it("filters by priority", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await choose(user, "Priority", "High");

      expect(visibleCodes()).toEqual(["CAPA-501", "CAPA-504"]);
    });

    it("filters by type", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await choose(user, "Type", "Preventive");

      expect(visibleCodes()).toEqual(["CAPA-502", "CAPA-503"]);
    });

    it("narrows with every filter at once", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await choose(user, "State", "Open");
      await choose(user, "Priority", "High");
      await choose(user, "Type", "Corrective");

      expect(visibleCodes()).toEqual(["CAPA-501"]);
    });
  });

  describe("searching", () => {
    it("matches on the action title", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await user.type(screen.getByLabelText("Search CAPAs"), "forklift");

      expect(visibleCodes()).toEqual(["CAPA-503"]);
    });

    it("matches on the owner", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await user.type(screen.getByLabelText("Search CAPAs"), "Dana");

      expect(visibleCodes()).toEqual(["CAPA-501", "CAPA-503"]);
    });

    it("matches on the CAPA code", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await user.type(screen.getByLabelText("Search CAPAs"), "CAPA-504");

      expect(visibleCodes()).toEqual(["CAPA-504"]);
    });

    it("ignores casing and surrounding whitespace", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await user.type(screen.getByLabelText("Search CAPAs"), "  FORKLIFT ");

      expect(visibleCodes()).toEqual(["CAPA-503"]);
    });

    it("combines with the filters rather than replacing them", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await choose(user, "Type", "Preventive");
      await user.type(screen.getByLabelText("Search CAPAs"), "Dana");

      expect(visibleCodes()).toEqual(["CAPA-503"]);
    });

    it("updates the result count as the list narrows", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await user.type(screen.getByLabelText("Search CAPAs"), "forklift");

      expect(screen.getByText("1 CAPA")).toBeInTheDocument();
    });
  });

  describe("the empty states", () => {
    it("distinguishes an empty register from an over-filtered one", async () => {
      // The two send the reader to different next actions, so they must not
      // share a message.
      const user = userEvent.setup();
      render(<CapaListView />);

      await user.type(screen.getByLabelText("Search CAPAs"), "nothing matches");

      expect(
        screen.getByText("No CAPAs match these filters"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Try widening the state, priority, type, or search."),
      ).toBeInTheDocument();
    });

    it("invites the user to create one when the register is genuinely empty", () => {
      loaded([]);

      render(<CapaListView />);

      expect(screen.getByText("No CAPAs yet")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create capa/i }),
      ).toBeInTheDocument();
    });

    it("does not offer Create from the filtered empty state", async () => {
      const user = userEvent.setup();
      render(<CapaListView />);

      await user.type(screen.getByLabelText("Search CAPAs"), "nothing matches");

      // Clearing a filter is the way out here, not raising a new CAPA.
      expect(
        screen.queryByRole("button", { name: /create capa/i }),
      ).not.toBeInTheDocument();
    });

    it("treats a response with no actions array as an empty register", () => {
      actionsQuery.data = { dataModel: {} };
      actionsQuery.isLoading = false;
      actionsQuery.isError = false;

      render(<CapaListView />);

      expect(screen.getByText("No CAPAs yet")).toBeInTheDocument();
    });
  });
});
