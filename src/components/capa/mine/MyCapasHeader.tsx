"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

const CAPA_ROUTE = "/dashboard/capa";
const CREATE_CAPA_ROUTE = "/dashboard/capa/new";

const crumbMuted = "text-sm font-medium leading-[16.5px] text-ehs-gray";
const crumbLink =
  "text-sm font-medium leading-[16.5px] text-ehs-muted-text transition-colors hover:text-ehs-gray";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-3.5 shrink-0"
      aria-hidden="true"
    />
  );
}

/** My CAPAs page header — Figma 838:3106. */
export function MyCapasHeader() {
  const router = useRouter();

  return (
    <div className="backdrop-blur-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex flex-col gap-1.5 rounded-2xl border px-4 pt-3.5 pb-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-5.5">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1 overflow-x-auto md:flex"
        >
          <span className={crumbMuted}>Compliance</span>
          <Chevron />
          <Link href={CAPA_ROUTE} className={crumbLink}>
            CAPA
          </Link>
          <Chevron />
          <span className={crumbMuted}>My CAPAs</span>
        </nav>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={CAPA_ROUTE}
              aria-label="Back to CAPA Dashboard"
              className="border-ehs-border text-ehs-dark-bg rounded-2.5 bg-ehs-surface hover:bg-ehs-surface-raised flex size-8 shrink-0 items-center justify-center border transition-colors md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text
                as="h1"
                className="text-5.5 text-ehs-dark-bg leading-7 font-semibold tracking-[-0.2px]"
              >
                My CAPAs
              </Text>
              <Text as="p" className="text-ehs-muted-text text-sm leading-4.5">
                CAPAs assigned to or requiring your verification
              </Text>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => router.push(CREATE_CAPA_ROUTE)}
            className="rounded-2.5 w-full shrink-0 px-3.5 py-2.5 shadow-(--ehs-shadow-button-primary-flat) sm:w-auto"
          >
            <Icon icon="mdi:plus" className="size-4" aria-hidden />
            Create CAPA
          </Button>
        </div>
      </div>
    </div>
  );
}
