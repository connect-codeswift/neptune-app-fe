"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { TextInput } from "@/components/inputs/TextInput";
import { safeParseSignupForm } from "@/dtos/req/auth-request.dto";
import { ehsLinkClass } from "@/lib/ehs-classes";
import {
  getSignupFormInitialValues,
  saveSignupState,
  type SignupFormInitialValues,
} from "@/lib/signup-storage";
import { ShadeBall } from "@/components/ShadeBall";

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
    <div className="bg-ehs-light-bg relative flex h-full items-center justify-center p-8">
      <ShadeBall
        positionAsClassName="bottom-[-150px] left-[-150px]"
        blur={120}
      />
      <ShadeBall positionAsClassName="top-[-150px] right-[-150px]" blur={80} />

      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-ehs-darker text-2xl font-bold lg:text-4xl">
            Create Your Account.
          </h2>
          <p className="text-ehs-muted-text text-xs lg:text-sm">
            Start Your Neptune Workspace in Minutes.
          </p>
        </div>

        <Button
          onClick={() => router.push("/onboarding")}
          type="button"
          variant="tertiary"
          className="w-full font-medium"
        >
          <Icon icon="flat-color-icons:google" className="text-sm" />
          Continue With Google
        </Button>

        <div className="flex items-center gap-2">
          <hr className="border-ehs-border flex-1" />
          <span className="text-ehs-muted-text text-xs">
            or Sign Up With Email
          </span>
          <hr className="border-ehs-border flex-1" />
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <TextInput
            id="name"
            name="name"
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="Enter Your Full Name"
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
            label="Email Address"
            placeholder="Enter Your Email Address"
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
            placeholder="Create A Strong Password"
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
            label="Confirm Password"
            autoComplete="new-password"
            placeholder="Confirm Your Password"
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

          <div className="flex items-start gap-2">
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
                I agree with the Neptune&apos;s{" "}
              </label>
              <ScrollLink
                href="/terms-and-conditions"
                className="font-semibold"
              >
                Terms & Conditions
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

          <Button type="submit" variant="primary" className="w-full">
            Create account
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Button>
        </form>

        <p className="text-ehs-muted-text text-center text-sm">
          Already Have an Account?{" "}
          <ScrollLink href="/login" className={`${ehsLinkClass} font-semibold`}>
            Sign In
          </ScrollLink>
        </p>
      </div>
    </div>
  );
}
