"use client";

import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { ShadeBall } from "@/components/ShadeBall";
import { Text } from "@/components/Text";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { TextInput } from "@/components/inputs/TextInput";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { safeParseResetPasswordRequest } from "@/dtos/req/auth-request.dto";
import {
  getMutationErrorMessage,
  useResetPasswordMutation,
} from "@/hooks/use-auth-mutations";
import { ehsLinkClass } from "@/lib/ehs-classes";
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
    <div className="relative h-full overflow-hidden">
      <ShadeBall positionAsClassName="top-[-150px] right-[-150px]" blur={80} />
      <ShadeBall
        positionAsClassName="bottom-[-150px] left-[-150px]"
        blur={80}
      />

      <div
        className="flex h-full items-center justify-center p-8"
        style={{ background: "var(--ehs-light-bg)" }}
      >
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-ehs-darker text-2xl font-bold">
              Reset Password
            </h2>
            <p className="text-ehs-muted-text mt-1.5 text-sm">
              Enter the code from your email and choose a new password.
            </p>
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <EmailInput
              id="email"
              name="email"
              label="Email Address"
              placeholder="Enter Your Email Address"
              defaultValue={emailFromQuery}
              required
              disabled={resetPasswordMutation.isPending}
            />

            <TextInput
              id="otp"
              name="otp"
              label="Reset Code"
              placeholder="Enter The Code From Your Email"
              autoComplete="one-time-code"
              inputMode="numeric"
              required
              disabled={resetPasswordMutation.isPending}
            />

            <Password
              id="newPassword"
              name="newPassword"
              label="New Password"
              placeholder="Enter Your New Password"
              autoComplete="new-password"
              required
              disabled={resetPasswordMutation.isPending}
            />

            <Password
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm Your New Password"
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
              className="w-full"
              isLoading={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                "Updating..."
              ) : (
                <>
                  Reset Password
                  <Icon
                    icon="mdi:arrow-right"
                    className="text-lg"
                    aria-hidden="true"
                  />
                </>
              )}
            </Button>
          </form>

          <p className="text-ehs-muted-text text-center text-sm">
            Didn&apos;t Get A Code?{" "}
            <ScrollLink
              href="/forget-password"
              className={`${ehsLinkClass} font-semibold`}
            >
              Request A New One
            </ScrollLink>
          </p>
        </div>
      </div>
    </div>
  );
}
