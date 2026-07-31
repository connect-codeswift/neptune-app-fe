"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { LibraryCategory } from "@/components/policy-maker/policy-maker-types";

export type PolicyMakerLibraryNavProps = Readonly<{
  categories: readonly LibraryCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNewDocument?: () => void;
  className?: string;
}>;

export function PolicyMakerLibraryNav(
  props: Readonly<PolicyMakerLibraryNavProps>,
) {
  const {
    categories,
    selectedId,
    onSelect,
    onNewDocument,
    className = "",
  } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[13.62px]"
      incidentGlassCardClassName="gap-0"
      className={["min-w-0 self-start", className].filter(Boolean).join(" ")}
    >
      <div className="px-[7.78px] pt-[4.87px] pb-[10.7px]">
        <Text
          as="p"
          className="text-[10px] font-bold tracking-[1.02px] text-[#8892a3] uppercase"
        >
          Library
        </Text>
      </div>

      <div className="flex flex-col gap-0">
        {categories.map((category) => {
          const isActive = category.id === selectedId;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={[
                "flex w-full cursor-pointer items-center gap-[9.73px] rounded-[9.73px] px-[9.73px] py-[8.76px] text-left transition-colors",
                isActive
                  ? "bg-[rgba(8,145,166,0.18)]"
                  : "hover:bg-[rgba(15,23,42,0.04)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Icon
                icon={category.icon}
                className={[
                  "size-[14.6px] shrink-0",
                  isActive ? "text-[#056e7e]" : "text-[#2a3446]",
                ].join(" ")}
                aria-hidden="true"
              />
              <Text
                as="span"
                className={[
                  "min-w-0 flex-1 text-[12px]",
                  isActive
                    ? "font-bold text-[#056e7e]"
                    : "font-normal text-[#2a3446]",
                ].join(" ")}
              >
                {category.label}
              </Text>
              <Text
                as="span"
                className={[
                  "shrink-0 text-[10px]",
                  isActive ? "font-bold text-[#8892a3]" : "text-[#8892a3]",
                ].join(" ")}
              >
                {String(category.count)}
              </Text>
            </button>
          );
        })}
      </div>

      <div className="mt-1 border-t border-[rgba(15,23,42,0.08)] pt-[10.7px]">
        <button
          type="button"
          onClick={onNewDocument}
          className="flex w-full cursor-pointer items-center justify-center gap-[7.78px] rounded-[9.73px] border-[0.97px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] px-[14.6px] py-[9.73px] backdrop-blur-[5.84px] transition-colors hover:bg-white"
        >
          <Icon
            icon="mdi:plus"
            className="size-[12.65px] text-[#0b1320]"
            aria-hidden="true"
          />
          <Text
            as="span"
            className="text-[12px] font-bold text-[#0b1320]"
          >
            New document
          </Text>
        </button>
      </div>
    </IncidentGlassCard>
  );
}
