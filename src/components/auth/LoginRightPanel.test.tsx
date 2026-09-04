/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginRightPanel from "@/components/auth/LoginRightPanel";
import { setAuthRedirectMessage } from "@/lib/access-window";

const { push, prefetch, loginMutation, verifyMfaMutation } = vi.hoisted(() => ({
  push: vi.fn(),
  prefetch: vi.fn(),
  loginMutation: {
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    error: null as unknown,
  },
  verifyMfaMutation: {
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    error: null as unknown,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, prefetch }),
}));

vi.mock("@/hooks/use-auth-mutations", () => ({
  useLoginMutation: () => loginMutation,
  useVerifyMfaMutation: () => verifyMfaMutation,
  getMutationErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback,
}));

// ScrollLink and the panel chrome pull next/link and decorative components that
// have nothing to do with the sign-in flow.
vi.mock("@/components/ScrollLink", () => ({
  ScrollLink: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const CREDENTIALS = { email: "inspector@example.com", password: "Passw0r!" };

async function fillCredentials(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Email address"), CREDENTIALS.email);
  await user.type(screen.getByLabelText("Password"), CREDENTIALS.password);
}

function signIn() {
  return screen.getByRole("button", { name: /sign in/i });
}

describe("LoginRightPanel", () => {
  beforeEach(() => {
    push.mockReset();
    prefetch.mockReset();
    loginMutation.mutateAsync.mockReset().mockResolvedValue({ status: "ok" });
    loginMutation.reset.mockReset();
    loginMutation.isPending = false;
    loginMutation.error = null;
    verifyMfaMutation.mutateAsync.mockReset().mockResolvedValue(undefined);
    verifyMfaMutation.reset.mockReset();
    verifyMfaMutation.isPending = false;
    verifyMfaMutation.error = null;
  });

  describe("the credentials step", () => {
    it("warms the dashboard route while the user types", () => {
      // /dashboard is reached by router.push, so Next never prefetches it on its
      // own and the whole route was still downloading after the password landed.
      render(<LoginRightPanel />);

      expect(prefetch).toHaveBeenCalledWith("/dashboard");
    });

    it("signs a user in and hands them to the dashboard", async () => {
      const user = userEvent.setup();
      render(<LoginRightPanel />);

      await fillCredentials(user);
      await user.click(signIn());

      expect(loginMutation.mutateAsync).toHaveBeenCalledWith(CREDENTIALS);
      await waitFor(
        () => {
          expect(push).toHaveBeenCalledWith("/dashboard");
        },
        { timeout: 3000 },
      );
    });

    it("shows the signing-in loader before it navigates", async () => {
      const user = userEvent.setup();
      render(<LoginRightPanel />);

      await fillCredentials(user);
      await user.click(signIn());

      // The loader is held past the flicker threshold, so it is on screen while
      // the navigation is still pending.
      expect(await screen.findByText("Signing you in…")).toBeInTheDocument();
    });

    it("does not submit an empty form", async () => {
      const user = userEvent.setup();
      render(<LoginRightPanel />);

      await user.click(signIn());

      expect(loginMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it("does not submit when only the email is filled", async () => {
      const user = userEvent.setup();
      render(<LoginRightPanel />);

      await user.type(
        screen.getByLabelText("Email address"),
        CREDENTIALS.email,
      );
      await user.click(signIn());

      expect(loginMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it("reports an address the browser accepts but the schema rejects", async () => {
      // "a@b" passes HTML5 email validation — it has an @ and a domain — so the
      // schema is the only thing standing between it and a pointless request.
      const user = userEvent.setup();
      render(<LoginRightPanel />);

      await user.type(screen.getByLabelText("Email address"), "a@b");
      await user.type(screen.getByLabelText("Password"), CREDENTIALS.password);
      await user.click(signIn());

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Enter a valid email address.",
      );
      expect(loginMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it("shows the server's message when sign-in is refused", async () => {
      loginMutation.mutateAsync.mockRejectedValue(
        new Error("Your account is locked."),
      );
      const user = userEvent.setup();
      render(<LoginRightPanel />);

      await fillCredentials(user);
      await user.click(signIn());

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Your account is locked.",
      );
      expect(push).not.toHaveBeenCalled();
    });

    it("clears the loader when sign-in fails, so the form is usable again", async () => {
      loginMutation.mutateAsync.mockRejectedValue(new Error("Nope"));
      const user = userEvent.setup();
      render(<LoginRightPanel />);

      await fillCredentials(user);
      await user.click(signIn());

      await screen.findByRole("alert");
      expect(screen.queryByText("Signing you in…")).not.toBeInTheDocument();
    });

    it("falls back to a generic message when the error carries none", async () => {
      loginMutation.mutateAsync.mockRejectedValue(new Error(""));
      const user = userEvent.setup();
      render(<LoginRightPanel />);

      await fillCredentials(user);
      await user.click(signIn());

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Sign in failed. Please try again.",
      );
    });

    it("surfaces a message left behind by a forced sign-out", async () => {
      // Read once on mount: consuming it clears sessionStorage so the notice does
      // not reappear on the next visit to the page.
      setAuthRedirectMessage("Your session expired.");

      render(<LoginRightPanel />);

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Your session expired.",
      );
    });
  });

  describe("the two-step verification step", () => {
    beforeEach(() => {
      loginMutation.mutateAsync.mockResolvedValue({
        status: "mfa-required",
        mfaToken: "challenge-token",
      });
    });

    async function reachMfaStep() {
      const user = userEvent.setup();
      render(<LoginRightPanel />);
      await fillCredentials(user);
      await user.click(signIn());
      await screen.findByText("Two-step verification");
      return user;
    }

    it("asks for the code instead of navigating, since no session exists yet", async () => {
      await reachMfaStep();

      expect(screen.getByLabelText("6-digit code")).toBeInTheDocument();
      expect(push).not.toHaveBeenCalled();
      expect(screen.queryByText("Signing you in…")).not.toBeInTheDocument();
    });

    it("completes sign-in with a valid code", async () => {
      const user = await reachMfaStep();

      await user.type(screen.getByLabelText("6-digit code"), "123456");
      await user.click(
        screen.getByRole("button", { name: /verify and sign in/i }),
      );

      expect(verifyMfaMutation.mutateAsync).toHaveBeenCalledWith({
        mfaToken: "challenge-token",
        code: "123456",
      });
      await waitFor(
        () => {
          expect(push).toHaveBeenCalledWith("/dashboard");
        },
        { timeout: 3000 },
      );
    });

    it("does not submit an empty code", async () => {
      const user = await reachMfaStep();

      await user.click(
        screen.getByRole("button", { name: /verify and sign in/i }),
      );

      expect(verifyMfaMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it("shows the server's message when the code is refused", async () => {
      verifyMfaMutation.mutateAsync.mockRejectedValue(
        new Error("That code has expired."),
      );
      const user = await reachMfaStep();

      await user.type(screen.getByLabelText("6-digit code"), "000000");
      await user.click(
        screen.getByRole("button", { name: /verify and sign in/i }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "That code has expired.",
      );
      expect(push).not.toHaveBeenCalled();
    });

    it("points at an administrator rather than a recovery route that does not exist", async () => {
      await reachMfaStep();

      expect(
        screen.getByText(/Contact your Neptune\s+administrator/),
      ).toBeInTheDocument();
    });

    it("goes back to the password form, spending the challenge token", async () => {
      const user = await reachMfaStep();

      await user.click(
        screen.getByRole("button", { name: "Use a different account" }),
      );

      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.queryByLabelText("6-digit code")).not.toBeInTheDocument();
      expect(loginMutation.reset).toHaveBeenCalled();
      expect(verifyMfaMutation.reset).toHaveBeenCalled();
    });

    it("clears a stale error when going back", async () => {
      verifyMfaMutation.mutateAsync.mockRejectedValue(new Error("Bad code."));
      const user = await reachMfaStep();

      await user.type(screen.getByLabelText("6-digit code"), "000000");
      await user.click(
        screen.getByRole("button", { name: /verify and sign in/i }),
      );
      await screen.findByRole("alert");

      await user.click(
        screen.getByRole("button", { name: "Use a different account" }),
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
