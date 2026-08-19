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
    ? "border-ehs-progress-done/30"
    : "border-ehs-hairline/90";

  return (
    <article
      className={[
        "rounded-4 before:rounded-4 bg-ehs-surface/62 relative w-full min-w-0 overflow-hidden border shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:content-['']",
        borderClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative z-1 flex min-w-0 flex-col gap-2 px-3.5 pt-4 pb-4 sm:px-[17px] sm:pt-[17px] sm:pb-[17px]">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <Text as="span" className="text3 text-ehs-dark-bg font-mono">
              {entry.version}
            </Text>

            {entry.status === "published" || entry.isCurrent ? (
              <span className="bg-ehs-progress-done/12 inline-flex h-[21px] items-center gap-1.5 rounded-full pr-2.5 pl-2">
                <span className="rounded-0.75 bg-ehs-progress-done size-1.5 shrink-0" />
                <span className="text5 text-[#15803d]">Published</span>
              </span>
            ) : null}

            {entry.status === "superseded" ? (
              <span className="bg-ehs-gray/10 inline-flex h-[21px] items-center gap-1.5 rounded-full pr-2.5 pl-2">
                <span className="rounded-0.75 bg-ehs-muted-text size-1.5 shrink-0" />
                <span className="text5 text-ehs-slate">Superseded</span>
              </span>
            ) : null}

            {entry.status === "review" ? (
              <span className="bg-ehs-yellow/14 inline-flex h-[21px] items-center gap-1.5 rounded-full pr-2.5 pl-2">
                <span className="bg-ehs-yellow rounded-0.75 size-1.5 shrink-0" />
                <span className="text5 text-ehs-slate">In review</span>
              </span>
            ) : null}

            {entry.isCurrent ? (
              <span className="text8 text-ehs-gray bg-ehs-surface-inverse/14 inline-flex h-5 items-center rounded px-2 py-0.5">
                Current
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={`Download ${entry.version}`}
              onClick={onDownload}
              className="text-ehs-muted-text hover:text-ehs-gray inline-flex size-4 cursor-pointer items-center justify-center transition-colors"
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
              className="text-ehs-muted-text hover:text-ehs-gray inline-flex size-4 cursor-pointer items-center justify-center transition-colors"
            >
              <Icon
                icon="mdi:eye-outline"
                className="size-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <Text as="p" className="text4 text-ehs-slate">
          {entry.changeLog}
        </Text>

        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text8 text-ehs-muted-text inline-flex items-center gap-1">
            <Icon
              icon="mdi:clock-outline"
              className="size-3 shrink-0"
              aria-hidden="true"
            />
            {entry.publishedAt}
          </span>
          <Text as="span" className="text8 text-ehs-muted-text">
            {entry.authorFullName}
          </Text>
        </div>
      </div>
    </article>
  );
}
