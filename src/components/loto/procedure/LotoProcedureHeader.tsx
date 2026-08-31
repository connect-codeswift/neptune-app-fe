"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

export type LotoProcedureHeaderProps = Readonly<{
  mode: "create" | "edit";
  equipmentCode?: string;
}>;

/**
 * Breadcrumb + title. The Cancel / primary pair used to live here, above a
 * form the author had not filled in yet — asking to submit before showing
 * what there was to submit. Both now sit after the last card, where the
 * form ends, matching Apply Lockout.
 */
export function LotoProcedureHeader(props: Readonly<LotoProcedureHeaderProps>) {
  const { mode, equipmentCode } = props;

  const isCreate = mode === "create";
  const title = isCreate
    ? "Create LOTO Procedure"
    : `Edit LOTO Procedure: ${equipmentCode ?? ""}`;
  const subtitle = isCreate
    ? "Document a new lockout/tagout energy control procedure"
    : "Update energy control procedure and isolation steps";
  const crumbTail = isCreate ? "New Procedure" : "Edit";

  return (
    <div className="backdrop-blur-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex flex-col justify-center gap-3 rounded-2xl border px-5.5 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-['']">
      <div className="relative z-1 flex min-w-0 flex-col gap-3">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1 overflow-x-auto md:flex"
        >
          <Text as="span" className={crumbMuted}>
            Admin
          </Text>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-3 shrink-0"
            aria-hidden="true"
          />
          <Link href={LOTO_ROUTE} className={crumbLink}>
            LOTO Procedures
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-3 shrink-0"
            aria-hidden="true"
          />
          <Text as="span" className={crumbMuted}>
            {crumbTail}
          </Text>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={LOTO_ROUTE}
              aria-label="Back to Lockout / Tagout"
              className="border-ehs-border text-ehs-dark-bg rounded-2.5 bg-ehs-surface hover:bg-ehs-surface-raised flex size-8 shrink-0 items-center justify-center border transition-colors md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text as="h1" className="text1 text-ehs-darker">
                {title}
              </Text>
              <Text
                as="p"
                className="text8 text-ehs-muted-text hidden md:block"
              >
                {subtitle}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
