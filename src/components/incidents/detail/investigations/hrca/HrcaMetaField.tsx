"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type HrcaMetaFieldProps = Readonly<{
  icon: string;
  label: string;
  value: string;
  /** Stack label on two lines (e.g. Type of / report) */
  labelLines?: readonly [string, string];
  showChevron?: boolean;
  valueClassName?: string;
  className?: string;
}>;

export function HrcaMetaField(props: Readonly<HrcaMetaFieldProps>) {
  const {
    icon,
    label,
    value,
    labelLines,
    showChevron = false,
    valueClassName = "text4 leading-[17.5px] font-bold",
    className = "",
  } = props;

  return (
    <div
      className={[
        "flex min-h-[65px] items-center gap-[11px] py-3 pl-5 pr-[21px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-white/62">
        <Icon icon={icon} className="text-ehs-gray size-[15px]" aria-hidden="true" />
      </div>
      <div className="relative min-w-0 flex-1">
        {labelLines ? (
          <p className="text-ehs-muted-text text8 leading-none font-bold tracking-[0.945px] uppercase">
            {labelLines[0]}
            <br />
            {labelLines[1]}
          </p>
        ) : (
          <Text
            as="p"
            className="text-ehs-muted-text text8 leading-none font-bold tracking-[0.945px] uppercase"
          >
            {label}
          </Text>
        )}
        <div className="relative mt-[2px] flex min-h-[18px] items-center pr-[18px]">
          <Text
            as="p"
            className={["text-ehs-dark-bg truncate", valueClassName].join(" ")}
          >
            {value}
          </Text>
          {showChevron ? (
            <Icon
              icon="mdi:chevron-down"
              className="text-ehs-muted-text absolute top-1/2 right-0 size-[13px] -translate-y-1/2"
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
