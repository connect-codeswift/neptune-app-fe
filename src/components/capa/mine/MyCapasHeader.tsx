"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

const CAPA_ROUTE = "/dashboard/capa";
const CREATE_CAPA_ROUTE = "/dashboard/capa/new";

const crumbMuted = "text-sm font-medium leading-[16.5px] text-[#566072]";
const crumbLink =
  "text-sm font-medium leading-[16.5px] text-[#8892a3] transition-colors hover:text-ehs-gray";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="size-3.5 shrink-0 text-[#8892a3]"
      aria-hidden="true"
    />
  );
}

/** My CAPAs page header — Figma 838:3106. */
export function MyCapasHeader() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-5.5 pt-3.5 pb-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
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

        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={CAPA_ROUTE}
              aria-label="Back to CAPA Dashboard"
              className="border-ehs-border text-ehs-dark-bg flex size-8 shrink-0 items-center justify-center rounded-2.5 border bg-white transition-colors hover:bg-slate-50 md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text
                as="h1"
                className="text-5.5 leading-7 font-semibold tracking-[-0.2px] text-[#0b1320]"
              >
                My CAPAs
              </Text>
              <Text as="p" className="text-sm leading-4.5 text-[#8892a3]">
                CAPAs assigned to or requiring your verification
              </Text>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => router.push(CREATE_CAPA_ROUTE)}
            className="shrink-0 rounded-2.5 px-[14.5px] py-[9.5px] shadow-[0px_6px_18px_-6px_#0891a6]"
          >
            <Icon icon="mdi:plus" className="size-4" aria-hidden />
            Create CAPA
          </Button>
        </div>
      </div>
    </div>
  );
}
