"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { TextInput } from "@/components/inputs/TextInput";

const benefits = [
  {
    icon: "mdi:clipboard-check-outline",
    title: "Incident tracking",
    description: "Log and triage events across every site in one place.",
  },
  {
    icon: "mdi:shield-check",
    title: "CAPA workflows",
    description: "Assign corrective actions and track completion.",
  },
  {
    icon: "mdi:calendar-check",
    title: "Inspection readiness",
    description: "Stay ahead of audits with scheduled checklists.",
  },
];

export default function SignupPage() {
  return (
    <div className="grid h-screen lg:grid-cols-2">
      {/* ── Left panel ── */}
      <div className="bg-ehs-dark-bg relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="bg-ehs-normal-blue pointer-events-none absolute -top-32 -right-32 h-125 w-125 rounded-full opacity-20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-ehs-normal-blue flex h-8 w-8 items-center justify-center rounded-lg">
            <Icon
              icon="mdi:shield-check"
              className="text-ehs-light-text text-lg"
            />
          </div>
          <span className="text-ehs-light-text text-base font-semibold tracking-tight">
            Neptune
          </span>
        </div>

        <div className="relative z-10 mt-6 space-y-3">
          <p className="text-ehs-muted-text text-xs font-semibold tracking-widest uppercase">
            Built for EHS teams
          </p>
          <h1 className="text-ehs-light-text text-4xl leading-tight font-bold">
            One workspace for
            <br />
            safety and compliance.
          </h1>
        </div>

        <ul className="relative z-10 space-y-4 pb-2">
          {benefits.map((item) => (
            <li
              key={item.title}
              className="border-px flex items-start gap-3 rounded-xl border-[#ffffff14] bg-[#ffffff50] p-4"
            >
              <div className="bg-ehs-icon-bg flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Icon icon={item.icon} className="text-ehs-normal-blue" />
              </div>
              <div>
                <p className="text-ehs-light-text text-sm font-medium">
                  {item.title}
                </p>
                <p className="text-ehs-muted-text mt-0.5 text-xs">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right panel ── */}
      <div
        className="flex items-center justify-center p-8"
        style={{ background: "var(--ehs-light-bg)" }}
      >
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-gray-900">
              Create your account.
            </h2>
            <p className="text-ehs-muted-text text-sm">
              Start your Neptune workspace in minutes.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-3 font-medium"
          >
            <Icon icon="flat-color-icons:google" className="text-lg" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-gray-200" />
            <span className="text-ehs-muted-text text-xs">
              or sign up with email
            </span>
            <hr className="flex-1 border-gray-200" />
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

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <ScrollLink
              href="/login"
              className="text-ehs-normal-blue font-semibold"
            >
              Sign in
            </ScrollLink>
          </p>
        </div>
      </div>
    </div>
  );
}
