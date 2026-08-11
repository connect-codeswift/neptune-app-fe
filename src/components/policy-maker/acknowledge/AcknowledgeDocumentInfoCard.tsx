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
  "relative w-full min-w-0 overflow-hidden rounded-[16px] border-b-[0.727px] border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[16px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']";

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
      <div className="relative z-1 flex min-w-0 items-center gap-[11px] px-4 py-3.5 sm:px-[22px] sm:py-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(11,19,32,0.14)] px-3">
          <Icon
            icon="mdi:file-document-outline"
            className="size-6 text-[#566072]"
            aria-hidden="true"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-[5px]">
          <Text
            as="h2"
            className="text-[16px] leading-7 font-semibold tracking-[-0.2px] text-[#0b1320] sm:text-[20px]"
          >
            Read & Acknowledge Document
          </Text>
          <div className="flex min-w-0 flex-wrap items-center gap-x-[18px] gap-y-1 text-[12px] leading-[18px] text-[#8892a3]">
            <span>{versionLabel(document.version)}</span>
            <span>{`Published on ${published}`}</span>
            <span>{document.fileSize}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
