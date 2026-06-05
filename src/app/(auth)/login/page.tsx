"use client";

import { Icon } from "@iconify/react";
import { LoginLeftPanel } from "@/components/auth/LoginLeftPanel";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { authLinkClass } from "@/lib/auth-cqw-classes";
import { ShadeBall } from "@/components/ShadeBall";

function RightPanel() {
  return (
    <div
      className="relative flex h-full items-center justify-center p-[2.136cqw]"
      style={{ background: "var(--ehs-light-bg)" }}
    >
      <ShadeBall positionAsClassName="top-[-150px] right-[-150px]" blur={80} />
      <ShadeBall
        positionAsClassName="bottom-[-150px] left-[-150px]"
        blur={80}
      />

      <div className="relative flex w-full max-w-[25.6cqw] flex-col gap-[1.6cqw]">
        <div className="flex flex-col gap-[0.264cqw]">
          <h2 className="text-ehs-darker text-[2cqw] font-bold">
            Welcome back.
          </h2>
          <p className="text-ehs-muted-text text-[0.936cqw]">
            Sign in to your Neptune workspace.
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
            or sign in with email
          </span>
          <hr className="border-ehs-border flex-1" />
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

          <div className="flex w-full flex-col gap-[0.4cqw]">
            <Password
              id="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              scale="auth"
              required
            />
            <ScrollLink
              href="/forget-password"
              className={`${authLinkClass} ml-auto block font-medium`}
            >
              Forgot password?
            </ScrollLink>
          </div>

          <Button
            type="submit"
            variant="primary"
            scale="auth"
            className="w-full"
          >
            Sign in
            <Icon icon="mdi:arrow-right" className="text-[1.2cqw]" />
          </Button>
        </form>

        <p className="text-ehs-muted-text text-center text-[0.936cqw]">
          Don&apos;t have an account?{" "}
          <ScrollLink
            href="/signup"
            className={`${authLinkClass} font-semibold`}
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
    <div className="grid h-screen w-full lg:grid-cols-2">
      <div className="relative hidden h-full overflow-hidden lg:block">
        <LoginLeftPanel />
      </div>
      <div className="relative h-screen overflow-hidden">
        <RightPanel />
      </div>
    </div>
  );
}
