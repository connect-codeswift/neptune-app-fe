"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type SubmitEvent } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { AuthFooterLink } from "@/components/auth/AuthFooterLink";
import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import { AuthProviderButtons } from "@/components/auth/AuthProviderButtons";
import { NeptuneLoader } from "@/components/ui/NeptuneLoader";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { safeParseLoginRequest } from "@/dtos/req/auth-request.dto";
import {
  getMutationErrorMessage,
  useLoginMutation,
} from "@/hooks/use-auth-mutations";
import { ehsLinkClass } from "@/lib/ehs-classes";
import { consumeAuthRedirectMessage } from "@/lib/access-window";

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * How long the sign-in loader is held before navigating.
 *
 * Prefetching /dashboard made the hand-off fast enough that the loader would
 * otherwise flash for a frame or two — long enough to register as a flicker,
 * too short to read as anything. This holds it just past that threshold so it
 * lands as a deliberate beat rather than a glitch.
 *
 * It is real added latency, unlike the gap it replaced, so keep it short: at
 * 800ms the arc travels a little under half a turn, which is enough to show
 * the mark and that something is happening. Set to 0 to hand off as fast as
 * the network allows and accept the flicker.
 */
const LOADER_MIN_VISIBLE_MS = 800;

export default function LoginRightPanel() {
  const router = useRouter();
  // Read once on mount — `consumeAuthRedirectMessage` clears sessionStorage.
  const [formError, setFormError] = useState(
    () => consumeAuthRedirectMessage() ?? "",
  );
  // Stays true from a successful sign-in until this panel unmounts, so the
  // loader covers the route change too. `loginMutation.isPending` alone goes
  // false the moment the request resolves, which is exactly when the blank
  // gap used to start.
  const [isEnteringApp, setIsEnteringApp] = useState(false);
  const loginMutation = useLoginMutation();

  useEffect(() => {
    // /dashboard is reached by router.push, not a <Link>, so Next never
    // prefetches it and the whole route — shell, sidebar, six cards and
    // recharts — was still downloading after the password was accepted.
    // Warming it while the user types turns that into a cache hit.
    router.prefetch("/dashboard");
  }, [router]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const parsed = safeParseLoginRequest({
      email: getFormString(formData, "email"),
      password: getFormString(formData, "password"),
    });

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ??
        "Please check the form and try again.";
      setFormError(firstError);
      return;
    }

    setFormError("");

    try {
      await loginMutation.mutateAsync(parsed.data);
      setIsEnteringApp(true);
      await new Promise((resolve) => {
        globalThis.setTimeout(resolve, LOADER_MIN_VISIBLE_MS);
      });
      router.push("/dashboard");
    } catch (error) {
      setIsEnteringApp(false);
      setFormError(
        getMutationErrorMessage(error, "Sign in failed. Please try again."),
      );
    }
  };

  const submitError =
    formError ||
    (loginMutation.error
      ? getMutationErrorMessage(
          loginMutation.error,
          "Sign in failed. Please try again.",
        )
      : "");

  return (
    <AuthFormPanel
      title="Welcome back."
      subtitle="Sign in to your Neptune workspace."
      overlay={
        isEnteringApp ? (
          <NeptuneLoader fullScreen label="Signing you in…" />
        ) : null
      }
      footer={
        <AuthFooterLink
          prompt="Don't have an account?"
          href="/signup"
          linkLabel="Sign up"
        />
      }
    >
      <AuthProviderButtons />

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <EmailInput
          id="email"
          name="email"
          label="Email address"
          placeholder="you@company.com"
          required
          disabled={loginMutation.isPending}
        />

        <div className="mt-1 mb-2 flex w-full flex-col gap-1.5">
          <Password
            id="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
            disabled={loginMutation.isPending}
          />
          <ScrollLink
            href="/forget-password"
            className={`${ehsLinkClass} ml-auto block text-sm font-medium`}
          >
            Forgot password?
          </ScrollLink>
        </div>

        {submitError ? (
          <Text as="p" className="text-ehs-red text-xs" role="alert">
            {submitError}
          </Text>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            "Signing in…"
          ) : (
            <>
              Sign in
              <Icon icon="mdi:arrow-right" className="text-lg" />
            </>
          )}
        </Button>
      </form>
    </AuthFormPanel>
  );
}
