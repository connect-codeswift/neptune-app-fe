"use client";

export type ToggleSwitchProps = Readonly<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
  /**
   * Blocks the switch while its state is unknown or a request is in flight. Needed by the 2FA
   * toggle, where "off" and "not loaded yet" look identical and pressing during the gap would
   * offer enrolment to someone who already has it.
   */
  disabled?: boolean;
}>;

export function ToggleSwitch(props: Readonly<ToggleSwitchProps>) {
  const { checked, onChange, label, className = "", disabled = false } = props;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
        checked ? "bg-ehs-normal-blue" : "bg-ehs-border",
        disabled ? "cursor-not-allowed opacity-50" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "bg-ehs-surface pointer-events-none inline-block size-5 translate-y-0.5 rounded-full shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}
