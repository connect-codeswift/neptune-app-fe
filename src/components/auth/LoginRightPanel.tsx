"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { type SubmitEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ScrollLink";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Password } from "@/components/inputs/Password";
import { ehsLinkClass } from "@/lib/ehs-classes";
import { ShadeBall } from "@/components/ShadeBall";

export default function LoginRightPanel() {
  const router = useRouter();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    router.push("/onboarding");
  };

  return (
    <div className="bg-ehs-light-bg relative flex h-full items-center justify-center p-8">
      <ShadeBall positionAsClassName="top-[-150px] right-[-150px]" blur={80} />
      <ShadeBall
        positionAsClassName="bottom-[-150px] left-[-150px]"
        blur={80}
      />

      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-ehs-darker text-2xl font-bold lg:text-4xl">
            Welcome back.
          </h2>
          <p className="text-ehs-muted-text text-xs lg:text-sm">
            Sign in to your Neptune workspace.
          </p>
        </div>

        <Button type="button" variant="tertiary" className="w-full font-medium">
          <Icon icon="flat-color-icons:google" className="text-lg" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-2">
          <hr className="border-ehs-border flex-1" />
          <span className="text-ehs-muted-text text-xs">
            or sign in with email
          </span>
          <hr className="border-ehs-border flex-1" />
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <EmailInput
            id="email"
            name="email"
            label="Email address"
            placeholder="sarah@nordvik.com"
            required
          />

          <div className="flex w-full flex-col gap-1">
            <Password
              id="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              required
            />
            <ScrollLink
              href="/forget-password"
              className={`${ehsLinkClass} ml-auto block font-medium`}
            >
              Forgot password?
            </ScrollLink>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Sign in
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Button>
        </form>

        <p className="text-ehs-muted-text text-center text-sm">
          Don&apos;t have an account?{" "}
          <ScrollLink
            href="/signup"
            className={`${ehsLinkClass} font-semibold`}
          >
            Sign up
          </ScrollLink>
        </p>
      </div>
    </div>
  );
}
