"use client";

import { Icon } from "@iconify/react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { TextInput } from "@/components/inputs/TextInput";
import { authLinkClass } from "@/lib/auth-cqw-classes";
import { ShadeBall } from "@/components/ShadeBall";

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
    <div className="from-ehs-light-blue to-ehs-light-blue/60 relative hidden h-full flex-col justify-center overflow-hidden bg-linear-to-br via-white p-[2.664cqw] lg:flex">
      <ShadeBall
        positionAsClassName="bottom-[-150px] right-[-150px]"
        blur={120}
      />
      <div className="relative z-10 flex flex-col gap-[1cqw]">
        <Logo fluid />

        <div className="flex max-w-[26cqw] flex-col gap-[1.064cqw]">
          <h1 className="text-ehs-darker text-[2.4cqw] leading-tight font-bold">
            Safety management, finally unified.
          </h1>
          <p className="text-ehs-muted-text text-[0.936cqw] leading-relaxed">
            Join 2,400+ sites using Neptune to manage incidents, audits, CAPAs,
            and sustainability — all in one place.
          </p>
        </div>

        <ul className="flex max-w-[28cqw] flex-col gap-[1.336cqw]">
          {features.map((item) => (
            <li key={item.title} className="flex flex-col gap-[0.264cqw]">
              <p className="text-ehs-darker text-[0.936cqw] font-semibold">
                {item.title}
              </p>
              <p className="text-ehs-muted-text text-[0.936cqw]">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-ehs-normal-blue/15 relative backdrop-blur-lg z-10 mt-[1cqw] rounded-xl px-[1.336cqw] py-[1.064cqw]">
        <p className="text-ehs-darker text-[0.936cqw] font-semibold">
          30-day free trial, full access
        </p>
        <p className="text-ehs-muted-text mt-[0.264cqw] text-[0.936cqw]">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

function RightPanel() {
  return (
    <div
      className="flex h-full items-center justify-center p-[2.136cqw]"
      style={{ background: "var(--ehs-light-bg)" }}
    >
      <ShadeBall positionAsClassName="top-[-150px] right-[-150px]" blur={80} />
      <ShadeBall
        positionAsClassName="bottom-[-150px] left-[-150px]"
        blur={120}
      />

      <div className="flex w-full max-w-[25.6cqw] flex-col gap-[1.6cqw]">
        <div className="flex flex-col gap-[0.264cqw]">
          <h2 className="text-ehs-darker text-[2cqw] font-bold">
            Create your account.
          </h2>
          <p className="text-ehs-muted-text text-[0.936cqw]">
            Start your Neptune workspace in minutes.
          </p>
        </div>

        <Button
          type="button"
          variant="tertiary"
          scale="auth"
          className="w-full font-medium"
        >
          <Icon icon="flat-color-icons:google" className="text-[1.2cqw]" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-[0.8cqw]">
          <hr className="border-ehs-border flex-1" />
          <span className="text-ehs-muted-text text-[0.8cqw]">
            or sign up with email
          </span>
          <hr className="border-ehs-border flex-1" />
        </div>

        <form className="flex flex-col gap-[1.064cqw]">
          <TextInput
            id="name"
            name="name"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Sarah Nordvik"
            scale="auth"
            required
          />

          <EmailInput
            id="email"
            name="email"
            label="Email address"
            placeholder="sarah@nordvik.com"
            scale="auth"
            required
          />

          <Password
            id="password"
            name="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            scale="auth"
            required
          />

          <Password
            id="confirm-password"
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            scale="auth"
            required
          />

          <Button
            type="submit"
            variant="primary"
            scale="auth"
            className="w-full"
          >
            Create account
            <Icon icon="mdi:arrow-right" className="text-[1.2cqw]" />
          </Button>
        </form>

        <p className="text-ehs-muted-text text-center text-[0.936cqw]">
          Already have an account?{" "}
          <ScrollLink
            href="/login"
            className={`${authLinkClass} font-semibold`}
          >
            Sign in
          </ScrollLink>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="relative grid h-full w-full lg:grid-cols-2">
      <div className="relative hidden h-full overflow-hidden lg:block">
        <LeftPanel />
      </div>
      <div className="relative h-full overflow-hidden">
        <RightPanel />
      </div>
    </div>
  );
}
