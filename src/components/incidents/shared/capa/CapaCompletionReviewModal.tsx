"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";
import {
  IncidentModalCancelButton,
  IncidentModalPrimaryButton,
  IncidentModalShell,
} from "@/components/incidents/shared/capa/IncidentModalShell";
import { FIELD_TEXTAREA_CLASS } from "@/components/ui/field-styles";
import type { CapaEffectiveness } from "@/dtos/req/capa-verification-request.dto";
import { useCapaReviewQuery } from "@/hooks/use-capa-queries";
import { formatCapaTaskStatusLabel } from "@/services/mappers/capa.mapper";

const EFFECTIVENESS_OPTIONS: readonly CapaEffectiveness[] = [
  "Effective",
  "Partially Effective",
  "Not Effective",
];

export type CapaCompletionReviewModalProps = Readonly<{
  capa: CapaItem;
  incidentId: string;
  incidentTitle: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onVerify: (input: {
    effectiveness: CapaEffectiveness;
    notes: string;
  }) => void | Promise<void>;
}>;

function DetailRow(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-ehs-muted-text text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-ehs-dark-bg text-sm leading-normal">{value}</span>
    </div>
  );
}

/**
 * Whether `next/image`'s optimizer can be pointed at this URL.
 *
 * `next.config.ts` lists only `res.cloudinary.com` under `images.remotePatterns`,
 * and attachment URLs arrive from the API rather than being constructed here.
 * An unlisted host makes the optimizer throw "Invalid src prop" — a 500, not a
 * broken image — so anything else falls back to `unoptimized`, which skips the
 * host check entirely.
 */
function isOptimizableImageUrl(url: string): boolean {
  try {
    return new URL(url).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

function attachmentKind(url: string): "image" | "pdf" | "file" {
  const lower = url.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(lower)) {
    return "image";
  }
  if (/\.pdf(\?|$)/.test(lower)) {
    return "pdf";
  }
  return "file";
}

export function CapaCompletionReviewModal(
  props: Readonly<CapaCompletionReviewModalProps>,
) {
  const {
    capa,
    incidentId,
    incidentTitle,
    isSubmitting = false,
    onClose,
    onVerify,
  } = props;

  const notesFieldId = useId();
  const reviewQuery = useCapaReviewQuery({
    capaId: capa.numericId,
    enabled: true,
  });

  const [effectiveness, setEffectiveness] =
    useState<CapaEffectiveness>("Effective");
  const [notes, setNotes] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hydratedVerificationKey, setHydratedVerificationKey] = useState<
    string | null
  >(null);

  const review = reviewQuery.data;
  const attachments = review?.attachments ?? [];
  const existingVerification = review?.verification;
  const verificationKey =
    existingVerification == null
      ? null
      : `${existingVerification.effectiveness}\0${existingVerification.notes}`;

  // Hydrate from the loaded verification record during render (not an effect).
  if (
    verificationKey != null &&
    verificationKey !== hydratedVerificationKey &&
    existingVerification
  ) {
    setHydratedVerificationKey(verificationKey);
    setNotes(existingVerification.notes ?? "");
    setEffectiveness(existingVerification.effectiveness ?? "Effective");
  }

  const isAlreadyVerified =
    capa.status === "Verified" ||
    capa.status === "Closed" ||
    existingVerification != null;
  const isBusy = isSubmitting || reviewQuery.isLoading;

  const handleVerify = async () => {
    try {
      await onVerify({ effectiveness, notes: notes.trim() });
    } catch {
      // The caller toasts the failure and re-throws to signal "stay open", so
      // there is nothing to report here — just don't close, and don't let the
      // rejection escape as an unhandled promise.
      return;
    }
    onClose();
  };

  return (
    <>
      <IncidentModalShell
        title={
          isAlreadyVerified
            ? "CAPA verification record"
            : "Review completed CAPA"
        }
        subtitle={`${incidentId} · ${incidentTitle} · ${capa.code}`}
        onClose={onClose}
        maxWidthClassName="max-w-190"
        footerHint={
          isAlreadyVerified
            ? "This CAPA has been verified and closed."
            : "Review assignee work, attachments, then verify and close."
        }
        footerActions={
          isAlreadyVerified ? (
            <IncidentModalCancelButton onClick={onClose} label="Close" />
          ) : (
            <>
              <IncidentModalCancelButton onClick={onClose} label="Later" />
              <IncidentModalPrimaryButton
                onClick={() => {
                  void handleVerify();
                }}
                disabled={isBusy}
                label={isBusy ? "Saving…" : "Verify & close"}
                icon=""
              />
            </>
          )
        }
      >
        {reviewQuery.isLoading ? (
          <div className="text-ehs-muted-text py-12 text-center text-sm">
            Loading completion details…
          </div>
        ) : reviewQuery.isError ? (
          <div className="text-ehs-red py-12 text-center text-sm">
            Could not load CAPA review details. Please try again.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <section className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Icon
                  icon="mdi:check-decagram"
                  className="text-ehs-green size-5"
                  aria-hidden="true"
                />
                <h3 className="text-ehs-dark-bg text-base font-semibold">
                  Assignee completion
                </h3>
              </div>
              <p className="text-ehs-dark-bg mb-4 text-sm leading-normal">
                {capa.description}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow label="Assigned to" value={capa.assignee} />
                <DetailRow label="Due date" value={capa.dueDate} />
                <DetailRow label="Control level" value={capa.controlCategory} />
                <DetailRow label="Type" value={capa.actionType} />
                <DetailRow
                  label="Assignee status"
                  value={formatCapaTaskStatusLabel(capa.taskStatus)}
                />
                <DetailRow label="Priority" value={capa.priority} />
              </div>
            </section>

            <section className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Icon
                  icon="mdi:paperclip"
                  className="text-ehs-normal-blue size-5"
                  aria-hidden="true"
                />
                <h3 className="text-ehs-dark-bg text-base font-semibold">
                  Attachments
                </h3>
              </div>
              {attachments.length === 0 ? (
                <p className="text-ehs-muted-text text-sm">
                  No attachments were uploaded for this CAPA.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {attachments.map((file) => {
                    const kind = attachmentKind(file.attachmentUrl);

                    return (
                      <li
                        key={`${file.attachmentUrl}-${file.attachmentTitle}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(15,23,42,0.06)] bg-white/80 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Icon
                            icon={
                              kind === "pdf"
                                ? "mdi:file-pdf-box"
                                : kind === "image"
                                  ? "mdi:file-image-outline"
                                  : "mdi:file-outline"
                            }
                            className="text-ehs-gray size-5 shrink-0"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="text-ehs-dark-bg truncate text-sm font-medium">
                              {file.attachmentTitle}
                            </p>
                            {file.size ? (
                              <p className="text-ehs-muted-text text-xs">
                                {file.size}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(file.attachmentUrl)}
                          className="text-ehs-normal-blue hover:text-ehs-normal-blue-active shrink-0 text-sm font-medium"
                        >
                          Preview
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {!isAlreadyVerified ? (
              <section className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/70 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Icon
                    icon="mdi:clipboard-check-outline"
                    className="text-ehs-normal-blue size-5"
                    aria-hidden="true"
                  />
                  <h3 className="text-ehs-dark-bg text-base font-semibold">
                    Manager verification
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-ehs-gray text-sm">Effectiveness</span>
                    <div className="flex flex-wrap gap-2">
                      {EFFECTIVENESS_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setEffectiveness(option)}
                          className={[
                            "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                            effectiveness === option
                              ? "bg-ehs-normal-blue text-ehs-light-text"
                              : "bg-ehs-gray/14 text-ehs-gray hover:bg-ehs-gray/20",
                          ].join(" ")}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={notesFieldId}
                      className="text-ehs-gray text-sm"
                    >
                      Verification notes
                    </label>
                    <textarea
                      id={notesFieldId}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={3}
                      placeholder="Document your review before closing this CAPA…"
                      className={FIELD_TEXTAREA_CLASS}
                    />
                  </div>
                </div>
              </section>
            ) : existingVerification ? (
              <section className="border-ehs-green/20 bg-ehs-green/5 rounded-xl border p-4">
                <DetailRow
                  label="Verified as"
                  value={existingVerification.effectiveness}
                />
                {existingVerification.notes ? (
                  <div className="mt-3">
                    <DetailRow
                      label="Notes"
                      value={existingVerification.notes}
                    />
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        )}
      </IncidentModalShell>

      {previewUrl ? (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => setPreviewUrl(null)}
            role="presentation"
          />
          <div className="relative z-10 max-h-[85vh] max-w-[90vw] overflow-hidden rounded-xl bg-black/80 p-2">
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 z-20 inline-flex size-9 items-center justify-center rounded-full bg-white/15 text-white"
              aria-label="Close preview"
            >
              <Icon icon="mdi:close" className="size-5" />
            </button>
            {attachmentKind(previewUrl) === "image" ? (
              // `fill` needs a parent with a definite size, so the preview is a
              // fixed viewport-sized box with the image contained inside it.
              <div className="relative h-[80vh] w-[85vw]">
                <Image
                  src={previewUrl}
                  alt="Attachment preview"
                  fill
                  sizes="85vw"
                  unoptimized={!isOptimizableImageUrl(previewUrl)}
                  className="object-contain"
                />
              </div>
            ) : attachmentKind(previewUrl) === "pdf" ? (
              <iframe
                src={previewUrl}
                title="Attachment preview"
                className="h-[80vh] w-[85vw] rounded-lg bg-white"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 px-8 py-12 text-white">
                <Icon icon="mdi:file-outline" className="size-12" />
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ehs-normal-blue text-sm underline"
                >
                  Open attachment
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
