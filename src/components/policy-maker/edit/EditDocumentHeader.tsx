"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type EditDocumentHeaderProps = Readonly<{
  className?: string;
}>;

const crumbMuted =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";
const crumbActive = "text8 text-ehs-gray";

/**
 * Edit Document page hero (Figma 5568:25886).
 */
export function EditDocumentHeader(props: Readonly<EditDocumentHeaderProps>) {
  const { className = "" } = props;

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
        <span className={crumbActive}>Edit</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-0.5">
        <Text as="h1" className="text1 text-ehs-darker">
          Edit Document
        </Text>
        <Text
          as="p"
          className="text8 text-ehs-muted-text max-w-full sm:whitespace-nowrap"
        >
          Add a new document to the controlled library
        </Text>
      </div>
    </div>
  );
}
