"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { Text } from "@/components/Text";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Button } from "@/components/ui/Button";
import { AuthFooterLink } from "@/components/auth/AuthFooterLink";
import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import { safeParseForgotPasswordRequest } from "@/dtos/req/auth-request.dto";
import {
  getMutationErrorMessage,
  useForgotPasswordMutation,
} from "@/hooks/use-auth-mutations";
import { toast } from "@/lib/toast";

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export default function ForgotPasswordRightPanel() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const parsed = safeParseForgotPasswordRequest({
      email: getFormString(formData, "email"),
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
      await forgotPasswordMutation.mutateAsync(parsed.data);
      toast.success(
        "Reset code sent",
        "Check your inbox for the code to reset your password.",
      );
      router.push(
        `/reset-password?email=${encodeURIComponent(parsed.data.email)}`,
      );
    } catch (error) {
      setFormError(
        getMutationErrorMessage(
          error,
          "Could not send reset code. Please try again.",
        ),
      );
    }
  };

  const submitError =
    formError ||
    (forgotPasswordMutation.error
      ? getMutationErrorMessage(
          forgotPasswordMutation.error,
          "Could not send reset code. Please try again.",
        )
      : "");

  return (
    <AuthFormPanel
      title="Forgot password?"
      subtitle="Enter your email and we’ll send you a code to reset your password."
      footer={
        <AuthFooterLink
          prompt="Remember your password?"
          href="/login"
          linkLabel="Sign in"
        />
      }
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <EmailInput
          id="email"
          name="email"
          label="Email address"
          placeholder="you@company.com"
          required
          disabled={forgotPasswordMutation.isPending}
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
          isLoading={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? (
            "Sending…"
          ) : (
            <>
              Send reset code
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
