"use client";

export type SwitchProps = Readonly<{
  checked: boolean;
  label: string;
  onChange: () => void;
}>;

/** Pill toggle used across the template wizard's settings. */
export function Switch(props: SwitchProps) {
  const { checked, label, onChange } = props;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        checked ? "bg-ehs-normal-blue" : "bg-ehs-surface-inverse/20",
      ].join(" ")}
    >
      <span
        className={[
          "bg-ehs-surface inline-block size-5 rounded-full shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
        aria-hidden="true"
      />
    </button>
  );
}
