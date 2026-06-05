export type ToggleProps = Readonly<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label": string;
}>;

export function Toggle(props: Readonly<ToggleProps>) {
  const { id, checked, onChange, "aria-label": ariaLabel } = props;

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-[1.6cqw] w-[2.936cqw] shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed",
        checked ? "bg-ehs-normal-blue" : "bg-ehs-border",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute top-[0.136cqw] left-[0.136cqw] inline-block h-[1.336cqw] w-[1.336cqw] rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[1.336cqw]" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
