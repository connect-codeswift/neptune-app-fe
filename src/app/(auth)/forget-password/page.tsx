"use client";

import { Icon } from "@iconify/react";
import { LoginLeftPanel } from "@/components/auth/LoginLeftPanel";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";

export default function ForgetPasswordPage() {
  return (
    <div className="grid h-screen lg:grid-cols-2">
      <div className="relative h-screen overflow-hidden">
        <LoginLeftPanel />
      </div>
      <div className="relative min-h-screen overflow-y-auto">
        <div
          className="flex h-full items-center justify-center p-8"
          style={{ background: "var(--ehs-light-bg)" }}
        >
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-ehs-darker text-3xl font-bold">
                Forgot password?
              </h2>
              <p className="text-ehs-muted-text text-sm">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>
            </div>

            <form className="space-y-4">
              <EmailInput
                id="email"
                name="email"
                label="Email address"
                placeholder="sarah@nordvik.com"
                required
              />

              <Button type="submit" variant="primary" className="w-full">
                Send reset link
                <Icon icon="mdi:arrow-right" aria-hidden="true" />
              </Button>
            </form>

            <p className="text-ehs-muted-text text-center text-sm">
              Remember your password?{" "}
              <ScrollLink href="/login" className="font-semibold">
                Sign in
              </ScrollLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
