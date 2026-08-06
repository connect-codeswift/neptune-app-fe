"use client";

export type ToggleSwitchProps = Readonly<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}>;

export function ToggleSwitch(props: Readonly<ToggleSwitchProps>) {
  const { checked, onChange, label, className = "" } = props;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
        checked ? "bg-ehs-normal-blue" : "bg-ehs-border",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none inline-block size-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}
