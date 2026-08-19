"use client";

import { Icon } from "@iconify/react";
import { useState, type ReactNode, type SubmitEvent } from "react";
import { CardHeading } from "@/components/CardHeading";
import { IncidentBadge } from "@/components/incidents/list/IncidentBadge";
import { Password } from "@/components/inputs/Password";
import { SettingsShell } from "@/components/settings/SettingsShell";
import { TwoFactorDisableDialog } from "@/components/settings/TwoFactorDisableDialog";
import { TwoFactorEnrollDialog } from "@/components/settings/TwoFactorEnrollDialog";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ToggleSwitch } from "@/components/profile/ToggleSwitch";
import { safeParseChangePasswordRequest } from "@/dtos/req/auth-request.dto";
import {
  getMutationErrorMessage,
  useChangePasswordMutation,
  useSetupMfaMutation,
} from "@/hooks/use-auth-mutations";
import { useLogout } from "@/hooks/use-logout";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { toast } from "@/lib/toast";

const settingsLabelClass = "text7 text-ehs-darker block";

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Change password.
 *
 * The API revokes every refresh token on success, so this signs the user out afterwards rather
 * than leaving them in a session that will drop without explanation the next time it tries to
 * renew. That is also the honest reading of what happened: the credential they signed in with
 * no longer exists.
 */
function ChangePasswordCard() {
  const [formError, setFormError] = useState("");
  const changePassword = useChangePasswordMutation();
  const { signOut, isLoggingOut } = useLogout();

  const isBusy = changePassword.isPending || isLoggingOut;

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const parsed = safeParseChangePasswordRequest({
      currentPassword: getFormString(formData, "currentPassword"),
      newPassword: getFormString(formData, "newPassword"),
      confirmPassword: getFormString(formData, "confirmPassword"),
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ??
          "Please check the form and try again.",
      );
      return;
    }

    setFormError("");

    try {
      // `confirmPassword` is a form-only field — it never leaves the browser.
      await changePassword.mutateAsync({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      });

      form.reset();
      toast.success(
        "Password changed",
        "Signing you out — sign back in with your new password.",
      );

      await signOut();
    } catch (error) {
      setFormError(
        getMutationErrorMessage(
          error,
          "Could not change your password. Try again.",
        ),
      );
    }
  };

  return (
    <GlassCard>
      <CardHeading
        title="Password"
        subtitle="At least 8 characters, including a letter, a number and a symbol."
      />

      <form className="mt-1 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid max-w-xl gap-4">
          <Password
            id="current-password"
            name="currentPassword"
            label="Current password"
            labelClassName={settingsLabelClass}
            placeholder="Enter current password"
            autoComplete="current-password"
            required
            disabled={isBusy}
          />
          <Password
            id="new-password"
            name="newPassword"
            label="New password"
            labelClassName={settingsLabelClass}
            placeholder="Enter new password"
            autoComplete="new-password"
            showStrengthMeter
            required
            disabled={isBusy}
          />
          <Password
            id="confirm-password"
            name="confirmPassword"
            label="Confirm new password"
            labelClassName={settingsLabelClass}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            required
            disabled={isBusy}
          />
        </div>

        {formError ? (
          <Text as="p" className="text-ehs-red text-xs" role="alert">
            {formError}
          </Text>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            className="text4 w-fit rounded-lg px-4 py-2"
            isLoading={isBusy}
          >
            {isBusy ? "Updating…" : "Update password"}
          </Button>

          <Text as="p" className="text8 text-ehs-muted-text">
            You&apos;ll be signed out on every device.
          </Text>
        </div>
      </form>
    </GlassCard>
  );
}

/** One labelled row inside the 2FA card. */
function SecurityRow(
  props: Readonly<{
    title: string;
    description: string;
    children: ReactNode;
  }>,
) {
  const { title, description, children } = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="p" className="text4 text-ehs-darker">
          {title}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          {description}
        </Text>
      </div>
      {children}
    </div>
  );
}

function TwoFactorCard() {
  const { user, isUserReady } = useSessionBootstrap();
  const setupMfa = useSetupMfaMutation();

  const [enrollment, setEnrollment] = useState<{
    secret: string;
    otpAuthUri: string;
  } | null>(null);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [error, setError] = useState("");

  const isEnabled = user.mfaEnabled;

  const startEnrollment = async () => {
    setError("");

    try {
      const setup = await setupMfa.mutateAsync();
      setEnrollment({ secret: setup.mfaSecret, otpAuthUri: setup.otpAuthUri });
    } catch (caught) {
      setError(
        getMutationErrorMessage(
          caught,
          "Could not start two-factor setup. Try again.",
        ),
      );
    }
  };

  const handleToggle = (next: boolean) => {
    if (next) {
      void startEnrollment();
      return;
    }

    setIsDisableOpen(true);
  };

  return (
    <GlassCard>
      <CardHeading
        title="Two-factor authentication"
        subtitle="A code from your authenticator app, on top of your password, every time you sign in."
      />

      <div className="divide-ehs-border/50 mt-1 flex flex-col divide-y">
        <SecurityRow
          title="Authenticator app"
          description={
            isEnabled
              ? "You'll be asked for a code when you sign in."
              : "Protect your account with a second step at sign-in."
          }
        >
          <div className="flex items-center gap-3">
            <IncidentBadge
              label={isEnabled ? "ENABLED" : "DISABLED"}
              tone={isEnabled ? "success" : "muted"}
            />
            <ToggleSwitch
              label="Two-factor authentication"
              checked={isEnabled}
              onChange={handleToggle}
              // Until Org/me resolves, `mfaEnabled` is false because it is unknown, not because
              // it is off — letting the toggle be pressed then would offer enrolment to someone
              // who already has it.
              disabled={!isUserReady || setupMfa.isPending}
            />
          </div>
        </SecurityRow>

        {isEnabled ? (
          <SecurityRow
            title="Lost your authenticator?"
            description="Turn two-factor off with your password, then set it up again on the new device."
          >
            <Button
              type="button"
              variant="tertiary"
              className="text4 rounded-lg px-4 py-2"
              onClick={() => setIsDisableOpen(true)}
            >
              Reset setup
            </Button>
          </SecurityRow>
        ) : null}
      </div>

      {error ? (
        <Text as="p" className="text-ehs-red mt-2 text-xs" role="alert">
          {error}
        </Text>
      ) : null}

      {!isEnabled && isUserReady ? (
        <div className="border-ehs-yellow/40 bg-ehs-yellow/10 rounded-2.5 mt-2 flex items-start gap-2.5 border p-3">
          <Icon
            icon="mdi:alert-outline"
            className="text-ehs-yellow mt-0.5 size-4.5 shrink-0"
            aria-hidden="true"
          />
          <Text as="p" className="text8 text-ehs-gray">
            Without two-factor authentication, anyone with your password can
            sign in to this account.
          </Text>
        </div>
      ) : null}

      <TwoFactorEnrollDialog
        open={enrollment !== null}
        secret={enrollment?.secret ?? ""}
        otpAuthUri={enrollment?.otpAuthUri ?? ""}
        onClose={() => setEnrollment(null)}
        onEnabled={() => setEnrollment(null)}
      />

      <TwoFactorDisableDialog
        open={isDisableOpen}
        onClose={() => setIsDisableOpen(false)}
        onDisabled={() => setIsDisableOpen(false)}
      />
    </GlassCard>
  );
}

export function SecuritySettingsClient() {
  return (
    <SettingsShell activeSection="security">
      <TwoFactorCard />
      <ChangePasswordCard />
    </SettingsShell>
  );
}
