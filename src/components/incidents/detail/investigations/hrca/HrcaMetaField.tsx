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
        "flex min-h-16.25 items-center gap-2.75 py-3 pr-5.25 pl-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="rounded-2 flex size-7.5 shrink-0 items-center justify-center bg-white/62">
        <Icon
          icon={icon}
          className="text-ehs-gray size-3.75"
          aria-hidden="true"
        />
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
        <div className="relative mt-0.5 flex min-h-4.5 items-center pr-4.5">
          <Text
            as="p"
            className={["text-ehs-dark-bg truncate", valueClassName].join(" ")}
          >
            {value}
          </Text>
          {showChevron ? (
            <Icon
              icon="mdi:chevron-down"
              className="text-ehs-muted-text absolute top-1/2 right-0 size-3.25 -translate-y-1/2"
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
