"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Can } from "@/components/auth/Can";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSaveLotoCertificationMutation } from "@/hooks/use-loto-mutations";
import { useLotoPersonnelQuery } from "@/hooks/use-loto-queries";
import { uploadFile } from "@/lib/upload-file";
import { toast } from "@/lib/toast";
import type { LotoPersonnel } from "@/app/dashboard/lockout-tagout/loto-data";

export type LotoCertificationPanelProps = Readonly<{
  /** The people currently picked in Authorized Personnel. */
  personnel: readonly { userId: number; name: string }[];
  enabled?: boolean;
  className?: string;
}>;

/** `2026-09-11T00:00:00.000Z` → `2026-09-11`, which is what a date input wants. */
function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

/** A date input gives back `2026-09-11`; the API wants an instant with an offset. */
function toInstant(value: string): string | null {
  return value ? `${value}T00:00:00.000Z` : null;
}

function CertificationRow(
  props: Readonly<{
    userId: number;
    name: string;
    existing: LotoPersonnel | undefined;
  }>,
) {
  const { userId, name, existing } = props;

  const [certifiedAt, setCertifiedAt] = useState(() =>
    toDateInputValue(existing?.certifiedAt ?? null),
  );
  const [expiresAt, setExpiresAt] = useState(() =>
    toDateInputValue(existing?.expiresAt ?? null),
  );
  const [fileId, setFileId] = useState(existing?.attachmentFileId ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const save = useSaveLotoCertificationMutation();

  // Caught here rather than left to the API so the message names the two fields the person is
  // looking at. The API refuses it too — this is the faster half of the same rule.
  const datesInverted =
    certifiedAt !== "" && expiresAt !== "" && expiresAt < certifiedAt;

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadFile(file, { module: "Loto" });
      setFileId(result.fileId);
      setFileName(file.name);
    } catch (error) {
      toast.error(
        "Could not upload the certificate",
        getMutationErrorMessage(error, "Please try again."),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await save.mutateAsync({
        userId,
        certifiedAt: toInstant(certifiedAt),
        expiresAt: toInstant(expiresAt),
        attachmentFileId: fileId,
      });
      toast.success(
        "Certification saved",
        `Training dates recorded for ${name}.`,
      );
    } catch (error) {
      toast.error(
        "Could not save the certification",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  };

  return (
    <div className="border-ehs-border-ink/8 flex flex-col gap-2 border-b py-3 last:border-b-0">
      <Text as="p" className="text4 text-ehs-darker font-medium">
        {name}
      </Text>

      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1">
          <span className="text9 text-ehs-muted-text">Certified on</span>
          <input
            type="date"
            value={certifiedAt}
            onChange={(event) => setCertifiedAt(event.target.value)}
            className={FIELD_INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text9 text-ehs-muted-text">Expires on</span>
          <input
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            className={FIELD_INPUT_CLASS}
          />
        </label>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={save.isPending || isUploading || datesInverted}
          className="bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-active rounded-2.5 text5 inline-flex h-9 items-center gap-2 px-3.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text5 inline-flex cursor-pointer items-center gap-1.5">
          <Icon icon="mdi:paperclip" className="size-3.5" aria-hidden="true" />
          {isUploading
            ? "Uploading…"
            : fileId
              ? "Replace certificate"
              : "Attach certificate"}
          <input
            type="file"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              // Cleared so picking the same file twice still fires a change.
              event.target.value = "";
              if (file) void handleUpload(file);
            }}
          />
        </label>

        {fileId ? (
          <Text as="span" className="text8 text-ehs-muted-text">
            {fileName ?? "Certificate on file"}
          </Text>
        ) : null}
      </div>

      {datesInverted ? (
        <Text as="p" className="text8 text-ehs-red">
          The expiry cannot be earlier than the certified date.
        </Text>
      ) : null}
    </div>
  );
}

/**
 * LOTO training dates for the people picked in Authorized Personnel.
 *
 * Sits here because this is where someone is already deciding who may work on the machine, and
 * asking them to leave for the Personnel register to record a date is how the register stayed
 * empty. Each row saves on its own rather than riding on the procedure's submit: the endpoint is
 * keyed on the user, so it is not part of this equipment's payload and a failed save should not
 * take the procedure with it.
 *
 * Gated on `Loto.Update`, which is what `PUT /loto/personnel/certification` requires.
 */
export function LotoCertificationPanel(
  props: Readonly<LotoCertificationPanelProps>,
) {
  const { personnel, enabled = true, className = "" } = props;

  const personnelQuery = useLotoPersonnelQuery(enabled && personnel.length > 0);
  const existingByUserId = new Map(
    (personnelQuery.data ?? []).map((row) => [row.id, row]),
  );

  if (personnel.length === 0) {
    return null;
  }

  return (
    <Can do="Loto.Update">
      <div
        className={["border-ehs-border-ink/8 mt-4 border-t pt-4", className]
          .filter(Boolean)
          .join(" ")}
      >
        <Text as="h3" className="text4 text-ehs-darker mb-1 font-semibold">
          LOTO Certification
        </Text>
        {/* Said plainly because the panel sits inside a procedure editor and the record is not
            scoped to it — editing here changes what every machine sees. */}
        <Text as="p" className="text8 text-ehs-muted-text mb-1">
          Training dates apply to the person across all equipment, not just this
          procedure.
        </Text>

        {/* Rows are held back until the existing dates have arrived. Each row seeds its inputs
            from `existing` with useState, which only reads its argument on the first render — so
            mounting them early left a person with a saved certification showing empty fields, and
            saving would then have wiped the dates. */}
        {personnelQuery.isPending ? (
          <Text as="p" className="text8 text-ehs-muted-text py-3">
            Loading certification dates…
          </Text>
        ) : (
          <div className="flex flex-col">
            {personnel.map((person) => (
              <CertificationRow
                key={person.userId}
                userId={person.userId}
                name={person.name}
                existing={existingByUserId.get(person.userId)}
              />
            ))}
          </div>
        )}
      </div>
    </Can>
  );
}
