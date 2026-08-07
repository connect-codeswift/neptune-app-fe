"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type SubmitEvent } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
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

export default function LoginRightPanel() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const loginMutation = useLoginMutation();

  useEffect(() => {
    const redirectMessage = consumeAuthRedirectMessage();

    if (redirectMessage) {
      setFormError(redirectMessage);
    }
  }, []);

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
      router.push("/dashboard");
    } catch (error) {
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
      <ShadeBall positionAsClassName="top-[-150px] right-[-150px]" blur={80} />
      <ShadeBall
        positionAsClassName="bottom-[-150px] left-[-150px]"
        blur={80}
      />

      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-ehs-darker text-2xl font-bold lg:text-4xl">
            Welcome Back.
          </h2>
          <p className="text-ehs-muted-text text-xs lg:text-sm">
            Sign In To Your Neptune Workspace.
          </p>
        </div>

        <Button type="button" variant="tertiary" className="w-full font-medium">
          <Icon icon="flat-color-icons:google" className="text-lg" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-2">
          <hr className="border-ehs-border flex-1" />
          <span className="text-ehs-muted-text text-xs">
            or Sign In With Email
          </span>
          <hr className="border-ehs-border flex-1" />
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <EmailInput
            id="email"
            name="email"
            label="Email Address"
            placeholder="Enter Your Email Address"
            required
            disabled={loginMutation.isPending}
          />

          <div className="mt-1 mb-2 flex w-full flex-col gap-1">
            <Password
              id="password"
              name="password"
              label="Password"
              placeholder="Enter Your Password"
              required
              disabled={loginMutation.isPending}
            />
            <ScrollLink
              href="/forget-password"
              className={`${ehsLinkClass} ml-auto block font-medium`}
            >
              Forgot Password?
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              "Signing in..."
            ) : (
              <>
                Sign in
                <Icon icon="mdi:arrow-right" className="text-lg" />
              </>
            )}
          </Button>
        </form>

        <p className="text-ehs-muted-text text-center text-sm">
          Don&apos;t Have an Account?{" "}
          <ScrollLink
            href="/signup"
            className={`${ehsLinkClass} font-semibold`}
          >
            Sign Up
          </ScrollLink>
        </p>
      </div>
    </div>
  );
}
