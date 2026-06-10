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
import { saveSignupState } from "@/lib/signup-storage";
import { ShadeBall } from "@/components/ShadeBall";

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export default function SignupRightPanel() {
  const router = useRouter();
  const [formError, setFormError] = useState("");

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
        parsed.error.issues[0]?.message ?? "Please check the form and try again.";
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
            Create your account.
          </h2>
          <p className="text-ehs-muted-text text-xs lg:text-sm">
            Start your Neptune workspace in minutes.
          </p>
        </div>

        <Button
          onClick={() => router.push("/onboarding")}
          type="button"
          variant="tertiary"
          className="w-full font-medium"
        >
          <Icon icon="flat-color-icons:google" className="text-sm" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-2">
          <hr className="border-ehs-border flex-1" />
          <span className="text-ehs-muted-text text-xs">
            or sign up with email
          </span>
          <hr className="border-ehs-border flex-1" />
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <TextInput
            id="name"
            name="name"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Sarah Nordvik"
            required
          />

          <EmailInput
            id="email"
            name="email"
            label="Email address"
            placeholder="sarah@nordvik.com"
            required
          />

          <Password
            id="password"
            name="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            showStrengthMeter
            required
          />

          <Password
            id="confirm-password"
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            required
            onChange={() => setFormError("")}
          />

          <div className="flex items-start gap-2">
            <input
              id="accept-terms"
              type="checkbox"
              name="acceptTerms"
              required
              className="border-ehs-border text-ehs-normal-blue focus:ring-ehs-normal-blue/20 mt-0.5 size-4 shrink-0 rounded focus:ring-2"
            />
            <p className="text-ehs-muted-text text-xs leading-relaxed">
              <label htmlFor="accept-terms" className="cursor-pointer">
                I agree to Neptune&apos;s{" "}
              </label>
              <ScrollLink href="/tos" className="font-semibold">
                Terms of Service
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
          Already have an account?{" "}
          <ScrollLink href="/login" className={`${ehsLinkClass} font-semibold`}>
            Sign in
          </ScrollLink>
        </p>
      </div>
    </div>
  );
}
