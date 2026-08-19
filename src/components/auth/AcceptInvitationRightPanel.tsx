"use client";

import { Icon } from "@iconify/react";
import QRCode from "qrcode";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type SubmitEvent } from "react";
import { ShadeBall } from "@/components/ShadeBall";
import { Text } from "@/components/Text";
import { Password } from "@/components/inputs/Password";
import { TextInput } from "@/components/inputs/TextInput";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import {
  safeParseAcceptInvitationRequest,
  safeParseEnableMfaRequest,
} from "@/dtos/req/auth-request.dto";
import {
  getMutationErrorMessage,
  useAcceptInvitationMutation,
  useDismissMfaPromptMutation,
  useEnableMfaMutation,
  useSetupMfaMutation,
} from "@/hooks/use-auth-mutations";
import { ehsLinkClass } from "@/lib/ehs-classes";
import { WEAK_PASSWORD_MESSAGE } from "@/lib/password-strength";
import { toast } from "@/lib/toast";

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Deliberately the only message shown for a rejected token.
 *
 * Expired, already used and never-existed all come back from the API as the same error, so
 * that the endpoint cannot be used to probe which invitations exist. Rendering the server's
 * text verbatim would be harmless today and a disclosure the day that stops being true.
 */
const INVALID_TOKEN_MESSAGE =
  "This invitation is no longer valid. It may have expired or already been used — ask your administrator for a new one.";

type Step = "password" | "mfa";

export default function AcceptInvitationRightPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Single query param now. It replaced `?siteId=&userId=&email=`, where the id was a
  // sequential integer — guessing one set that person's password.
  const token = searchParams.get("token")?.trim() ?? "";
  const linkIsUsable = token !== "";

  const [step, setStep] = useState<Step>("password");
  const [formError, setFormError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");

  const acceptInvitationMutation = useAcceptInvitationMutation();
  const setupMfaMutation = useSetupMfaMutation();
  const enableMfaMutation = useEnableMfaMutation();
  const dismissMfaPromptMutation = useDismissMfaPromptMutation();

  // Rendered locally on purpose: the otpauth URI contains the TOTP shared secret, so it must
  // never be handed to a third-party QR image service.
  useEffect(() => {
    if (!setupMfaMutation.data?.otpAuthUri) {
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(setupMfaMutation.data.otpAuthUri, {
      margin: 1,
      width: 220,
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        // The secret below the QR is the documented fallback for exactly this case,
        // so a render failure degrades to manual entry rather than blocking setup.
        if (!cancelled) {
          setQrDataUrl("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setupMfaMutation.data?.otpAuthUri]);

  const handlePasswordSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const password = getFormString(formData, "password");
    const confirmPassword = getFormString(formData, "confirmPassword");

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const contactNo = getFormString(formData, "contactNo").trim();

    const parsed = safeParseAcceptInvitationRequest({
      token,
      fullName: getFormString(formData, "fullName"),
      contactNo: contactNo === "" ? undefined : contactNo,
      password,
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ??
          "Please check the form and try again.",
      );
      return;
    }

    setFormError("");

    let session: Awaited<
      ReturnType<typeof acceptInvitationMutation.mutateAsync>
    >;

    try {
      session = await acceptInvitationMutation.mutateAsync(parsed.data);
    } catch {
      setFormError(INVALID_TOKEN_MESSAGE);
      return;
    }

    // The account exists and the password is set, but nothing identified it well enough to
    // sign in with. Both MFA endpoints are [Authorize]d, so the offer has to be skipped
    // rather than shown broken.
    if (!session) {
      toast.success(
        "Account ready",
        "Sign in with your new password to continue.",
      );
      router.push("/login");
      return;
    }

    // Password is set and we hold a session. Offer 2FA; a failure to fetch the secret is
    // not worth blocking on, since the account already works without it.
    try {
      const setup = await setupMfaMutation.mutateAsync();
      setSecret(setup.mfaSecret);
      setStep("mfa");
    } catch {
      toast.success(
        "Account ready",
        "You can turn on two-factor authentication later from your profile.",
      );
      router.push("/dashboard");
    }
  };

  const handleMfaSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const parsed = safeParseEnableMfaRequest({
      code: getFormString(new FormData(form), "code"),
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Enter the 6-digit code.",
      );
      return;
    }

    setFormError("");

    try {
      await enableMfaMutation.mutateAsync(parsed.data);
      toast.success(
        "Two-factor authentication on",
        "You'll be asked for a code the next time you sign in.",
      );
      router.push("/dashboard");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(
          error,
          "That code wasn't accepted. Check your authenticator app and try again.",
        ),
      );
    }
  };

  const handleSkipMfa = async () => {
    // Best effort: the dismissal only silences a future prompt, so a failure here
    // must not strand a user who already has a working account.
    try {
      await dismissMfaPromptMutation.mutateAsync();
    } catch {
      // ignored on purpose
    }

    router.push("/dashboard");
  };

  if (!linkIsUsable) {
    return (
      <div className="bg-ehs-light-bg relative flex h-full items-center justify-center px-4 py-8 lg:px-8">
        <ShadeBall positionAsClassName="-top-37.5 -right-37.5" blur={80} />
        <div className="flex w-full max-w-sm flex-col gap-4">
          <h2 className="text-ehs-darker text-2xl font-bold">
            This invitation link is incomplete
          </h2>
          <p className="text-ehs-muted-text text-sm">
            Open the link straight from your invitation email without editing
            it. If it still fails, ask your administrator to send a new
            invitation.
          </p>
          <ScrollLink href="/login" className={`${ehsLinkClass} font-semibold`}>
            Back To Sign In
          </ScrollLink>
        </div>
      </div>
    );
  }

  const isSubmittingPassword =
    acceptInvitationMutation.isPending || setupMfaMutation.isPending;

  return (
    <div className="bg-ehs-light-bg relative flex h-full items-center justify-center px-4 py-8 lg:px-8">
      <ShadeBall positionAsClassName="-top-37.5 -right-37.5" blur={80} />
      <ShadeBall positionAsClassName="-bottom-37.5 -left-37.5" blur={80} />

      {step === "password" ? (
        <div className="flex w-full max-w-sm flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-ehs-darker text-2xl font-bold">
              Set Up Your Account
            </h2>
            {/* No email to greet them with any more — it lives on the token's row now,
                not in the URL, and the endpoint does not hand it back before submit. */}
            <p className="text-ehs-muted-text mt-1.5 text-sm">
              You&apos;ve been invited to Neptune EHS. Choose a password to
              finish setting up your account.
            </p>
          </div>

          <form className="flex flex-col gap-3" onSubmit={handlePasswordSubmit}>
            <TextInput
              id="fullName"
              name="fullName"
              label="Full Name"
              placeholder="Enter Your Full Name"
              autoComplete="name"
              maxLength={50}
              required
              disabled={isSubmittingPassword}
            />

            <TextInput
              id="contactNo"
              name="contactNo"
              label="Contact Number (Optional)"
              placeholder="Enter Your Contact Number"
              autoComplete="tel"
              type="tel"
              maxLength={30}
              disabled={isSubmittingPassword}
            />

            <Password
              id="password"
              name="password"
              label="Password"
              placeholder="Create Your Password"
              autoComplete="new-password"
              showStrengthMeter
              required
              disabled={isSubmittingPassword}
            />

            <Password
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-Enter Your Password"
              autoComplete="new-password"
              required
              disabled={isSubmittingPassword}
            />

            <Text as="p" className="text-ehs-muted-text text-xs">
              {WEAK_PASSWORD_MESSAGE}
            </Text>

            {formError ? (
              <Text as="p" className="text-ehs-red text-xs" role="alert">
                {formError}
              </Text>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmittingPassword}
            >
              {isSubmittingPassword ? (
                "Setting Up..."
              ) : (
                <>
                  Continue
                  <Icon
                    icon="mdi:arrow-right"
                    className="text-lg"
                    aria-hidden="true"
                  />
                </>
              )}
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-ehs-darker text-2xl font-bold">
              Add Two-Factor Authentication
            </h2>
            <p className="text-ehs-muted-text mt-1.5 text-sm">
              Optional, and you can add it later. Scan this with Google
              Authenticator, Microsoft Authenticator or 1Password, then enter
              the 6-digit code.
            </p>
          </div>

          <div className="border-ehs-border bg-ehs-surface flex flex-col items-center gap-3 rounded-xl border p-4">
            {qrDataUrl ? (
              /* `qrDataUrl` is a client-generated data: URI — nothing for
                 next/image to fetch or optimise. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="QR code for setting up two-factor authentication"
                width={220}
                height={220}
                className="h-55 w-55"
              />
            ) : (
              <p className="text-ehs-muted-text py-6 text-center text-xs">
                Could not draw the QR code. Enter the key below by hand instead.
              </p>
            )}

            <div className="flex w-full flex-col gap-1">
              <span className="text-ehs-muted-text text-xs">
                Or enter this key manually
              </span>
              <code className="text-ehs-darker bg-ehs-light-bg rounded-md px-2 py-1.5 text-center text-xs tracking-widest break-all">
                {secret}
              </code>
            </div>
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleMfaSubmit}>
            <TextInput
              id="code"
              name="code"
              label="6-Digit Code"
              placeholder="000000"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              required
              disabled={enableMfaMutation.isPending}
            />

            {formError ? (
              <Text as="p" className="text-ehs-red text-xs" role="alert">
                {formError}
              </Text>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={enableMfaMutation.isPending}
            >
              {enableMfaMutation.isPending
                ? "Verifying..."
                : "Turn On Two-Factor"}
            </Button>

            <Button
              type="button"
              variant="tertiary"
              className="w-full"
              onClick={handleSkipMfa}
              isLoading={dismissMfaPromptMutation.isPending}
              disabled={enableMfaMutation.isPending}
            >
              Skip For Now
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
