"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  BODY_PART_OPTIONS,
  formatBodyPartSelection,
  isBodyPartSided,
  type BodyPartId,
  type BodyPartSideMap,
  type BodyPartSideValue,
  type BodySide,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportBodyMapFigure } from "@/components/incidents/report/steps/step-3/ReportBodyMapFigure";

export type ReportBodyPartFieldProps = Readonly<{
  bodyParts: readonly BodyPartId[];
  bodyPartSides: BodyPartSideMap;
  bodySide: BodySide;
  multiSelect: boolean;
  onBodyPartsChange: (parts: readonly BodyPartId[]) => void;
  onBodyPartSidesChange: (sides: BodyPartSideMap) => void;
  onBodySideChange: (side: BodySide) => void;
  onMultiSelectChange: (enabled: boolean) => void;
  /** Free-text parts the reporter added; see `customBodyParts` on form state. */
  customBodyParts: readonly string[];
  onCustomBodyPartsChange: (parts: readonly string[]) => void;
  className?: string;
}>;

function omitPartSide(
  sides: BodyPartSideMap,
  part: BodyPartId,
): BodyPartSideMap {
  const next: Partial<Record<BodyPartId, BodyPartSideValue>> = { ...sides };
  delete next[part];
  return next;
}

export function ReportBodyPartField(props: Readonly<ReportBodyPartFieldProps>) {
  const {
    bodyParts,
    bodyPartSides,
    bodySide,
    multiSelect,
    onBodyPartsChange,
    onBodyPartSidesChange,
    onBodySideChange,
    onMultiSelectChange,
    customBodyParts,
    onCustomBodyPartsChange,
    className = "",
  } = props;

  const [customDraft, setCustomDraft] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  function commitCustomPart() {
    const trimmed = customDraft.trim();

    if (!trimmed) {
      setCustomError("Enter a body part.");
      return;
    }

    const exists =
      customBodyParts.some(
        (part) => part.toLowerCase() === trimmed.toLowerCase(),
      ) ||
      BODY_PART_OPTIONS.some(
        (part) => part.label.toLowerCase() === trimmed.toLowerCase(),
      );

    if (exists) {
      setCustomError("That part is already in the list.");
      return;
    }

    onCustomBodyPartsChange([...customBodyParts, trimmed]);
    setCustomDraft("");
    setCustomError(null);
    setIsAddingCustom(false);
  }

  function removeCustomPart(part: string) {
    onCustomBodyPartsChange(customBodyParts.filter((item) => item !== part));
  }

  const [activeTab, setActiveTab] = useState<"front" | "back">("front");

  const selectPart = (part: BodyPartId, side?: BodySide) => {
    const sided = isBodyPartSided(part);
    const effectiveSide = sided ? (side ?? bodySide) : undefined;

    if (multiSelect) {
      const alreadySelected = bodyParts.includes(part);

      if (alreadySelected) {
        const currentSide = bodyPartSides[part];

        // Same part, opposite side → keep both (e.g. Left + Right hand).
        if (
          effectiveSide &&
          currentSide &&
          currentSide !== "Both" &&
          currentSide !== effectiveSide
        ) {
          onBodyPartSidesChange({ ...bodyPartSides, [part]: "Both" });
          onBodySideChange(effectiveSide);
          return;
        }

        // Both selected → remove only the clicked side.
        if (effectiveSide && currentSide === "Both") {
          const remaining: BodySide =
            effectiveSide === "Left" ? "Right" : "Left";
          onBodyPartSidesChange({ ...bodyPartSides, [part]: remaining });
          onBodySideChange(remaining);
          return;
        }

        // Toggle off this part entirely.
        onBodyPartsChange(bodyParts.filter((id) => id !== part));
        onBodyPartSidesChange(omitPartSide(bodyPartSides, part));
        return;
      }

      onBodyPartsChange([...bodyParts, part]);
      if (effectiveSide) {
        onBodyPartSidesChange({ ...bodyPartSides, [part]: effectiveSide });
        onBodySideChange(effectiveSide);
      }
      return;
    }

    // Single-select: replace selection.
    onBodyPartsChange([part]);
    if (effectiveSide) {
      onBodyPartSidesChange({ [part]: effectiveSide });
      onBodySideChange(effectiveSide);
    } else {
      onBodyPartSidesChange({});
    }
  };

  const switchSide = () => {
    onBodySideChange(bodySide === "Left" ? "Right" : "Left");
  };

  const selectionLabel = formatBodyPartSelection(
    bodyParts,
    bodySide,
    bodyPartSides,
  );

  return (
    <div
      className={["flex flex-col gap-2.5 pt-4.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-wrap items-end gap-2">
        <Text as="span" className="text-ehs-slate text-sm font-bold">
          Body part affected
        </Text>
        <Text as="span" className="text-ehs-muted-text ml-auto text-sm">
          Tap a region on the figure, or pick from the list.
        </Text>
      </div>

      <div className="rounded-3.5 border-ehs-border-ink/8 bg-ehs-surface/62 flex w-full flex-col gap-4 border p-4 sm:p-5">
        <div className="rounded-2.5 bg-ehs-surface-inverse/4 flex w-full p-1 sm:hidden">
          <button
            type="button"
            onClick={() => setActiveTab("front")}
            className={[
              "rounded-2 flex-1 py-1.5 text-sm font-bold transition-all duration-200",
              activeTab === "front"
                ? "text-ehs-dark-blue bg-ehs-surface shadow-sm"
                : "text-ehs-gray hover:text-ehs-slate",
            ].join(" ")}
          >
            Front view
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("back")}
            className={[
              "rounded-2 flex-1 py-1.5 text-sm font-bold transition-all duration-200",
              activeTab === "back"
                ? "text-ehs-dark-blue bg-ehs-surface shadow-sm"
                : "text-ehs-gray hover:text-ehs-slate",
            ].join(" ")}
          >
            Back view
          </button>
        </div>

        {/* Two rows, never three columns: the two figures side by side, then
            the picker across the full width beneath them.

            This card lives in the middle column of a three-column page, so it
            never has the room for figure | figure | list — squeezing the list
            into a third column stacks the chips one per row, which makes the
            section enormously tall and leaves a void beside the figures.
            `items-start` keeps the figures at their own height rather than
            stretching to whatever the picker needs. */}
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <ReportBodyMapFigure
            view="front"
            selectedParts={bodyParts}
            bodyPartSides={bodyPartSides}
            bodySide={bodySide}
            onSelectPart={selectPart}
            className={activeTab === "front" ? "flex" : "hidden sm:flex"}
          />
          <ReportBodyMapFigure
            view="back"
            selectedParts={bodyParts}
            bodyPartSides={bodyPartSides}
            bodySide={bodySide}
            onSelectPart={selectPart}
            className={activeTab === "back" ? "flex" : "hidden sm:flex"}
          />

          <div className="col-span-1 flex min-w-0 flex-col gap-4 self-start sm:col-span-2">
            <div className="flex shrink-0 flex-col gap-2">
              <Text
                as="p"
                className="text-ehs-muted-text text-sm font-bold tracking-[1.2px] uppercase"
              >
                Selected
              </Text>

              {/* Selection and its controls share a row now the picker spans
                  the full width — a full-bleed teal bar reads as a banner
                  rather than a value. */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="border-ehs-normal-blue bg-ehs-normal-blue/18 rounded-2.5 flex min-w-0 flex-1 items-center gap-2.5 border px-3.5 py-2.5 sm:max-w-105">
                  <span className="bg-ehs-normal-blue size-2.5 shrink-0 rounded-full" />
                  <Text
                    as="span"
                    className="text-ehs-dark-blue min-w-0 truncate text-sm font-bold"
                  >
                    {selectionLabel}
                  </Text>
                </div>

                <button
                  type="button"
                  onClick={switchSide}
                  className="text-ehs-slate rounded-2.5 border-ehs-border-ink/14 hover:border-ehs-border-ink/22 hover:bg-ehs-surface/70 inline-flex h-7 items-center gap-2 border px-3 py-1 text-sm font-bold transition-colors"
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
                    "rounded-2.5 inline-flex h-7 min-w-21 items-center justify-center border px-3 py-1 text-sm font-bold transition-colors",
                    multiSelect
                      ? "border-ehs-normal-blue bg-ehs-normal-blue/14 text-ehs-dark-blue"
                      : "text-ehs-slate border-ehs-border-ink/14 hover:border-ehs-border-ink/22 hover:bg-ehs-surface/70",
                  ].join(" ")}
                >
                  Multi-select
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Text
                as="p"
                className="text-ehs-muted-text shrink-0 text-sm font-bold tracking-[1.2px] uppercase"
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
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all duration-150",
                        isSelected
                          ? "border-ehs-normal-blue bg-ehs-normal-blue/18 text-ehs-dark-blue font-bold"
                          : "text-ehs-slate border-ehs-border-ink/8 bg-ehs-surface/62 hover:border-ehs-border-ink/16 font-normal",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "rounded-0.75 size-2 shrink-0",
                          isSelected
                            ? "bg-ehs-normal-blue"
                            : "bg-ehs-muted-text",
                        ].join(" ")}
                      />
                      {part.label}
                    </button>
                  );
                })}

                {/* Reporter-added parts. Always selected — they were typed in
                    because they apply — so the × removes rather than toggles. */}
                {customBodyParts.map((part) => (
                  <span
                    key={part}
                    className="border-ehs-normal-blue bg-ehs-normal-blue/18 text-ehs-dark-blue inline-flex items-center gap-2 rounded-full border py-2 pr-1.5 pl-3 text-sm font-bold"
                  >
                    {part}
                    <button
                      type="button"
                      onClick={() => removeCustomPart(part)}
                      aria-label={`Remove ${part}`}
                      className="hover:bg-ehs-normal-blue/25 inline-flex size-4 cursor-pointer items-center justify-center rounded-full transition-colors"
                    >
                      <Icon
                        icon="mdi:close"
                        className="size-3"
                        aria-hidden="true"
                      />
                    </button>
                  </span>
                ))}

                {isAddingCustom ? (
                  <span className="inline-flex items-center gap-1.5">
                    <input
                      autoFocus
                      value={customDraft}
                      placeholder="e.g. Left ear"
                      aria-label="New body part"
                      aria-invalid={customError !== null}
                      onChange={(event) => {
                        setCustomDraft(event.target.value);
                        setCustomError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          commitCustomPart();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setIsAddingCustom(false);
                          setCustomDraft("");
                          setCustomError(null);
                        }
                      }}
                      className="border-ehs-normal-blue/60 text-ehs-dark-bg placeholder:text-ehs-muted-text focus:ring-ehs-normal-blue/15 focus:ring-0.75 bg-ehs-surface h-8.5 w-40 rounded-full border px-3 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={commitCustomPart}
                      className="bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover text-ehs-on-accent inline-flex h-8.5 cursor-pointer items-center rounded-full px-3 text-sm font-bold transition-colors"
                    >
                      Add
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(true)}
                    className="text-ehs-normal-blue hover:border-ehs-normal-blue/50 hover:bg-ehs-normal-blue/8 border-ehs-border-ink/22 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed px-3 py-2 text-sm font-bold transition-colors"
                  >
                    <Icon
                      icon="mdi:plus"
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    Add custom part
                  </button>
                )}
              </div>

              {customError ? (
                <p className="text-ehs-red text-xs" role="alert">
                  {customError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
