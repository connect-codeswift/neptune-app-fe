"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { PpeBackLink, PPE_ROUTE } from "@/components/ppe/PpeBackLink";

const crumbMuted = "text-[#b3bbc8] text-sm font-normal";
const crumbLink =
  "text-ehs-muted-text hover:text-ehs-gray text-sm font-normal transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-3 shrink-0"
      aria-hidden="true"
    />
  );
}

export type PpeIssuanceLogHeaderProps = Readonly<{
  onExportCsv?: () => void;
  onIssuePpe?: () => void;
  /**
   * When true, drop breadcrumb / back link — used when the log is embedded on
   * the PPE Management home for non-elevated roles.
   */
  embedded?: boolean;
}>;

/** Breadcrumb + title bar for the PPE Issuance Log. */
export function PpeIssuanceLogHeader(
  props: Readonly<PpeIssuanceLogHeaderProps>,
) {
  const { onExportCsv, onIssuePpe, embedded = false } = props;

  return (
    <div className="relative flex flex-col justify-center gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-4 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] md:px-5.5">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        {!embedded ? (
          <nav
            aria-label="Breadcrumb"
            className="hidden items-center gap-1.5 overflow-x-auto md:flex"
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

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {!embedded ? <PpeBackLink /> : null}
            <div className="flex min-w-0 flex-col gap-1">
              <Text
                as={embedded ? "h2" : "h1"}
                className="text-ehs-darker text-base font-semibold tracking-[-0.2px] md:text-5.5"
              >
                PPE Issuance Log
              </Text>
              <Text
                as="p"
                className="text-ehs-muted-text hidden leading-[19.5px] md:block"
              >
                Complete record of all PPE issued, returned, and outstanding.
              </Text>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5 max-md:w-full max-md:[&>button]:flex-1">
            <Button
              type="button"
              variant="tertiary"
              onClick={onExportCsv}
              className="gap-2 rounded-2.5 px-4 py-2.5 text-base! font-medium md:py-2"
            >
              <Icon
                icon="mdi:download"
                className="size-3.5 shrink-0"
                aria-hidden="true"
              />
              Export CSV
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onIssuePpe}
              className="gap-2 rounded-2.5 px-4 py-2.5 text-base! font-semibold shadow-[0px_6px_18px_-6px_#0891a6] md:py-2"
            >
              <Icon
                icon="mdi:plus"
                className="size-3.5 shrink-0"
                aria-hidden="true"
              />
              Issue PPE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
