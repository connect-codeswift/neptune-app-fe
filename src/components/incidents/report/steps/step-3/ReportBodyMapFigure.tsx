"use client";

import { Text } from "@/components/Text";
import type {
  BodyPartId,
  BodyPartSideMap,
  BodySide,
} from "@/components/incidents/report/shared/report-incident-data";
import {
  ReportBodyMapSvg,
  type ReportBodyMapView,
} from "@/components/incidents/report/steps/step-3/ReportBodyMapSvg";

export type { ReportBodyMapView };

export type ReportBodyMapFigureProps = Readonly<{
  view: ReportBodyMapView;
  selectedParts: readonly BodyPartId[];
  bodyPartSides: BodyPartSideMap;
  bodySide: BodySide;
  onSelectPart: (part: BodyPartId, side?: BodySide) => void;
  className?: string;
}>;

/**
 * Front / Back figure card.
 *
 * Sizes to its own content rather than stretching to the grid row. It used to
 * be `self-stretch`, so the tall body-part chip list next to it dragged these
 * cards to full row height and left the figure floating in a column of dead
 * space. The SVG is capped so the figure stays a readable size instead of
 * ballooning with the column.
 */
export function ReportBodyMapFigure(props: Readonly<ReportBodyMapFigureProps>) {
  const {
    view,
    selectedParts,
    bodyPartSides,
    bodySide,
    onSelectPart,
    className = "",
  } = props;
  const label = view === "front" ? "Front" : "Back";

  return (
    <div
      className={[
        "mx-auto flex w-full max-w-[260px] flex-col items-center gap-1 self-start rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/82 px-1.5 pt-2 pb-3 sm:gap-1.5 sm:px-3 sm:pt-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="p"
        className="text-ehs-muted-text shrink-0 py-px text-sm font-bold tracking-[1.2px] uppercase"
      >
        {label}
      </Text>

      <div className="relative flex w-full items-center justify-center overflow-hidden">
        <ReportBodyMapSvg
          view={view}
          selectedParts={selectedParts}
          bodyPartSides={bodyPartSides}
          bodySide={bodySide}
          onSelectPart={onSelectPart}
        />
      </div>
    </div>
  );
}
