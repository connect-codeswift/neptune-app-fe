"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type PolicyMakerDocumentDetailHeaderProps = Readonly<{
  document: PolicyDocument;
  onEdit?: () => void;
  onVersionHistory?: () => void;
  onApproval?: () => void;
  onAcknowledgment?: () => void;
  /** Only the assigned approver sees the Approval action. */
  canApprove?: boolean;
  /** Only the assigned ack-user sees the Acknowledgment action. */
  canAcknowledge?: boolean;
  isApproved?: boolean;
  isApproving?: boolean;
  className?: string;
}>;

const crumbMuted =
  "text-2.75 font-medium leading-[16.5px] text-[#8892a3] transition-colors hover:text-[#566072]";
const crumbActive = "text-2.75 font-medium leading-[16.5px] text-[#566072]";

const actionBaseClass =
  "h-9 w-full rounded-2.5 px-3 text-3.25 font-medium sm:h-9.5 sm:w-auto sm:px-3 sm:text-3.5";

/**
 * Document detail hero — breadcrumbs, title, actions (Figma 5568:24575).
 */
export function PolicyMakerDocumentDetailHeader(
  props: Readonly<PolicyMakerDocumentDetailHeaderProps>,
) {
  const {
    document,
    onEdit,
    onVersionHistory,
    onApproval,
    onAcknowledgment,
    canApprove = false,
    canAcknowledge = false,
    isApproved = false,
    isApproving = false,
    className = "",
  } = props;

  return (
    <div
      className={[
        "rounded-4 backdrop-blur-2.5 before:rounded-4 relative flex flex-col gap-1.5 border-b-[0.727px] border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] px-3.5 py-3.5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-5.5 sm:pt-3.5 sm:pb-3.5",
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
        <span className={`${crumbActive} truncate`}>{document.code}</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text
            as="h1"
            className="sm:text-5.5 text-lg leading-7 font-semibold tracking-[-0.2px] break-words text-[#0b1320] sm:leading-7"
          >
            {document.title}
          </Text>
          <Text as="p" className="text-xs leading-4.5 text-[#8892a3]">
            {`${document.documentKind} · ${document.version}`}
          </Text>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="tertiary"
            onClick={onEdit}
            className={`${actionBaseClass} border-[0.8px] border-[rgba(11,19,32,0.14)] text-[#0b1320] shadow-none`}
          >
            <Icon
              icon="mdi:pencil-outline"
              className="size-4"
              aria-hidden="true"
            />
            Edit
          </Button>
          <Button
            type="button"
            variant="tertiary"
            onClick={onVersionHistory}
            className={`${actionBaseClass} col-span-1 border-[0.8px] border-[rgba(11,19,32,0.14)] text-[#0b1320] shadow-none min-[480px]:col-span-2 sm:col-auto`}
          >
            Version History
          </Button>
          {canApprove ? (
            <Button
              type="button"
              variant="tertiary"
              onClick={onApproval}
              disabled={isApproved || isApproving}
              className={`${actionBaseClass} !bg-ehs-green !text-ehs-light-text hover:!bg-ehs-green/90 !border-transparent !shadow-none disabled:opacity-70`}
            >
              {isApproving
                ? "Approving…"
                : isApproved
                  ? "Approved"
                  : "Approval"}
            </Button>
          ) : null}
          {canAcknowledge ? (
            <Button
              type="button"
              variant="primary"
              onClick={onAcknowledgment}
              className={`${actionBaseClass} !bg-ehs-blue !text-ehs-light-text hover:!bg-ehs-blue/90 !border-transparent !shadow-none`}
            >
              Acknowledgment
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
