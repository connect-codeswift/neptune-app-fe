"use client";

export type TabItem = Readonly<{
  value: string;
  label: string;
  /** Small count badge shown after the label, e.g. item/finding counts. */
  count?: number;
}>;

export type TabsProps = Readonly<{
  tabs: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  "aria-label": string;
}>;

/** Underlined tab bar used to switch between sibling views of one record. */
export function Tabs(props: TabsProps) {
  const { tabs, value, onChange, "aria-label": ariaLabel } = props;

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="border-ehs-border-ink/10 flex items-center gap-1 border-b"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={[
              "text4 -mb-px inline-flex cursor-pointer items-center gap-1.5 border-b-2 px-3.5 py-2.5 transition-colors",
              isActive
                ? "border-ehs-normal-blue text-ehs-normal-blue"
                : "text-ehs-muted-text hover:text-ehs-gray border-transparent",
            ].join(" ")}
          >
            {tab.label}
            {tab.count != null ? (
              <span
                className={[
                  "text8 rounded-full px-1.5 py-0.5 tabular-nums",
                  isActive
                    ? "bg-ehs-normal-blue/12 text-ehs-normal-blue"
                    : "bg-ehs-light-bg/60 text-ehs-muted-text",
                ].join(" ")}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
