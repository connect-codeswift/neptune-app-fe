"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { formatDocumentDisplayId } from "@/services/mappers/document-list.mapper";

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
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";
const crumbActive = "text8 text-ehs-gray";

const actionBaseClass =
  "text4 h-9 w-full rounded-2.5 px-3 sm:h-9.5 sm:w-auto sm:px-3";

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
        "rounded-4 backdrop-blur-2.5 before:rounded-4 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex flex-col gap-1.5 border-b px-3.5 py-3.5 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:content-[''] sm:px-5.5 sm:pt-3.5 sm:pb-3.5",
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
          className="text-ehs-muted-text size-2.75 shrink-0"
          aria-hidden="true"
        />
        <Link href="/dashboard/policy-maker" className={crumbMuted}>
          Documents
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-2.75 shrink-0"
          aria-hidden="true"
        />
        <span className={`${crumbActive} truncate`}>
          {formatDocumentDisplayId(document.id)}
        </span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker break-words">
            {document.title}
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            {`${formatDocumentDisplayId(document.id)} · ${document.documentKind} · ${document.version}`}
          </Text>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="tertiary"
            onClick={onEdit}
            className={`${actionBaseClass} border-ehs-border-ink/14 text-ehs-dark-bg border shadow-none`}
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
            className={`${actionBaseClass} border-ehs-border-ink/14 text-ehs-dark-bg col-span-1 border shadow-none min-[480px]:col-span-2 sm:col-auto`}
          >
            Version History
          </Button>
          {canApprove ? (
            <Button
              type="button"
              variant="tertiary"
              onClick={onApproval}
              disabled={isApproved || isApproving}
              className={`${actionBaseClass} bg-ehs-green! text-ehs-on-accent! hover:bg-ehs-green/90! border-transparent! shadow-none! disabled:opacity-70`}
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
              className={`${actionBaseClass} bg-ehs-blue! text-ehs-on-accent! hover:bg-ehs-blue/90! border-transparent! shadow-none!`}
            >
              Acknowledgment
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
