"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { PpeBackLink, PPE_ROUTE } from "@/components/ppe/PpeBackLink";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text hover:text-ehs-gray transition-colors";

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
    <div className="relative flex flex-col justify-center gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-4 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] md:px-5.5">
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

        <p className="text8 text-ehs-muted-text md:hidden">
          {`PPE Management > Issuance Log > ${name}`}
        </p>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <PpeBackLink />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text as="h1" className="text1 text-ehs-darker">
                {name}
              </Text>
              <Text as="p" className="text8 text-ehs-muted-text hidden md:block">
                {`${role} — PPE Profile`}
              </Text>
            </div>
          </div>

          <div className="hidden shrink-0 flex-wrap items-center gap-2.5 md:flex">
            <Button
              type="button"
              variant="tertiary"
              onClick={onRequestReplacement}
              className="text4 gap-2 rounded-2.5 px-4 py-2"
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
