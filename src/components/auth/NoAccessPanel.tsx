import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type NoAccessReason = "module" | "permission";

export type NoAccessPanelProps = Readonly<{
  /**
   * Which of the two gates refused.
   *
   * They are told apart deliberately. "Your company has not enabled this" is a different
   * problem from "your role does not include this", they are fixed by different people —
   * CodeSwift versus the company's own administrator — and collapsing them into one
   * "access denied" sends users to the wrong one.
   */
  reason: NoAccessReason;
  title: string;
  description: string;
}>;

const ICONS: Readonly<Record<NoAccessReason, string>> = {
  module: "mdi:package-variant-closed",
  permission: "mdi:lock-outline",
};

/**
 * Shown in place of a page the caller may not reach.
 *
 * Its job is to replace a broken screen with an explained one. Before route guards existed,
 * typing the URL of a module you did not have rendered the page in full: empty charts,
 * forms that 403 on submit, and nothing saying why. No data leaked — every API call was
 * refused — but the user was left to work it out.
 */
export function NoAccessPanel(props: Readonly<NoAccessPanelProps>) {
  const { reason, title, description } = props;

  return (
    <section
      className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center"
      role="status"
    >
      <span className="bg-ehs-surface-raised text-ehs-muted-text flex size-12 items-center justify-center rounded-2xl">
        <Icon icon={ICONS[reason]} className="size-6" aria-hidden="true" />
      </span>

      <Text as="h1" className="text3 text-ehs-darker">
        {title}
      </Text>

      <Text as="p" className="text4 text-ehs-muted-text max-w-sm">
        {description}
      </Text>
    </section>
  );
}
