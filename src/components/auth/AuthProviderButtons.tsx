import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";

export type AuthProviderButtonsProps = Readonly<{
  /** Divider caption below the buttons. */
  dividerLabel?: string;
}>;

/**
 * Google and Microsoft, side by side, above an "or continue with email"
 * divider.
 *
 * NOTE: neither provider button is wired — no onClick and no OAuth flow exists
 * in the codebase. They are kept enabled at the owner's direction as the
 * intended design; wire or disable before release.
 *
 * Sign-up previously offered Google alone, full width, and its button pushed
 * straight to /onboarding — entering the flow as though Google had
 * authenticated the user when nothing had. That is removed here: an unwired
 * button that does nothing is honest, one that fakes a successful sign-in is
 * not. Sign-in's pair of buttons was already inert, so both screens now behave
 * the same as well as looking the same.
 */
export function AuthProviderButtons(props: Readonly<AuthProviderButtonsProps>) {
  const { dividerLabel = "or continue with email" } = props;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="tertiary" className="w-full font-medium">
          <Icon icon="flat-color-icons:google" className="text-lg" />
          Google
        </Button>
        <Button type="button" variant="tertiary" className="w-full font-medium">
          <Icon icon="logos:microsoft-icon" className="text-base" />
          Microsoft
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <hr className="border-ehs-border flex-1" />
        <span className="text-ehs-muted-text text-xs">{dividerLabel}</span>
        <hr className="border-ehs-border flex-1" />
      </div>
    </>
  );
}
