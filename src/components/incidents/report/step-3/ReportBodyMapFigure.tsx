"use client";

import { Text } from "@/components/Text";
import type {
  BodyPartId,
  BodySide,
} from "@/components/incidents/report/shared/report-incident-data";
import {
  ReportBodyMapSvg,
  type ReportBodyMapView,
} from "@/components/incidents/report/step-3/ReportBodyMapSvg";

export type { ReportBodyMapView };

export type ReportBodyMapFigureProps = Readonly<{
  view: ReportBodyMapView;
  selectedParts: readonly BodyPartId[];
  bodySide: BodySide;
  onSelectPart: (part: BodyPartId, side?: BodySide) => void;
  className?: string;
}>;

/**
 * Front / Back figure card — fills parent height; SVG scales to fit.
 */
export function ReportBodyMapFigure(
  props: Readonly<ReportBodyMapFigureProps>,
) {
  const {
    view,
    selectedParts,
    bodySide,
    onSelectPart,
    className = "",
  } = props;
  const label = view === "front" ? "Front" : "Back";

  return (
    <div
      className={[
        "flex h-full min-h-0 w-full flex-col items-center gap-1.5 self-stretch rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/82 px-3 pt-2.5 pb-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="p"
        className="text-ehs-muted-text shrink-0 py-px text-[11px] font-bold tracking-[1.2px] uppercase"
      >
        {label}
      </Text>

      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
        <ReportBodyMapSvg
          view={view}
          selectedParts={selectedParts}
          bodySide={bodySide}
          onSelectPart={onSelectPart}
        />
      </div>
    </div>
  );
}
