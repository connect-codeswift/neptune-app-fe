"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

const PPE_ROUTE = "/dashboard/ppe-management";

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

export type PpeEmployeeProfileHeaderProps = Readonly<{
  name: string;
  role: string;
  department: string;
  onRequestReplacement?: () => void;
  onIssuePpe?: () => void;
}>;

/** Breadcrumb + title bar for the employee PPE profile. */
export function PpeEmployeeProfileHeader(
  props: Readonly<PpeEmployeeProfileHeaderProps>,
) {
  const { name, role, onRequestReplacement } = props;

  return (
    <div className="relative flex flex-col justify-center gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-4 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] md:px-[22px]">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
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
          <Link href={PPE_ROUTE} className={crumbLink}>
            Issuance Log
          </Link>
          <Chevron />
          <span className={`${crumbMuted} truncate`}>{name}</span>
        </nav>

        <p className="text-ehs-muted-text text-[11px] font-semibold md:hidden">
          {`PPE Management > Issuance Log > ${name}`}
        </p>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={PPE_ROUTE}
              aria-label="Back to PPE Management"
              className="border-ehs-border text-ehs-dark-bg flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors hover:bg-slate-50 md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <div className="flex min-w-0 flex-col gap-1">
              <Text
                as="h1"
                className="text-ehs-darker text-lg font-bold tracking-[-0.2px] md:text-[22px] md:font-semibold"
              >
                {name}
              </Text>
              <Text
                as="p"
                className="text-ehs-muted-text hidden text-base leading-[19.5px] md:block"
              >
                {`${role} — PPE Profile`}
              </Text>
            </div>
          </div>

          <div className="hidden shrink-0 flex-wrap items-center gap-2.5 md:flex">
            <Button
              type="button"
              variant="tertiary"
              onClick={onRequestReplacement}
              className="gap-2 rounded-[10px] px-4 py-2 text-base font-medium"
            >
              <Icon
                icon="mdi:refresh"
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              Request Replacement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
