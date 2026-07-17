"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  BODY_PART_OPTIONS,
  formatBodyPartSelection,
  type BodyPartId,
  type BodySide,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportBodyMapFigure } from "@/components/incidents/report/step-3/ReportBodyMapFigure";

export type ReportBodyPartFieldProps = Readonly<{
  bodyParts: readonly BodyPartId[];
  bodySide: BodySide;
  multiSelect: boolean;
  onBodyPartsChange: (parts: readonly BodyPartId[]) => void;
  onBodySideChange: (side: BodySide) => void;
  onMultiSelectChange: (enabled: boolean) => void;
  className?: string;
}>;

export function ReportBodyPartField(
  props: Readonly<ReportBodyPartFieldProps>,
) {
  const {
    bodyParts,
    bodySide,
    multiSelect,
    onBodyPartsChange,
    onBodySideChange,
    onMultiSelectChange,
    className = "",
  } = props;

  const selectPart = (part: BodyPartId, side?: BodySide) => {
    if (side) {
      onBodySideChange(side);
    }
    if (multiSelect) {
      if (bodyParts.includes(part)) {
        onBodyPartsChange(bodyParts.filter((id) => id !== part));
        return;
      }
      onBodyPartsChange([...bodyParts, part]);
      return;
    }
    onBodyPartsChange([part]);
  };

  const switchSide = () => {
    onBodySideChange(bodySide === "Left" ? "Right" : "Left");
  };

  const selectionLabel = formatBodyPartSelection(bodyParts, bodySide);

  return (
    <div
      className={["flex flex-col gap-1.5 pt-[18px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex shrink-0 items-end gap-2">
        <Text as="span" className="text-[13px] font-bold text-[#2a3446]">
          Body part affected
        </Text>
        <Text
          as="span"
          className="text-ehs-muted-text ml-auto text-[11px]"
        >
          Tap a region on the figure, or pick from the list.
        </Text>
      </div>

      <div className="flex h-[600px] w-full min-h-[600px] flex-col rounded-[14px] border border-[rgba(15,23,42,0.08)] bg-white/62 p-5">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1.45fr)_minmax(220px,0.85fr)] xl:items-stretch">
          <ReportBodyMapFigure
            view="front"
            selectedParts={bodyParts}
            bodySide={bodySide}
            onSelectPart={selectPart}
          />
          <ReportBodyMapFigure
            view="back"
            selectedParts={bodyParts}
            bodySide={bodySide}
            onSelectPart={selectPart}
          />

          <div className="flex min-h-0 min-w-0 flex-col gap-3 self-stretch overflow-hidden">
            <div className="flex shrink-0 flex-col gap-2">
              <Text
                as="p"
                className="text-ehs-muted-text text-[11px] font-bold tracking-[1.2px] uppercase"
              >
                Selected
              </Text>

              <div className="flex w-full items-center gap-2.5 rounded-[10px] border border-ehs-normal-blue bg-ehs-normal-blue/18 px-3.5 py-2.5">
                <span className="size-2.5 shrink-0 rounded-[2px] bg-ehs-normal-blue" />
                <Text
                  as="span"
                  className="text-[13px] font-bold text-[#056e7e]"
                >
                  {selectionLabel}
                </Text>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={switchSide}
                  className="inline-flex h-7 items-center gap-2 rounded-[10px] border border-[rgba(15,23,42,0.14)] px-3 py-1 text-[12px] font-bold text-[#2a3446] transition-colors hover:border-[rgba(15,23,42,0.22)] hover:bg-white/70"
                >
                  <Icon
                    icon="mdi:chevron-left"
                    className="size-3"
                    aria-hidden="true"
                  />
                  Switch side
                </button>
                <button
                  type="button"
                  onClick={() => onMultiSelectChange(!multiSelect)}
                  aria-pressed={multiSelect}
                  className={[
                    "inline-flex h-7 min-w-[84px] items-center justify-center rounded-[10px] border px-3 py-1 text-[12px] font-bold transition-colors",
                    multiSelect
                      ? "border-ehs-normal-blue bg-ehs-normal-blue/14 text-[#056e7e]"
                      : "border-[rgba(15,23,42,0.14)] text-[#2a3446] hover:border-[rgba(15,23,42,0.22)] hover:bg-white/70",
                  ].join(" ")}
                >
                  Multi-select
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
              <Text
                as="p"
                className="text-ehs-muted-text shrink-0 text-[11px] font-bold tracking-[1.2px] uppercase"
              >
                Or pick from list
              </Text>

              <div className="flex min-h-0 flex-1 flex-wrap content-start gap-2 overflow-y-auto">
                {BODY_PART_OPTIONS.map((part) => {
                  const isSelected = bodyParts.includes(part.id);
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => selectPart(part.id)}
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] transition-all duration-150",
                        isSelected
                          ? "border-ehs-normal-blue bg-ehs-normal-blue/18 font-bold text-[#056e7e]"
                          : "border-[rgba(15,23,42,0.08)] bg-white/62 font-normal text-[#2a3446] hover:border-[rgba(15,23,42,0.16)]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "size-2 shrink-0 rounded-[3px]",
                          isSelected
                            ? "bg-ehs-normal-blue"
                            : "bg-[#b3bbc8]",
                        ].join(" ")}
                      />
                      {part.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
