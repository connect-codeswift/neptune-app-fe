import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type LogoIconProps = Readonly<{
  className?: string;
  variant?: "dark" | "light";
}>;

export function Logo(props: Readonly<LogoIconProps>) {
  const { className = "", variant = "dark" } = props;
  const textClassName =
    variant === "light" ? "text-ehs-light-text" : "text-ehs-darker";

  return (
    <div className={["flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <div className="bg-ehs-normal-blue flex h-8 w-8 items-center justify-center rounded-lg">
        <Icon
          icon="mdi:waves"
          className="text-ehs-light-text text-lg"
          aria-hidden="true"
        />
      </div>
      <Text
        as="span"
        className={["text-base font-semibold tracking-tight", textClassName].join(
          " ",
        )}
      >
        Neptune
      </Text>
    </div>
  );
}
