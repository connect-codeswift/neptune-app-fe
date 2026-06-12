import { Icon } from "@iconify/react";

export type CheckProps = Readonly<{
  checked: boolean;
  className?: string;
}>;

export function Check(props: Readonly<CheckProps>) {
  const { checked, className } = props;

  return (
    <span
      aria-hidden="true"
      className={[
        "pointer-events-none flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors",
        checked
          ? "border-ehs-normal-blue bg-ehs-normal-blue text-ehs-light-text"
          : "border-ehs-border bg-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {checked ? <Icon icon="mdi:check" className="text-lg" /> : null}
    </span>
  );
}
