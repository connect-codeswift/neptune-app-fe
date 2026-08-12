"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { AuthFooterLink } from "@/components/auth/AuthFooterLink";
import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import { AuthProviderButtons } from "@/components/auth/AuthProviderButtons";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { TextInput } from "@/components/inputs/TextInput";
import { safeParseSignupForm } from "@/dtos/req/auth-request.dto";
import { isStrongPassword } from "@/lib/password-strength";
import {
  getSignupFormInitialValues,
  saveSignupState,
  type SignupFormInitialValues,
} from "@/lib/signup-storage";

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export default function SignupRightPanel() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [formValues, setFormValues] = useState<SignupFormInitialValues>(
    getSignupFormInitialValues,
  );

  const canCreateAccount = isStrongPassword(formValues.password);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const parsed = safeParseSignupForm({
      fullName: getFormString(formData, "name"),
      email: getFormString(formData, "email"),
      password: getFormString(formData, "password"),
      confirmPassword: getFormString(formData, "confirmPassword"),
      acceptTerms: formData.get("acceptTerms") === "on",
    });

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ??
        "Please check the form and try again.";
      setFormError(firstError);
      return;
    }

    saveSignupState({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    setFormError("");
    router.push("/onboarding");
  };

  return (
    <AuthFormPanel
      title="Create your account."
      subtitle="Start your Neptune workspace in minutes."
      footer={
        <AuthFooterLink
          prompt="Already have an account?"
          href="/login"
          linkLabel="Sign in"
        />
      }
    >
      <AuthProviderButtons />

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <TextInput
          id="name"
          name="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={formValues.fullName}
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              fullName: event.target.value,
            }))
          }
          required
        />

        <EmailInput
          id="email"
          name="email"
          label="Email address"
          placeholder="you@company.com"
          value={formValues.email}
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          required
        />

        <Password
          id="password"
          name="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          showStrengthMeter
          value={formValues.password}
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          required
        />

        <Password
          id="confirm-password"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={formValues.confirmPassword}
          onChange={(event) => {
            setFormError("");
            setFormValues((current) => ({
              ...current,
              confirmPassword: event.target.value,
            }));
          }}
          required
        />

        <div className="mt-1 flex items-start gap-2">
          <input
            id="accept-terms"
            type="checkbox"
            name="acceptTerms"
            checked={formValues.acceptTerms}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                acceptTerms: event.target.checked,
              }))
            }
            required
            className="border-ehs-border text-ehs-normal-blue focus:ring-ehs-normal-blue/20 mt-0.5 size-4 shrink-0 rounded focus:ring-2"
          />
          <p className="text-ehs-muted-text text-xs leading-relaxed">
            <label htmlFor="accept-terms" className="cursor-pointer">
              I agree to Neptune&apos;s{" "}
            </label>
            <ScrollLink href="/terms-and-conditions" className="font-semibold">
              Terms &amp; Conditions
            </ScrollLink>{" "}
            and{" "}
            <ScrollLink href="/privacy" className="font-semibold">
              Privacy Policy
            </ScrollLink>
            .
          </p>
        </div>

        {formError ? (
          <Text as="p" className="text-ehs-red text-xs" role="alert">
            {formError}
          </Text>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!canCreateAccount}
        >
          Create account
          <Icon icon="mdi:arrow-right" className="text-lg" />
        </Button>
      </form>
    </AuthFormPanel>
  );
}
