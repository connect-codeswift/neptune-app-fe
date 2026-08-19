"use client";

import { useState, type SubmitEvent } from "react";
import { Password } from "@/components/inputs/Password";
import { TextInput } from "@/components/inputs/TextInput";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { safeParseDisableMfaRequest } from "@/dtos/req/auth-request.dto";
import {
  getMutationErrorMessage,
  useDisableMfaMutation,
} from "@/hooks/use-auth-mutations";
import { toast } from "@/lib/toast";

export type TwoFactorDisableDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onDisabled: () => void;
}>;

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Turning 2FA off, with re-authentication.
 *
 * Both fields are offered rather than one, because the API accepts either and which one is
 * *required* depends on the account: a password account must send its password, while an
 * SSO-only account has no password hash to verify against and sends a current authenticator
 * code instead. The frontend cannot tell those apart — nothing in the session says whether the
 * account has a password — so it collects what the user can supply and lets the API decide.
 */
export function TwoFactorDisableDialog(
  props: Readonly<TwoFactorDisableDialogProps>,
) {
  const { open, onClose, onDisabled } = props;

  const [formError, setFormError] = useState("");
  const disableMfa = useDisableMfaMutation();

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const currentPassword = getFormString(formData, "currentPassword");
    const code = getFormString(formData, "code");

    const parsed = safeParseDisableMfaRequest({
      // Omitted rather than sent empty: the API treats a present-but-blank field as an attempt
      // to verify with it, and would answer "current password is incorrect" to someone who
      // deliberately used a code instead.
      ...(currentPassword ? { currentPassword } : {}),
      ...(code ? { code } : {}),
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ??
          "Confirm it's you before turning off two-factor authentication.",
      );
      return;
    }

    setFormError("");

    try {
      await disableMfa.mutateAsync(parsed.data);
      toast.success(
        "Two-factor authentication is off",
        "Delete the old Neptune entry from your authenticator app — it no longer works.",
      );
      onDisabled();
    } catch (error) {
      setFormError(
        getMutationErrorMessage(
          error,
          "Could not turn off two-factor authentication. Try again.",
        ),
      );
    }
  };

  return (
    <SettingsDialog
      open={open}
      title="Turn off two-factor authentication"
      description="Your account will be protected by your password alone."
      icon="mdi:shield-off-outline"
      onClose={onClose}
      isBusy={disableMfa.isPending}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Password
          id="mfa-disable-password"
          name="currentPassword"
          label="Current password"
          placeholder="Enter your password"
          autoComplete="current-password"
          autoFocus
          disabled={disableMfa.isPending}
        />

        <div className="flex flex-col gap-1.5">
          <TextInput
            id="mfa-disable-code"
            name="code"
            label="Authenticator code (optional)"
            placeholder="000000"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            disabled={disableMfa.isPending}
          />
          <Text as="p" className="text8 text-ehs-muted-text">
            Only needed if you sign in with Microsoft or Google and have no
            Neptune password.
          </Text>
        </div>

        <Text as="p" className="text8 text-ehs-muted-text">
          The current setup is discarded. If you turn two-factor back on later
          you will scan a new QR code, and the old entry in your authenticator
          app will stop working.
        </Text>

        {formError ? (
          <Text as="p" className="text-ehs-red text-xs" role="alert">
            {formError}
          </Text>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="tertiary"
            onClick={onClose}
            disabled={disableMfa.isPending}
            className="text4 rounded-lg px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={disableMfa.isPending}
            className="text4 rounded-lg px-4 py-2"
          >
            {disableMfa.isPending ? "Turning off…" : "Turn off"}
          </Button>
        </div>
      </form>
    </SettingsDialog>
  );
}
