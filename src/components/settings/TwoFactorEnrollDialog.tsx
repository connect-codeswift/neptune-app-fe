"use client";

import QRCode from "qrcode";
import { useEffect, useState, type SubmitEvent } from "react";
import { TextInput } from "@/components/inputs/TextInput";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { safeParseEnableMfaRequest } from "@/dtos/req/auth-request.dto";
import {
  getMutationErrorMessage,
  useEnableMfaMutation,
} from "@/hooks/use-auth-mutations";
import { toast } from "@/lib/toast";

export type TwoFactorEnrollDialogProps = Readonly<{
  open: boolean;
  /** From POST /Auth/mfa/setup — the shared secret, shown as a manual fallback. */
  secret: string;
  /** From POST /Auth/mfa/setup — encoded as the QR, never sent anywhere. */
  otpAuthUri: string;
  onClose: () => void;
  onEnabled: () => void;
}>;

/**
 * Step two of turning 2FA on: scan, then prove the authenticator works.
 *
 * The code is required rather than optional. `mfa/setup` alone leaves a pending secret on the
 * account and 2FA still off — only `mfa/enable` flips it, and it will not flip without a valid
 * code. That ordering is what stops someone locking themselves out by enrolling an
 * authenticator they mis-scanned.
 */
export function TwoFactorEnrollDialog(
  props: Readonly<TwoFactorEnrollDialogProps>,
) {
  const { open, secret, otpAuthUri, onClose, onEnabled } = props;

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [formError, setFormError] = useState("");
  const enableMfa = useEnableMfaMutation();

  // Rendered locally on purpose: the otpauth URI contains the TOTP shared secret, so handing it
  // to a QR-image service would post the second factor to a third party.
  useEffect(() => {
    if (!otpAuthUri) {
      setQrDataUrl("");
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(otpAuthUri, {
      width: 220,
      margin: 1,
      color: { dark: "#0b1320", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        // The secret below the QR is the documented fallback for exactly this case, so a
        // failed render is a downgrade rather than a dead end.
        if (!cancelled) {
          setQrDataUrl("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [otpAuthUri]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = new FormData(form).get("code");

    const parsed = safeParseEnableMfaRequest({
      code: typeof value === "string" ? value : "",
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ??
          "Enter the 6-digit code from your authenticator app.",
      );
      return;
    }

    setFormError("");

    try {
      await enableMfa.mutateAsync(parsed.data);
      toast.success(
        "Two-factor authentication is on",
        "You'll be asked for a code the next time you sign in.",
      );
      onEnabled();
    } catch (error) {
      setFormError(
        getMutationErrorMessage(
          error,
          "That code didn't work. Try the current one from your app.",
        ),
      );
    }
  };

  return (
    <SettingsDialog
      open={open}
      title="Set up two-factor authentication"
      description="Scan this with Google Authenticator, Microsoft Authenticator or 1Password, then enter the code it shows."
      onClose={onClose}
      isBusy={enableMfa.isPending}
    >
      <div className="border-ehs-border bg-ehs-surface-raised rounded-2.5 flex flex-col items-center gap-3 border p-4">
        {qrDataUrl ? (
          /* `qrDataUrl` is a client-generated data: URI — nothing for next/image to fetch or
             optimise. The white plate is deliberate and stays white in dark mode: scanners
             need the quiet zone and the light/dark contrast the code was drawn with. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QR code for setting up two-factor authentication"
            width={220}
            height={220}
            className="size-55 rounded-lg bg-white p-2"
          />
        ) : (
          <Text as="p" className="text8 text-ehs-muted-text py-6 text-center">
            Could not draw the QR code. Enter the key below by hand instead.
          </Text>
        )}

        <div className="flex w-full flex-col gap-1">
          <Text as="span" className="text8 text-ehs-muted-text">
            Or enter this key manually
          </Text>
          <code className="text-ehs-darker bg-ehs-surface border-ehs-border rounded-md border px-2 py-1.5 text-center text-xs tracking-widest break-all">
            {secret}
          </code>
        </div>
      </div>

      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
        <TextInput
          id="mfa-enroll-code"
          name="code"
          label="6-digit code"
          placeholder="000000"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          required
          disabled={enableMfa.isPending}
        />

        {formError ? (
          <Text as="p" className="text-ehs-red text-xs" role="alert">
            {formError}
          </Text>
        ) : null}

        <div className="mt-1 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="tertiary"
            onClick={onClose}
            disabled={enableMfa.isPending}
            className="text4 rounded-lg px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={enableMfa.isPending}
            className="text4 rounded-lg px-4 py-2"
          >
            {enableMfa.isPending ? "Verifying…" : "Turn on"}
          </Button>
        </div>
      </form>
    </SettingsDialog>
  );
}
