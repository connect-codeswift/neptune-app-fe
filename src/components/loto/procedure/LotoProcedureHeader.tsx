"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";

const crumbMuted = "text4 font-normal text-[#b3bbc8]";
const crumbLink =
  "text4 text-ehs-muted-text hover:text-ehs-gray font-normal transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-3 shrink-0"
      aria-hidden="true"
    />
  );
}

export type LotoProcedureHeaderProps = Readonly<{
  mode: "create" | "edit";
  equipmentCode?: string;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}>;

/** Breadcrumb + title + Cancel / primary action — Figma 6912:56200 / 6915:56769. */
export function LotoProcedureHeader(props: LotoProcedureHeaderProps) {
  const {
    mode,
    equipmentCode,
    onCancel,
    onSubmit,
    isSubmitting = false,
  } = props;

  const isCreate = mode === "create";
  const title = isCreate
    ? "Create LOTO Procedure"
    : `Edit LOTO Procedure: ${equipmentCode ?? ""}`;
  const subtitle = isCreate
    ? "Document a new lockout/tagout energy control procedure"
    : "Update energy control procedure and isolation steps";
  const crumbTail = isCreate ? "New Procedure" : "Edit";
  const submitLabel = isCreate ? "Create Procedure" : "Save Changes";
  const submitIcon = isCreate ? "mdi:plus" : "mdi:content-save-outline";

  return (
    <div className="relative flex flex-col justify-center gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-5.5 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative z-1 flex min-w-0 flex-col gap-3">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1.5 overflow-x-auto md:flex"
        >
          <span className={crumbMuted}>Admin</span>
          <Chevron />
          <Link href={LOTO_ROUTE} className={crumbLink}>
            LOTO Procedures
          </Link>
          <Chevron />
          <span className={crumbMuted}>{crumbTail}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={LOTO_ROUTE}
              aria-label="Back to Lockout / Tagout"
              className="border-ehs-border text-ehs-dark-bg flex size-8 shrink-0 items-center justify-center rounded-2.5 border bg-white transition-colors hover:bg-slate-50 md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <div className="flex min-w-0 flex-col gap-1">
              <Text as="h1" className="text1 text-ehs-darker">
                {title}
              </Text>
              <Text
                as="p"
                className="text4 text-ehs-muted-text hidden md:block"
              >
                {subtitle}
              </Text>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="text4 rounded-2.5 px-4 py-2.5 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="text4 gap-2 rounded-2.5 px-4 py-2.5 font-semibold shadow-[0px_4px_6px_rgba(8,145,166,0.3)]"
            >
              <Icon icon={submitIcon} className="size-3.5 shrink-0" />
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
