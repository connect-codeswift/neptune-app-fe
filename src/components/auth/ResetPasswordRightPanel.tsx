"use client";

import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { Text } from "@/components/Text";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { TextInput } from "@/components/inputs/TextInput";
import { Button } from "@/components/ui/Button";
import { AuthFooterLink } from "@/components/auth/AuthFooterLink";
import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import { safeParseResetPasswordRequest } from "@/dtos/req/auth-request.dto";
import {
  getMutationErrorMessage,
  useResetPasswordMutation,
} from "@/hooks/use-auth-mutations";
import { toast } from "@/lib/toast";

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export default function ResetPasswordRightPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";
  const [formError, setFormError] = useState("");
  const resetPasswordMutation = useResetPasswordMutation();

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const newPassword = getFormString(formData, "newPassword");
    const confirmPassword = getFormString(formData, "confirmPassword");

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const parsed = safeParseResetPasswordRequest({
      email: getFormString(formData, "email"),
      otp: getFormString(formData, "otp"),
      newPassword,
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
      await resetPasswordMutation.mutateAsync(parsed.data);
      toast.success(
        "Password updated",
        "You can now sign in with your new password.",
      );
      router.push("/login");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(
          error,
          "Could not reset password. Please try again.",
        ),
      );
    }
  };

  const submitError =
    formError ||
    (resetPasswordMutation.error
      ? getMutationErrorMessage(
          resetPasswordMutation.error,
          "Could not reset password. Please try again.",
        )
      : "");

  return (
    <AuthFormPanel
      title="Reset password."
      subtitle="Enter the code from your email and choose a new password."
      footer={
        <AuthFooterLink
          prompt="Didn't get a code?"
          href="/forget-password"
          linkLabel="Request a new one"
        />
      }
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <EmailInput
          id="email"
          name="email"
          label="Email address"
          placeholder="you@company.com"
          defaultValue={emailFromQuery}
          required
          disabled={resetPasswordMutation.isPending}
        />

        <TextInput
          id="otp"
          name="otp"
          label="Reset code"
          placeholder="6-digit code from your email"
          autoComplete="one-time-code"
          inputMode="numeric"
          required
          disabled={resetPasswordMutation.isPending}
        />

        <Password
          id="newPassword"
          name="newPassword"
          label="New password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
          disabled={resetPasswordMutation.isPending}
        />

        <Password
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          required
          disabled={resetPasswordMutation.isPending}
        />

        {submitError ? (
          <Text as="p" className="text-ehs-red text-xs" role="alert">
            {submitError}
          </Text>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          className="mt-1 w-full"
          isLoading={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? (
            "Updating…"
          ) : (
            <>
              Reset password
              <Icon
                icon="mdi:arrow-right"
                className="text-lg"
                aria-hidden="true"
              />
            </>
          )}
        </Button>
      </form>
    </AuthFormPanel>
  );
}
