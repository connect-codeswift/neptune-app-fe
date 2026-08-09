"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { ShadeBall } from "@/components/ShadeBall";
import { Text } from "@/components/Text";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { safeParseForgotPasswordRequest } from "@/dtos/req/auth-request.dto";
import {
  getMutationErrorMessage,
  useForgotPasswordMutation,
} from "@/hooks/use-auth-mutations";
import { ehsLinkClass } from "@/lib/ehs-classes";
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
              Forgot Password?
            </h2>
            <p className="text-ehs-muted-text mt-1.5 text-sm">
              Enter your email and we&apos;ll send you a code to reset your
              password.
            </p>
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <EmailInput
              id="email"
              name="email"
              label="Email Address"
              placeholder="Enter Your Email Address"
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
              className="w-full"
              isLoading={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  Send Reset Code
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
            Remember Your Password?{" "}
            <ScrollLink
              href="/login"
              className={`${ehsLinkClass} font-semibold`}
            >
              Sign In
            </ScrollLink>
          </p>
        </div>
      </div>
    </div>
  );
}
