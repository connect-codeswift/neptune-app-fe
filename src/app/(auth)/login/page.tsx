"use client";

import { Icon } from "@iconify/react";
import { LoginLeftPanel } from "@/components/auth/LoginLeftPanel";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";

function RightPanel() {
  return (
    <div
      className="flex h-full items-center justify-center p-8"
      style={{ background: "var(--ehs-light-bg)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-ehs-darker text-3xl font-bold">Welcome back.</h2>
          <p className="text-ehs-muted-text text-sm">
            Sign in to your Neptune workspace.
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
            or sign in with email
          </span>
          <hr className="border-ehs-border flex-1" />
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
              href="/forget-password"
              className="ml-auto block text-sm font-medium"
            >
              Forgot password?
            </ScrollLink>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Sign in
            <Icon icon="mdi:arrow-right" />
          </Button>
        </form>

        <p className="text-ehs-muted-text text-center text-sm">
          Don&apos;t have an account?{" "}
          <ScrollLink href="/signup" className="font-semibold">
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
      <div className="relative h-screen overflow-hidden">
        <LoginLeftPanel />
      </div>
      <div className="relative min-h-screen overflow-y-auto">
        <RightPanel />
      </div>
    </div>
  );
}
