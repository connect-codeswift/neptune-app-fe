"use client";

import { Icon } from "@iconify/react";
import { LoginLeftPanel } from "@/components/auth/LoginLeftPanel";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { authLinkClass } from "@/lib/auth-cqw-classes";
import { ShadeBall } from "@/components/ShadeBall";

export default function ForgetPasswordPage() {
  return (
    <div className="grid h-full w-full lg:grid-cols-2">
      <div className="relative hidden h-full overflow-hidden lg:block">
        <LoginLeftPanel />
      </div>
      <div className="relative h-full overflow-hidden">
        <ShadeBall
          positionAsClassName="top-[-150px] right-[-150px]"
          blur={80}
        />
        <ShadeBall
          positionAsClassName="bottom-[-150px] left-[-150px]"
          blur={80}
        />

        <div
          className="flex h-full items-center justify-center p-[2.136cqw]"
          style={{ background: "var(--ehs-light-bg)" }}
        >
          <div className="flex w-full max-w-[25.6cqw] flex-col gap-[1.6cqw]">
            <div className="flex flex-col gap-[0.264cqw]">
              <h2 className="text-ehs-darker text-[2cqw] font-bold">
                Forgot password?
              </h2>
              <p className="text-ehs-muted-text mt-[0.536cqw] text-[0.936cqw]">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>
            </div>

            <form className="flex flex-col gap-[1.064cqw]">
              <EmailInput
                id="email"
                name="email"
                label="Email address"
                placeholder="sarah@nordvik.com"
                scale="auth"
                required
              />

              <Button
                type="submit"
                variant="primary"
                scale="auth"
                className="w-full"
              >
                Send reset link
                <Icon
                  icon="mdi:arrow-right"
                  className="text-[1.2cqw]"
                  aria-hidden="true"
                />
              </Button>
            </form>

            <p className="text-ehs-muted-text text-center text-[0.936cqw]">
              Remember your password?{" "}
              <ScrollLink
                href="/login"
                className={`${authLinkClass} font-semibold`}
              >
                Sign in
              </ScrollLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
