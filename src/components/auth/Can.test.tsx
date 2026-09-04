/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Can } from "@/components/auth/Can";
import type { Capabilities } from "@/lib/capabilities";

const useCapabilities = vi.hoisted(() => vi.fn());

vi.mock("@/lib/capabilities", () => ({ useCapabilities }));

/** A capability set holding exactly `held`, ready or still loading. */
function grant(held: readonly string[], isReady = true): Capabilities {
  const can = (capability: string | undefined) =>
    capability !== undefined && held.includes(capability);

  return {
    can,
    canAll: (capabilities) => capabilities.every((entry) => can(entry)),
    canAny: (capabilities) => capabilities.some((entry) => can(entry)),
    hasModule: () => true,
    // `Can` gates on capabilities only; no role-gated case reaches it.
    role: "Ehs_Director",
    isReady,
  };
}

function setCapabilities(held: readonly string[], isReady = true) {
  useCapabilities.mockReturnValue(grant(held, isReady));
}

describe("Can", () => {
  beforeEach(() => {
    setCapabilities([]);
  });

  describe("a single capability", () => {
    it("renders the control to a user who holds it", () => {
      setCapabilities(["Incident.Close"]);

      render(
        <Can do="Incident.Close">
          <button type="button">Close incident</button>
        </Can>,
      );

      expect(
        screen.getByRole("button", { name: "Close incident" }),
      ).toBeInTheDocument();
    });

    it("renders nothing to a user who does not", () => {
      setCapabilities(["Incident.Read"]);

      render(
        <Can do="Incident.Close">
          <button type="button">Close incident</button>
        </Can>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders the fallback when one is given", () => {
      setCapabilities([]);

      render(
        <Can do="Incident.Close" fallback={<p>Ask an administrator</p>}>
          <button type="button">Close incident</button>
        </Can>,
      );

      expect(screen.getByText("Ask an administrator")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("matches the capability exactly", () => {
      // Capabilities are `Module.Action` strings shared verbatim with the endpoint
      // attribute and the token claim. A prefix match would grant Incident.Close
      // to anyone holding Incident.C.
      setCapabilities(["Incident.Clos"]);

      render(
        <Can do="Incident.Close">
          <button type="button">Close incident</button>
        </Can>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("all", () => {
    it("renders when the user holds every capability", () => {
      setCapabilities(["Capa.Create", "Capa.Assign"]);

      render(
        <Can all={["Capa.Create", "Capa.Assign"]}>
          <button type="button">Raise and assign</button>
        </Can>,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders nothing when one is missing", () => {
      setCapabilities(["Capa.Create"]);

      render(
        <Can all={["Capa.Create", "Capa.Assign"]}>
          <button type="button">Raise and assign</button>
        </Can>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders for an empty list, which requires nothing", () => {
      render(
        <Can all={[]}>
          <button type="button">Always</button>
        </Can>,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("any", () => {
    it("renders when the user holds one of them", () => {
      setCapabilities(["Capa.Verify"]);

      render(
        <Can any={["Capa.Close", "Capa.Verify"]}>
          <button type="button">Act on CAPA</button>
        </Can>,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders nothing when the user holds none", () => {
      setCapabilities(["Capa.Read"]);

      render(
        <Can any={["Capa.Close", "Capa.Verify"]}>
          <button type="button">Act on CAPA</button>
        </Can>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders nothing for an empty list, which nothing can satisfy", () => {
      render(
        <Can any={[]}>
          <button type="button">Never</button>
        </Can>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("conditions combined", () => {
    it("requires every condition given to pass", () => {
      setCapabilities(["Capa.Read", "Capa.Create"]);

      render(
        <Can do="Capa.Read" all={["Capa.Create"]} any={["Capa.Close"]}>
          <button type="button">Combined</button>
        </Can>,
      );

      // `any` is unsatisfied, so the gate refuses even though the other two pass.
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders when all of them pass", () => {
      setCapabilities(["Capa.Read", "Capa.Create", "Capa.Close"]);

      render(
        <Can do="Capa.Read" all={["Capa.Create"]} any={["Capa.Close"]}>
          <button type="button">Combined</button>
        </Can>,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("a gate with no condition", () => {
    it("refuses rather than silently permitting everything", () => {
      // Rendering the children here would turn a caller mistake into an invisible
      // one: a gate that looks like a gate and permits everyone.
      setCapabilities(["Everything"]);

      render(
        <Can>
          <button type="button">Ungated</button>
        </Can>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("while the session is still loading", () => {
    it("renders the fallback by default", () => {
      // A control that appears and then vanishes is worse than one that appears
      // a moment late.
      setCapabilities(["Incident.Close"], false);

      render(
        <Can do="Incident.Close">
          <button type="button">Close incident</button>
        </Can>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders the children optimistically when asked to", () => {
      setCapabilities([], false);

      render(
        <Can do="Incident.Close" showWhilePending>
          <button type="button">Close incident</button>
        </Can>,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("does not consult the capability set at all", () => {
      // Not ready means the answer has not arrived, so a `false` from `can` is
      // absence of data rather than a denial.
      setCapabilities([], false);

      render(
        <Can do="Incident.Close" fallback={<p>Loading</p>}>
          <button type="button">Close incident</button>
        </Can>,
      );

      expect(screen.getByText("Loading")).toBeInTheDocument();
    });
  });
});
