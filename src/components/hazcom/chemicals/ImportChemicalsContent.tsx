"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { UploadDocumentDropzone } from "@/components/policy-maker/upload/UploadDocumentDropzone";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { toast } from "@/lib/toast";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useBulkCreateChemicalsMutation } from "@/hooks/use-hazcom-mutations";
import { useChemicalCasLookup } from "@/hooks/use-hazcom-queries";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import {
  IMPORT_COLUMNS,
  MAX_IMPORT_ROWS,
  downloadImportTemplate,
  isSpreadsheet,
  parseChemicalImport,
  type ImportRow,
} from "./chemical-import";

const CHEMICALS_ROUTE = "/dashboard/hazcom/chemicals";

function validateSpreadsheet(file: File): string | null {
  if (!isSpreadsheet(file)) {
    return "Choose a .csv or .xlsx file.";
  }
  return null;
}

/**
 * Chemical inventory import: choose a file, read what it contains, then commit.
 *
 * The file never leaves the browser — it is parsed here and only the rows the
 * author accepts are sent, as ordinary JSON. Nothing is written until the
 * confirm button, so an unreadable or half-wrong file costs nothing.
 */
export function ImportChemicalsContent() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [rows, setRows] = useState<readonly ImportRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const importMutation = useBulkCreateChemicalsMutation();
  // CAS uniqueness: the existing register's CAS numbers, checked against each
  // imported row so the import doesn't silently create duplicates.
  const { casToId } = useChemicalCasLookup();
  // Held past the response: isPending drops when the rows are saved while the
  // navigation away is still in flight, and a second click in that gap would
  // import the file twice.
  const submitLock = useSubmitLock();

  const validRows = rows.filter((row) => row.errors.length === 0);
  const invalidCount = rows.length - validRows.length;

  const handleFileChange = async (next: File | null) => {
    setFile(next);
    setRows([]);
    setFileError(null);

    if (!next) return;

    setIsParsing(true);
    const existingCasNumbers = new Set(casToId.keys());
    const parsed = await parseChemicalImport(next, existingCasNumbers);
    setIsParsing(false);

    if (parsed.fatalError) {
      setFileError(parsed.fatalError);
      return;
    }

    setRows(parsed.rows);
  };

  const handleImport = () => {
    if (validRows.length === 0) return;
    if (!submitLock.acquire()) return;

    importMutation.mutate(
      validRows.map((row) => row.values),
      {
        onSuccess: () => {
          toast.success(
            "Chemicals imported",
            `${String(validRows.length)} ${validRows.length === 1 ? "chemical" : "chemicals"} added to the inventory.`,
          );
          router.push(CHEMICALS_ROUTE);
        },
        onError: (error) => {
          submitLock.release();
          toast.error(
            getMutationErrorMessage(error, "Failed to import the chemicals."),
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <IncidentGlassCard paddingClassName="p-5 md:p-5.5" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Text as="h2" className="text3 text-ehs-darker">
              Choose a file
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text mt-0.5">
              {`CSV or Excel, up to ${String(MAX_IMPORT_ROWS)} chemicals at a time. Nothing is saved until you confirm.`}
            </Text>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={downloadImportTemplate}
            className="text4 rounded-2.5 gap-2 px-4 py-2.5 font-medium"
          >
            <Icon icon="mdi:download-outline" className="size-3.5 shrink-0" />
            Download template
          </Button>
        </div>

        <UploadDocumentDropzone
          file={file}
          onFileChange={(next) => {
            void handleFileChange(next);
          }}
          error={fileError}
          isUploading={isParsing}
          accept=".csv,.xlsx"
          emptyHint={`Expected columns: ${IMPORT_COLUMNS.join(", ")}`}
          validateFile={validateSpreadsheet}
        />
      </IncidentGlassCard>

      {rows.length > 0 ? (
        <IncidentGlassCard paddingClassName="p-5 md:p-5.5" className="min-w-0">
          <Text as="h2" className="text3 text-ehs-darker">
            Review
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text mt-0.5 mb-3">
            {`${String(rows.length)} ${rows.length === 1 ? "row" : "rows"} read · ${String(validRows.length)} ready` +
              (invalidCount > 0 ? ` · ${String(invalidCount)} skipped` : "")}
          </Text>

          {/* Wide content scrolls inside its own box rather than the page. */}
          <div className="border-ehs-border-ink/8 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-160 border-collapse">
              <thead>
                <tr className="border-ehs-border-ink/8 border-b">
                  <th className="text6 text-ehs-muted-text w-12 px-3 py-2 text-left">
                    Row
                  </th>
                  <th className="text6 text-ehs-muted-text px-3 py-2 text-left">
                    Chemical
                  </th>
                  <th className="text6 text-ehs-muted-text px-3 py-2 text-left">
                    CAS #
                  </th>
                  <th className="text6 text-ehs-muted-text px-3 py-2 text-left">
                    Location
                  </th>
                  <th className="text6 text-ehs-muted-text px-3 py-2 text-left">
                    Quantity
                  </th>
                  <th className="text6 text-ehs-muted-text px-3 py-2 text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const failed = row.errors.length > 0;

                  return (
                    <tr
                      key={row.rowNumber}
                      className="border-ehs-border-ink/6 border-b last:border-b-0"
                    >
                      <td className="text8 text-ehs-muted-text px-3 py-2.5 align-top tabular-nums">
                        {row.rowNumber}
                      </td>
                      <td
                        className="px-3 py-2.5 align-top"
                        colSpan={failed ? 5 : 1}
                      >
                        <div className="flex items-start gap-2">
                          <Icon
                            icon={
                              failed
                                ? "mdi:close-circle-outline"
                                : "mdi:check-circle-outline"
                            }
                            className={[
                              "mt-0.5 size-4 shrink-0",
                              failed ? "text-ehs-red" : "text-ehs-green",
                            ].join(" ")}
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <Text as="p" className="text4 text-ehs-darker">
                              {row.values.chemi_Name || "—"}
                            </Text>
                            {failed ? (
                              <Text
                                as="p"
                                className="text8 text-ehs-red mt-0.5"
                              >
                                {row.errors.join(" · ")}
                              </Text>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      {failed ? null : (
                        <>
                          <td className="text4 text-ehs-slate px-3 py-2.5 align-top">
                            {row.values.caS_Number ?? "—"}
                          </td>
                          <td className="text4 text-ehs-slate px-3 py-2.5 align-top">
                            {row.values.location}
                          </td>
                          <td className="text4 text-ehs-slate px-3 py-2.5 align-top">
                            {row.values.currentQuantity}
                          </td>
                          <td className="text4 text-ehs-slate px-3 py-2.5 align-top">
                            {row.values.status ?? "Active"}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Link
              href={CHEMICALS_ROUTE}
              className="text4 rounded-2.5 text-ehs-slate hover:bg-ehs-surface border-ehs-border-ink/14 bg-ehs-surface/62 inline-flex h-9.75 items-center gap-1.75 border px-4 font-medium transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="button"
              variant="primary"
              onClick={handleImport}
              disabled={validRows.length === 0 || submitLock.isLocked}
              className="text4 rounded-2.5 gap-2 px-4 py-2.5 font-semibold"
            >
              <Icon
                icon="mdi:database-import-outline"
                className="size-3.5 shrink-0"
              />
              {submitLock.isLocked
                ? "Importing…"
                : `Import ${String(validRows.length)} ${validRows.length === 1 ? "chemical" : "chemicals"}`}
            </Button>
          </div>
        </IncidentGlassCard>
      ) : null}
    </div>
  );
}
