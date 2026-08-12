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
        "rounded-4 backdrop-blur-2.5 before:rounded-4 relative flex w-full min-w-0 flex-col gap-1.5 border-b-[0.727px] border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] px-3.5 py-3.5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-5.5 sm:pt-3.5 sm:pb-3.5",
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
          className="size-2.75 shrink-0 text-[#8892a3]"
          aria-hidden="true"
        />
        <Link href="/dashboard/policy-maker" className={crumbMuted}>
          Documents
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="size-2.75 shrink-0 text-[#8892a3]"
          aria-hidden="true"
        />
        <span className={crumbActive}>Edit</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-0.5">
        <Text
          as="h1"
          className="text1 text-ehs-darker"
        >
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
