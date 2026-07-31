"use client";

import { Text } from "@/components/Text";
import {
  HazcomGlassCard,
  type HazcomSdsSection,
} from "@/components/hazcom/shared";

export type SdsViewerSectionNavProps = Readonly<{
  sections: readonly HazcomSdsSection[];
  activeSection: number;
  onSelectSection: (section: number) => void;
  className?: string;
}>;

export function SdsViewerSectionNav(
  props: Readonly<SdsViewerSectionNavProps>,
) {
  const { sections, activeSection, onSelectSection, className = "" } = props;

  return (
    <HazcomGlassCard paddingClassName="p-3" className={className}>
      <Text
        as="p"
        className="text-ehs-muted-text px-2 pt-1 pb-2 text-[11px] font-bold tracking-[0.8px] uppercase"
      >
        16 GHS Sections
      </Text>

      <nav aria-label="SDS sections" className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const isActive = section.number === activeSection;

          return (
            <button
              key={section.number}
              type="button"
              onClick={() => onSelectSection(section.number)}
              aria-current={isActive ? "true" : undefined}
              className={[
                "rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                isActive
                  ? "bg-ehs-normal-blue-bg-light text-ehs-dark-blue font-bold"
                  : "text-ehs-gray hover:bg-ehs-light-bg",
              ].join(" ")}
            >
              {`${section.number} – ${section.title}`}
            </button>
          );
        })}
      </nav>
    </HazcomGlassCard>
  );
}
