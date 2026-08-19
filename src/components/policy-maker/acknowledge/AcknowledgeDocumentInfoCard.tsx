"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  formatPublishedLabel,
  versionLabel,
} from "@/components/policy-maker/acknowledge/acknowledge-document-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type AcknowledgeDocumentInfoCardProps = Readonly<{
  document: PolicyDocument;
  className?: string;
}>;

const glassCardClass =
  "relative w-full min-w-0 overflow-hidden rounded-4 border-b border-ehs-border-ink/8 bg-ehs-surface/62 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-4 before:content-['']";

/**
 * Document summary strip (Figma 5568:25346).
 */
export function AcknowledgeDocumentInfoCard(
  props: Readonly<AcknowledgeDocumentInfoCardProps>,
) {
  const { document, className = "" } = props;
  const published = formatPublishedLabel(
    document.reviewDate || document.updated,
  );

  return (
    <div className={[glassCardClass, className].filter(Boolean).join(" ")}>
      <div className="relative z-1 flex min-w-0 items-center gap-2.75 px-4 py-3.5 sm:px-5.5 sm:py-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ehs-surface-inverse/14 px-3">
          <Icon
            icon="mdi:file-document-outline"
            className="text-ehs-gray size-6"
            aria-hidden="true"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.25">
          <Text as="h2" className="text3 text-ehs-darker">
            Read & Acknowledge Document
          </Text>
          <div className="text8 text-ehs-muted-text flex min-w-0 flex-wrap items-center gap-x-4.5 gap-y-1">
            <span>{versionLabel(document.version)}</span>
            <span>{`Published on ${published}`}</span>
            <span>{document.fileSize}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
