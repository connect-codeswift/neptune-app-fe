"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type SubmitEvent } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { LogoIcon } from "@/components/LogoIcon";
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
import { ShadeBall } from "@/components/ShadeBall";

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

/**
 * The auth card's own glass, not GLASS_SURFACE: the dashboard surface is
 * tuned for cards over the app's ambient gradient, and at 62% white on this
 * near-white page it reads as a plain card. Glass only reads as glass when
 * there is colour behind it to blur, so this pane is thinner (45% white,
 * heavier blur) and the panel paints soft colour blobs behind it below.
 */
const authGlassClass =
  "rounded-3xl border border-white/60 bg-white/45 backdrop-blur-2xl " +
  "shadow-[0_1px_2px_0_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.18),inset_0_1px_0_1px_rgba(255,255,255,0.85)]";

export default function LoginRightPanel() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  // Stays true from a successful sign-in until this panel unmounts, so the
  // loader covers the route change too. `loginMutation.isPending` alone goes
  // false the moment the request resolves, which is exactly when the blank
  // gap used to start.
  const [isEnteringApp, setIsEnteringApp] = useState(false);
  const loginMutation = useLoginMutation();

  useEffect(() => {
    const redirectMessage = consumeAuthRedirectMessage();

    if (redirectMessage) {
      setFormError(redirectMessage);
    }
  }, []);

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
    <div className="bg-ehs-light-bg relative flex h-full items-center justify-center px-4 py-0 lg:px-8 lg:py-8">
      {isEnteringApp ? (
        <NeptuneLoader fullScreen label="Signing you in…" />
      ) : null}

      <ShadeBall positionAsClassName="top-[-150px] right-[-150px]" blur={80} />
      <ShadeBall
        positionAsClassName="bottom-[-150px] left-[-150px]"
        blur={80}
      />

      {/* Colour for the glass to blur: without these, the pane sits on a
          near-white ground and reads as a plain card. Placed to break across
          the card's edges, where refraction is most visible. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="bg-ehs-normal-blue/25 absolute top-[24%] left-1/2 size-80 -translate-x-[85%] rounded-full blur-3xl" />
        <div className="absolute top-[58%] left-1/2 size-80 -translate-x-[8%] rounded-full bg-cyan-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-[34rem] flex-col gap-6">
        {/* The brand panel is hidden below lg, which left phones with no logo
            anywhere on the page — this is the mobile-only signature. */}
        <LogoIcon variant="dark" className="mx-auto h-5 w-auto lg:hidden" />

        {/* Not <GlassCard>: the shared component carries hover-lift, and a
            form shouldn't lift under the cursor like a clickable card. The
            rise entrance alone is welcome here. */}
        <div
          className={`${authGlassClass} animate-card-rise flex flex-col gap-6 p-7 sm:p-12`}
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="text-ehs-darker text-2xl font-bold tracking-tight lg:text-3xl">
              Welcome back.
            </h2>
            <p className="text-ehs-muted-text text-sm">
              Sign in to your Neptune workspace.
            </p>
          </div>

          <Button
            type="button"
            variant="tertiary"
            className="w-full bg-white font-medium"
          >
            <Icon icon="flat-color-icons:google" className="text-lg" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <hr className="border-ehs-border flex-1" />
            <span className="text-ehs-muted-text text-xs">
              or continue with email
            </span>
            <hr className="border-ehs-border flex-1" />
          </div>

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
        </div>

        <p className="text-ehs-muted-text text-center text-sm">
          Don&apos;t have an account?{" "}
          <ScrollLink
            href="/signup"
            className={`${ehsLinkClass} font-semibold`}
          >
            Sign up
          </ScrollLink>
        </p>
      </div>
    </div>
  );
}
