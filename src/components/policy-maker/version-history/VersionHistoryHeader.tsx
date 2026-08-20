"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { formatDocumentDisplayId } from "@/services/mappers/document-list.mapper";

export type VersionHistoryHeaderProps = Readonly<{
  document: PolicyDocument;
  className?: string;
}>;

const crumbMuted =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";
const crumbActive = "text8 text-ehs-gray";

/**
 * Version History page hero (Figma 5568:25072).
 */
export function VersionHistoryHeader(
  props: Readonly<VersionHistoryHeaderProps>,
) {
  const { document, className = "" } = props;
  const detailHref = `/dashboard/policy-maker/${encodeURIComponent(document.id)}`;

  return (
    <div
      className={[
        "rounded-4 backdrop-blur-2.5 before:rounded-4 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex w-full min-w-0 flex-col gap-1.5 border-b px-3.5 py-3.5 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:content-[''] sm:px-5.5 sm:pt-3.5 sm:pb-3.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <nav
        aria-label="Breadcrumb"
        className="relative z-1 flex min-w-0 flex-wrap items-center gap-1"
      >
        <span className={crumbActive}>Compliance</span>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-2.75 shrink-0"
          aria-hidden="true"
        />
        <Link href="/dashboard/policy-maker" className={crumbMuted}>
          Documents
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-2.75 shrink-0"
          aria-hidden="true"
        />
        <Link href={detailHref} className={`${crumbMuted} truncate`}>
          {formatDocumentDisplayId(document.id)}
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-2.75 shrink-0"
          aria-hidden="true"
        />
        <span className={crumbActive}>Versions</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-0.5">
        <Text as="h1" className="text1 text-ehs-darker">
          Version History
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text max-w-full truncate">
          {document.title}
        </Text>
      </div>
    </div>
  );
}
