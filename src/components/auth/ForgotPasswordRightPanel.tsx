import { ShadeBall } from "@/components/ShadeBall";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Button } from "@/components/ui/Button";
import { Icon } from "@iconify/react";
import { ScrollLink } from "@/components/ScrollLink";
import { ehsLinkClass } from "@/lib/ehs-classes";

export default function ForgotPasswordRightPanel() {
  return (
    <div className="relative h-full overflow-hidden">
      <ShadeBall positionAsClassName="top-[-150px] right-[-150px]" blur={80} />
      <ShadeBall
        positionAsClassName="bottom-[-150px] left-[-150px]"
        blur={80}
      />

      <div
        className="flex h-full items-center justify-center p-8"
        style={{ background: "var(--ehs-light-bg)" }}
      >
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-ehs-darker text-2xl font-bold">
              Forgot password?
            </h2>
            <p className="text-ehs-muted-text mt-1.5 text-sm">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>

          <form className="flex flex-col gap-3">
            <EmailInput
              id="email"
              name="email"
              label="Email address"
              placeholder="sarah@nordvik.com"
              required
            />

            <Button type="submit" variant="primary" className="w-full">
              Send reset link
              <Icon
                icon="mdi:arrow-right"
                className="text-lg"
                aria-hidden="true"
              />
            </Button>
          </form>

          <p className="text-ehs-muted-text text-center text-sm">
            Remember your password?{" "}
            <ScrollLink
              href="/login"
              className={`${ehsLinkClass} font-semibold`}
            >
              Sign in
            </ScrollLink>
          </p>
        </div>
      </div>
    </div>
  );
}
