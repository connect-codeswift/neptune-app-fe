"use client";

import { Icon } from "@iconify/react";
import { LogoIcon } from "@/components/LogoIcon";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { TextInput } from "@/components/inputs/TextInput";

const features = [
  {
    title: "Incident Management",
    description: "Report and close incidents faster",
  },
  {
    title: "Compliance Audits",
    description: "300+ templates, audit-ready instantly",
  },
  {
    title: "Sustainability & ESG",
    description: "Track emissions, generate GRI reports",
  },
  {
    title: "SOC 2 Type II",
    description: "Enterprise-grade security, always on",
  },
] as const;

function LeftPanel() {
  return (
    <div className="from-ehs-light-blue relative hidden h-full flex-col justify-between overflow-hidden bg-linear-to-br via-white to-ehs-light-blue/60 p-10 lg:flex">
      <div className="relative z-10 space-y-10">
        <LogoIcon />

        <div className="max-w-md space-y-4">
          <h1 className="text-ehs-darker text-4xl leading-tight font-bold">
            Safety management, finally unified.
          </h1>
          <p className="text-ehs-muted-text text-sm leading-relaxed">
            Join 2,400+ sites using Neptune to manage incidents, audits, CAPAs,
            and sustainability — all in one place.
          </p>
        </div>

        <ul className="max-w-md space-y-5">
          {features.map((item) => (
            <li key={item.title} className="space-y-1">
              <p className="text-ehs-darker text-sm font-semibold">
                {item.title}
              </p>
              <p className="text-ehs-muted-text text-sm">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-ehs-light-blue relative z-10 mt-10 max-w-md rounded-xl px-5 py-4">
        <p className="text-ehs-darker text-sm font-semibold">
          30-day free trial, full access
        </p>
        <p className="text-ehs-muted-text mt-1 text-sm">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

function RightPanel() {
  return (
    <div
      className="flex items-center justify-center p-8"
      style={{ background: "var(--ehs-light-bg)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-ehs-darker text-3xl font-bold">
            Create your account.
          </h2>
          <p className="text-ehs-muted-text text-sm">
            Start your Neptune workspace in minutes.
          </p>
        </div>

        <Button
          type="button"
          variant="tertiary"
          className="w-full gap-3 font-medium"
        >
          <Icon icon="flat-color-icons:google" className="text-lg" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <hr className="border-ehs-border flex-1" />
          <span className="text-ehs-muted-text text-xs">
            or sign up with email
          </span>
          <hr className="border-ehs-border flex-1" />
        </div>

        <form className="space-y-4">
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
            placeholder="Create a password"
            required
          />

          <Password
            id="confirm-password"
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            required
          />

          <Button type="submit" variant="primary" className="w-full">
            Create account
            <Icon icon="mdi:arrow-right" />
          </Button>
        </form>

        <p className="text-ehs-muted-text text-center text-sm">
          Already have an account?{" "}
          <ScrollLink href="/login" className="font-semibold">
            Sign in
          </ScrollLink>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="relative grid h-screen lg:grid-cols-2">
      <div className="relative h-screen overflow-y-hidden">
        <LeftPanel />
      </div>
      <div className="relative min-h-screen overflow-y-auto">
        <RightPanel />
      </div>
    </div>
  );
}
