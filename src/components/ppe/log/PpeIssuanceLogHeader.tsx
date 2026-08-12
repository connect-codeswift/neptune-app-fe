"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { PpeBackLink, PPE_ROUTE } from "@/components/ppe/PpeBackLink";

const crumbMuted = "text4 font-normal text-ehs-gray";
const crumbLink =
  "text4 text-ehs-muted-text hover:text-ehs-gray font-normal transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-4 shrink-0"
      aria-hidden="true"
    />
  );
}

export type PpeIssuanceLogHeaderProps = Readonly<{
  /**
   * When true, drop breadcrumb / back link — used when the log is embedded on
   * the PPE Management home for non-elevated roles.
   */
  embedded?: boolean;
}>;

/** Breadcrumb + title bar for the PPE Issuance Log (actions live on the table). */
export function PpeIssuanceLogHeader(
  props: Readonly<PpeIssuanceLogHeaderProps>,
) {
  const { embedded = false } = props;

  return (
    <div className="relative flex w-full flex-col justify-center gap-1.5 rounded-2xl border border-white/70 bg-white/50 px-4 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] md:px-6">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        {!embedded ? (
          <nav
            aria-label="Breadcrumb"
            className="hidden items-center gap-1 overflow-x-auto md:flex"
          >
            <span className={crumbMuted}>Safety</span>
            <Chevron />
            <Link href={PPE_ROUTE} className={crumbLink}>
              PPE Management
            </Link>
            <Chevron />
            <span className={crumbMuted}>Issuance Log</span>
          </nav>
        ) : null}

        <div className="flex min-w-0 items-center gap-2">
          {!embedded ? <PpeBackLink className="md:hidden" /> : null}
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as={embedded ? "h2" : "h1"}
              className={
                embedded ? "text3 text-ehs-darker" : "text1 text-ehs-darker"
              }
            >
              PPE Issuance Log
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text hidden md:block">
              Complete record of all PPE issued, returned, and outstanding.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
