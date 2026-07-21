"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  BODY_PART_OPTIONS,
  formatBodyPartSelection,
  type BodyPartId,
  type BodySide,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportBodyMapFigure } from "@/components/incidents/report/steps/step-3/ReportBodyMapFigure";

export type ReportBodyPartFieldProps = Readonly<{
  bodyParts: readonly BodyPartId[];
  bodySide: BodySide;
  multiSelect: boolean;
  onBodyPartsChange: (parts: readonly BodyPartId[]) => void;
  onBodySideChange: (side: BodySide) => void;
  onMultiSelectChange: (enabled: boolean) => void;
  className?: string;
}>;

export function ReportBodyPartField(props: Readonly<ReportBodyPartFieldProps>) {
  const {
    bodyParts,
    bodySide,
    multiSelect,
    onBodyPartsChange,
    onBodySideChange,
    onMultiSelectChange,
    className = "",
  } = props;

  const [activeTab, setActiveTab] = useState<"front" | "back">("front");

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
      className={["flex flex-col gap-2.5 pt-[18px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-wrap items-end gap-2">
        <Text as="span" className="text-[13px] font-bold text-[#2a3446]">
          Body part affected
        </Text>
        <Text as="span" className="text-ehs-muted-text ml-auto text-[11px]">
          Tap a region on the figure, or pick from the list.
        </Text>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-[14px] border border-[rgba(15,23,42,0.08)] bg-white/62 p-4 sm:p-5">
        {/* View Switcher for Mobile Devices */}
        <div className="flex w-full rounded-[10px] bg-[rgba(15,23,42,0.04)] p-1 sm:hidden">
          <button
            type="button"
            onClick={() => setActiveTab("front")}
            className={[
              "flex-1 rounded-[8px] py-1.5 text-[12px] font-bold transition-all duration-200",
              activeTab === "front"
                ? "bg-white text-[#056e7e] shadow-sm"
                : "text-ehs-gray hover:text-[#2a3446]",
            ].join(" ")}
          >
            Front view
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("back")}
            className={[
              "flex-1 rounded-[8px] py-1.5 text-[12px] font-bold transition-all duration-200",
              activeTab === "back"
                ? "bg-white text-[#056e7e] shadow-sm"
                : "text-ehs-gray hover:text-[#2a3446]",
            ].join(" ")}
          >
            Back view
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1.45fr)_minmax(220px,0.85fr)]">
          <ReportBodyMapFigure
            view="front"
            selectedParts={bodyParts}
            bodySide={bodySide}
            onSelectPart={selectPart}
            className={activeTab === "front" ? "flex" : "hidden sm:flex"}
          />
          <ReportBodyMapFigure
            view="back"
            selectedParts={bodyParts}
            bodySide={bodySide}
            onSelectPart={selectPart}
            className={activeTab === "back" ? "flex" : "hidden sm:flex"}
          />

          <div className="col-span-1 flex min-w-0 flex-col gap-4 self-stretch sm:col-span-2 2xl:col-span-1">
            <div className="flex shrink-0 flex-col gap-2">
              <Text
                as="p"
                className="text-ehs-muted-text text-[11px] font-bold tracking-[1.2px] uppercase"
              >
                Selected
              </Text>

              <div className="border-ehs-normal-blue bg-ehs-normal-blue/18 flex w-full items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5">
                <span className="bg-ehs-normal-blue size-2.5 shrink-0 rounded-[2px]" />
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

            <div className="flex flex-col gap-2">
              <Text
                as="p"
                className="text-ehs-muted-text shrink-0 text-[11px] font-bold tracking-[1.2px] uppercase"
              >
                Or pick from list
              </Text>

              <div className="flex flex-wrap content-start gap-2">
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
                          isSelected ? "bg-ehs-normal-blue" : "bg-[#b3bbc8]",
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
