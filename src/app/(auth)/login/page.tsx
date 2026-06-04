"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";

const incidents = [
  {
    title: "Chemical spill — Storage B",
    location: "Birmingham Plant",
    time: "12 min ago",
    color: "bg-red-500",
  },
  {
    title: "Machine stoppage — Line 4",
    location: "Leeds Plant",
    time: "1 hr ago",
    color: "bg-yellow-500",
  },
  {
    title: "Near miss — Loading bay",
    location: "Manchester Depot",
    time: "3 hrs ago",
    color: "bg-yellow-500",
  },
];

const capas = [
  {
    title: "Install secondary containment",
    assignee: "J. Harris",
    due: "Jun 4",
  },
  { title: "Retrain Line 4 operators", assignee: "M. Price", due: "Jun 7" },
];

function LeftPanel() {
  return (
    <div className="bg-ehs-dark-bg relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
      {/* Subtle radial glow */}
      <div className="bg-ehs-normal-blue pointer-events-none absolute -top-32 -left-32 h-125 w-125 rounded-full opacity-20 blur-3xl" />

      {/* Logo */}
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

      {/* Hero text */}
      <div className="relative z-10 mt-6 space-y-3">
        <p className="text-ehs-muted-text text-xs font-semibold tracking-widest uppercase">
          Your workspace is waiting
        </p>
        <h1 className="text-ehs-light-text text-4xl leading-tight font-bold">
          Items requiring
          <br />
          your attention.
        </h1>
      </div>

      {/* Cards */}
      <div className="relative z-10 space-y-4 pb-2">
        {/* Open incidents */}
        <div className="border-px space-y-3 rounded-xl border-[#ffffff14] bg-[#ffffff50] p-4">
          <p className="text-ehs-muted-text text-xs font-semibold">
            Open incidents
          </p>
          <ul className="space-y-3">
            {incidents.map((inc) => (
              <li key={inc.title} className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${inc.color}`}
                />
                <div>
                  <p className="text-ehs-light-text text-sm leading-tight font-medium">
                    {inc.title}
                  </p>
                  <p className="text-ehs-muted-text text-xs">
                    {inc.location} · {inc.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pending CAPAs */}
        <div className="border-px space-y-3 rounded-xl border-[#ffffff14] bg-[#ffffff50] p-4">
          <p className="text-ehs-muted-text text-xs font-semibold">
            Pending CAPAs
          </p>
          <ul className="space-y-2">
            {capas.map((c) => (
              <li key={c.title} className="flex items-center gap-3">
                <div className="bg-ehs-icon-bg flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
                  <Icon
                    icon="mdi:clipboard-check-outline"
                    className="text-ehs-normal-blue text-xs"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-ehs-light-text truncate text-sm">
                    {c.title}
                  </p>
                  <p className="text-ehs-muted-text text-xs">{c.assignee}</p>
                </div>
                <span
                  className="shrink-0 text-xs"
                  style={{ color: "var(--ehs-muted-text)" }}
                >
                  {c.due}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming inspection */}
        <div className="border-px flex items-center gap-3 rounded-xl border-[#ffffff14] bg-[#ffffff50] p-4">
          <div className="bg-ehs-icon-bg flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Icon icon="mdi:calendar-check" className="text-ehs-normal-blue" />
          </div>
          <div>
            <p className="text-ehs-light-text text-sm font-medium">
              OSHA inspection — Leeds Plant
            </p>
            <p className="text-ehs-muted-text text-xs">
              Scheduled for Thu 5 Jun · Preparation 70% complete
            </p>
          </div>
        </div>
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
          <h2 className="text-3xl font-bold text-gray-900">Welcome back.</h2>
          <p className="text-ehs-muted-text text-sm">
            Sign in to your Neptune workspace.
          </p>
        </div>

        {/* Google SSO */}
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
            or sign in with email
          </span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <form className="space-y-4">
          <EmailInput
            id="email"
            name="email"
            label="Email address"
            placeholder="sarah@nordvik.com"
            required
          />

          <div className="w-full space-y-1.5">
            <Password
              id="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              required
            />
            <ScrollLink
              href="/forgot-password"
              className="text-ehs-normal-blue flex w-full justify-between text-sm font-medium"
            >
              <div></div>
              <div>Forgot password?</div>
            </ScrollLink>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Sign in
            <Icon icon="mdi:arrow-right" />
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <ScrollLink
            href="/signup"
            className="text-ehs-normal-blue font-semibold"
          >
            Sign up
          </ScrollLink>
        </p>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return (
    <div className="grid h-screen lg:grid-cols-2">
      {/* ── Left panel ── */}
      <LeftPanel />

      {/* ── Right panel ── */}
      <RightPanel />
    </div>
  );
}
