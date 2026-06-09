import { Icon } from "@iconify/react";

export type LogoIconProps = Readonly<{
  className?: string;
}>;

export function LogoIcon({ className = "" }: LogoIconProps) {
  return (
    <div
      className={[
        "bg-ehs-normal-blue flex h-9 w-9 items-center justify-center rounded-lg",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon="mdi:waves"
        className="text-ehs-light-text text-lg"
        aria-hidden="true"
      />
    </div>
  );
}
