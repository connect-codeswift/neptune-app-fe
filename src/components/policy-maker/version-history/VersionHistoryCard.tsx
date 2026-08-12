"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { VersionHistoryCardModel } from "@/components/policy-maker/version-history/version-history-utils";

export type VersionHistoryCardProps = Readonly<{
  entry: VersionHistoryCardModel;
  onDownload?: () => void;
  onView?: () => void;
  className?: string;
}>;

/**
 * Single version card (Figma 5568:24958 / 24988).
 */
export function VersionHistoryCard(props: Readonly<VersionHistoryCardProps>) {
  const { entry, onDownload, onView, className = "" } = props;

  const borderClass = entry.isCurrent
    ? "border-[rgba(0,201,80,0.3)]"
    : "border-[rgba(255,255,255,0.9)]";

  return (
    <article
      className={[
        "relative w-full min-w-0 overflow-hidden rounded-4 border-[0.8px] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-4 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']",
        borderClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative z-1 flex min-w-0 flex-col gap-2 px-3.5 pt-4 pb-4 sm:px-[16.8px] sm:pt-[16.8px] sm:pb-[16.8px]">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <Text
              as="span"
              className="font-mono text-3.75 leading-6 font-bold text-[#0b1320] sm:text-base"
            >
              {entry.version}
            </Text>

            {entry.status === "published" || entry.isCurrent ? (
              <span className="inline-flex h-[20.5px] items-center gap-1.5 rounded-full bg-[rgba(0,201,80,0.12)] pr-2.5 pl-2">
                <span className="size-1.5 shrink-0 rounded-0.75 bg-[#00c950]" />
                <span className="text-2.75 leading-[16.5px] font-semibold tracking-[0.11px] text-[#15803d]">
                  Published
                </span>
              </span>
            ) : null}

            {entry.status === "superseded" ? (
              <span className="inline-flex h-[20.5px] items-center gap-1.5 rounded-full bg-[rgba(86,96,114,0.1)] pr-2.5 pl-2">
                <span className="size-1.5 shrink-0 rounded-0.75 bg-[#8892a3]" />
                <span className="text-2.75 leading-[16.5px] font-semibold tracking-[0.11px] text-[#2a3446]">
                  Superseded
                </span>
              </span>
            ) : null}

            {entry.status === "review" ? (
              <span className="inline-flex h-[20.5px] items-center gap-1.5 rounded-full bg-[rgba(245,158,11,0.14)] pr-2.5 pl-2">
                <span className="size-1.5 shrink-0 rounded-0.75 bg-[#f59e0b]" />
                <span className="text-2.75 leading-[16.5px] font-semibold tracking-[0.11px] text-[#2a3446]">
                  In review
                </span>
              </span>
            ) : null}

            {entry.isCurrent ? (
              <span className="inline-flex h-5 items-center rounded bg-[rgba(11,19,32,0.14)] px-2 py-0.5 text-xs leading-4 text-[#566072]">
                Current
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={`Download ${entry.version}`}
              onClick={onDownload}
              className="inline-flex size-4 cursor-pointer items-center justify-center text-[#8892a3] transition-colors hover:text-[#566072]"
            >
              <Icon
                icon="mdi:download-outline"
                className="size-4"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              aria-label={`View ${entry.version}`}
              onClick={onView}
              className="inline-flex size-4 cursor-pointer items-center justify-center text-[#8892a3] transition-colors hover:text-[#566072]"
            >
              <Icon
                icon="mdi:eye-outline"
                className="size-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <Text as="p" className="text-xs leading-4 text-[#2a3446]">
          {entry.changeLog}
        </Text>

        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1 text-xs leading-4 text-[#8892a3]">
            <Icon
              icon="mdi:clock-outline"
              className="size-3 shrink-0"
              aria-hidden="true"
            />
            {entry.publishedAt}
          </span>
          <Text as="span" className="text-xs leading-4 text-[#8892a3]">
            {entry.authorFullName}
          </Text>
        </div>
      </div>
    </article>
  );
}
