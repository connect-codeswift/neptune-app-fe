"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_FIELD_LABEL_CLASS,
  HazcomFormLayout,
  HazcomPageHeader,
  HazcomPictogramChip,
  HazcomSelectField,
  HazcomTextField,
  type HazcomSignalWord,
  type HazcomStatementCode,
} from "@/components/hazcom/shared";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { UploadDocumentDropzone } from "@/components/policy-maker/upload/UploadDocumentDropzone";
import type { SafetyDataSheetRequestDto } from "@/dtos/req/hazcom-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateSdsMutation } from "@/hooks/use-hazcom-mutations";
import {
  useChemicalsListQuery,
  useHazardHCodesQuery,
  usePrecautionaryCodesQuery,
} from "@/hooks/use-hazcom-queries";
import {
  formatFileSize,
  getFileMaxBytes,
  isPdfMimeType,
} from "@/lib/files";
import { toast } from "@/lib/toast";
import { uploadFile } from "@/lib/upload-file";

const SDS_LIBRARY_ROUTE = "/dashboard/hazcom/sds";
const SDS_MAX_BYTES = getFileMaxBytes("HazCom");

/**
 * The chemical endpoint has no search param, so one large page stands in for
 * the whole inventory in the picker.
 */
const CHEMICAL_PICKER_PAGE_SIZE = 100;

const SIGNAL_WORD_OPTIONS: readonly HazcomSignalWord[] = ["Danger", "Warning"];

/** Marks the fields the product picker owns as read-only. */
const lockedFieldClass = "opacity-70";

function signalWordButtonClass(
  word: HazcomSignalWord,
  selected: boolean,
): string {
  if (word === "Danger") {
    return selected
      ? "border-ehs-red bg-ehs-red/15 text-ehs-red ring-2 ring-ehs-red/25"
      : "border-ehs-red/30 bg-ehs-red/5 text-ehs-red hover:bg-ehs-red/10";
  }

  return selected
    ? "border-ehs-yellow bg-ehs-yellow/15 text-ehs-yellow ring-2 ring-ehs-yellow/25"
    : "border-ehs-yellow/40 bg-white text-ehs-yellow hover:bg-ehs-yellow/10";
}

/** Builds the picker options from a GHS code library. */
function toCodeOptions(
  codes: readonly HazcomStatementCode[],
  isLoading: boolean,
): readonly { value: string; label: string }[] {
  return [
    {
      value: "",
      label: isLoading ? "Loading codes…" : "Select a statement…",
    },
    ...codes.map((entry) => ({
      value: entry.code,
      label: entry.text ? `${entry.code} — ${entry.text}` : entry.code,
    })),
  ];
}

export function SdsUploadPageClient() {
  const router = useRouter();
  const createSds = useCreateSdsMutation();

  // The full inventory rows, not just names: the picker fills CAS, hazard
  // class, signal word and pictograms straight from the chosen chemical, so
  // the sheet can't contradict the record it documents.
  const { items: chemicals, isLoading: isLoadingChemicals } =
    useChemicalsListQuery({
      pageNumber: 1,
      pageSize: CHEMICAL_PICKER_PAGE_SIZE,
    });
  const { codes: hazardCodes, isLoading: isLoadingHazardCodes } =
    useHazardHCodesQuery();
  const { codes: precautionaryCodes, isLoading: isLoadingPrecautionaryCodes } =
    usePrecautionaryCodesQuery();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  /** Cloudinary URL of the uploaded sheet; "" until one lands. */
  const [pdfUrl, setPdfUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  /**
   * The product a sheet documents is always a chemical already in the
   * inventory, so this one picker drives the whole GHS block below: the
   * product name, the `chemicalId` link, and every field the chemical record
   * already answers.
   */
  const [chemicalId, setChemicalId] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [revisionDate, setRevisionDate] = useState("");
  const [version, setVersion] = useState("");
  const [hazardStatementCode, setHazardStatementCode] = useState("");
  const [precautionaryStatementCode, setPrecautionaryStatementCode] =
    useState("");
  const [disposeLocation, setDisposeLocation] = useState("");

  const chemicalOptions = useMemo(
    () => [
      {
        value: "",
        label: isLoadingChemicals ? "Loading chemicals…" : "Select a chemical…",
      },
      ...chemicals.map((chemical) => ({
        value: chemical.id,
        label: chemical.name,
      })),
    ],
    [chemicals, isLoadingChemicals],
  );

  const selectedChemical = chemicals.find(
    (chemical) => chemical.id === chemicalId,
  );

  /**
   * Everything the inventory already knows is derived from the selection
   * rather than kept in state, so these fields can't drift out of step with
   * the chemical record — they are display-only in the form below.
   */
  const productName = selectedChemical?.name ?? "";
  const casNumber = selectedChemical?.casNumber ?? "";
  const hazardClass = selectedChemical?.hazardClass ?? "";
  const signalWord = selectedChemical?.signalWord ?? null;
  const selectedPictograms = selectedChemical?.pictograms ?? [];

  const hazardOptions = useMemo(
    () => toCodeOptions(hazardCodes, isLoadingHazardCodes),
    [hazardCodes, isLoadingHazardCodes],
  );
  const precautionaryOptions = useMemo(
    () => toCodeOptions(precautionaryCodes, isLoadingPrecautionaryCodes),
    [precautionaryCodes, isLoadingPrecautionaryCodes],
  );

  /**
   * The record stores a URL, so the PDF goes to Cloudinary as soon as it is
   * picked — the same path the incident and document uploads take.
   * MIME / size checks live on `UploadDocumentDropzone`.
   */
  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPdfUrl("");
      return;
    }

    // Enforced here rather than on the input: `accept` only filters the file
    // picker, so a drag-and-drop bypassed both constraints entirely and the
    // "PDF up to 50 MB" the dropzone promises went unchecked.
    if (!isPdfMimeType(file.type)) {
      toast.error("Unsupported file", "Safety data sheets must be PDF files.");
      return;
    }

    if (file.size > SDS_MAX_BYTES) {
      toast.error(
        "File too large",
        `${formatFileSize(file.size)} exceeds the ${formatFileSize(SDS_MAX_BYTES)} limit.`,
      );
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const uploaded = await uploadFile(file, { module: "HazCom" });
      setPdfUrl(uploaded.fileId);
    } catch (error) {
      setSelectedFile(null);
      setPdfUrl("");
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload the PDF. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const buildRequest = (isDraft: boolean): SafetyDataSheetRequestDto => ({
    chemicalId: chemicalId === "" ? null : Number(chemicalId),
    pdfUrl,
    productName,
    manufacturer: manufacturer.trim(),
    casNumber: casNumber.trim(),
    hazardClass: hazardClass.trim(),
    disposeLocation: disposeLocation.trim() || null,
    signalWord: signalWord ?? "",
    // A plain date in the UI, a date-time on the wire.
    revisionDate:
      revisionDate === "" ? null : new Date(revisionDate).toISOString(),
    version: version.trim(),
    // One string, not a list.
    ghsPictograms: selectedPictograms.join(", "),
    hazardStatement: hazardStatementCode,
    precautionaryStatement: precautionaryStatementCode,
    isDraft,
  });

  const save = (isDraft: boolean) => {
    if (isUploading) {
      toast.error("Wait for the PDF upload to finish");
      return;
    }

    // The three fields the API requires. Statements are not asterisked in the
    // form but are `minLength: 1` on the wire, so a blank one 400s.
    const missing =
      productName === ""
        ? "Product"
        : hazardStatementCode === ""
          ? "Hazard Statements (Section 2)"
          : precautionaryStatementCode === ""
            ? "Precautionary Statements (Section 2)"
            : null;

    if (missing !== null) {
      toast.error(`${missing} is required`);
      return;
    }

    createSds.mutate(buildRequest(isDraft), {
      onSuccess: () => {
        toast.success(isDraft ? "SDS saved as draft" : "SDS record saved");
        router.push(SDS_LIBRARY_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not save the SDS record. Please try again.",
          ),
        );
      },
    });
  };

  const isBusy = isUploading || createSds.isPending;

  return (
    <HazcomFormLayout>
      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "SDS Library", "Upload"]}
        title="Upload Safety Data Sheet"
        subtitle="Upload a PDF and enter GHS metadata for the SDS record"
      />

      <IncidentGlassCard
        paddingClassName="p-6 sm:p-8"
        incidentGlassCardClassName="gap-6"
        className="w-full"
      >
        <UploadDocumentDropzone
          file={selectedFile}
          isUploading={isBusy}
          uploadedLabel={pdfUrl ? "Uploaded to library storage" : null}
          emptyHint={`PDF — Max ${formatFileSize(SDS_MAX_BYTES)}`}
          onFileChange={(file) => void handleFileChange(file)}
        />

        <div className="flex flex-col gap-4">
          <Text as="h2" className="text3 text-ehs-darker">
            GHS Metadata
          </Text>

          <HazcomSelectField
            label="Product"
            required
            hint="Fills the fields below from the chemical record"
            options={chemicalOptions}
            value={chemicalId}
            onChange={(event) => {
              const nextId = event.target.value;
              setChemicalId(nextId);
              const nextChemical = chemicals.find(
                (chemical) => chemical.id === nextId,
              );
              setDisposeLocation(nextChemical?.disposeLocation ?? "");
            }}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HazcomTextField
              label="Manufacturer"
              placeholder="e.g. Sigma-Aldrich"
              value={manufacturer}
              onChange={(event) => setManufacturer(event.target.value)}
              // Nothing sits beside it until a product fills in the CAS.
              className={selectedChemical ? "" : "sm:col-span-2"}
            />
            {selectedChemical ? (
              <HazcomTextField
                label="CAS Number"
                readOnly
                trailingHint="From chemical"
                value={casNumber}
                className={lockedFieldClass}
              />
            ) : null}
          </div>

          {/*
            The fields the chemical record answers stay hidden until there is
            a record to answer them — an empty locked input reads as broken.
          */}
          {selectedChemical ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <HazcomTextField
                label="Hazard Class"
                readOnly
                trailingHint="From chemical"
                value={hazardClass}
                className={lockedFieldClass}
              />
              <HazcomTextField
                label="Dispose Location"
                trailingHint="Optional — max 250 chars"
                placeholder="e.g. Hazardous waste drum — Bay 3"
                value={disposeLocation}
                onChange={(event) => setDisposeLocation(event.target.value)}
                maxLength={250}
              />

              <div
                className={`flex flex-col gap-1.5 sm:col-span-2 ${lockedFieldClass}`}
              >
                <div className="flex min-h-7 flex-wrap items-end gap-1.5">
                  <Text
                    as="span"
                    className={HAZCOM_FIELD_LABEL_CLASS}
                  >
                    Signal Word
                  </Text>
                  <Text
                    as="span"
                    className="text8 text-ehs-muted-text ml-auto"
                  >
                    From chemical
                  </Text>
                </div>
                <div className="flex gap-2">
                  {SIGNAL_WORD_OPTIONS.map((word) => {
                    const selected = signalWord === word;

                    return (
                      <span
                        key={word}
                        aria-hidden={!selected}
                        className={[
                          "text5 flex h-9 flex-1 items-center justify-center rounded-2.5 border uppercase",
                          signalWordButtonClass(word, selected),
                        ].join(" ")}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HazcomTextField
              label="Revision Date"
              type="date"
              value={revisionDate}
              onChange={(event) => setRevisionDate(event.target.value)}
            />
            <HazcomTextField
              label="Version"
              placeholder="e.g. v4.1"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
            />
          </div>

          {selectedChemical ? (
            <div className={`flex flex-col gap-1.5 ${lockedFieldClass}`}>
              <div className="flex min-h-7 flex-wrap items-end gap-1.5">
                <Text
                  as="span"
                  className={HAZCOM_FIELD_LABEL_CLASS}
                >
                  GHS Pictograms
                </Text>
                <Text
                  as="span"
                  className="text8 text-ehs-muted-text ml-auto"
                >
                  From chemical
                </Text>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPictograms.length === 0 ? (
                  <Text as="p" className="text4 text-ehs-muted-text">
                    This chemical has no pictograms recorded.
                  </Text>
                ) : (
                  selectedPictograms.map((pictogram) => (
                    <HazcomPictogramChip
                      key={pictogram}
                      pictogram={pictogram}
                      selected
                    />
                  ))
                )}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HazcomSelectField
              label="Hazard Statements (Section 2)"
              required
              options={hazardOptions}
              value={hazardStatementCode}
              onChange={(event) => setHazardStatementCode(event.target.value)}
            />
            <HazcomSelectField
              label="Precautionary Statements (Section 2)"
              required
              options={precautionaryOptions}
              value={precautionaryStatementCode}
              onChange={(event) =>
                setPrecautionaryStatementCode(event.target.value)
              }
            />
          </div>
        </div>

        <div className="border-ehs-border flex items-center justify-between border-t pt-5">
          <Link href={SDS_LIBRARY_ROUTE}>
            <Button type="button" variant="tertiary">
              <Icon
                icon="mdi:arrow-left"
                className="size-4"
                aria-hidden="true"
              />
              Cancel
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isBusy}
              onClick={() => save(true)}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={createSds.isPending}
              disabled={isUploading}
              onClick={() => save(false)}
            >
              <Icon
                icon="mdi:tray-arrow-up"
                className="size-4"
                aria-hidden="true"
              />
              {createSds.isPending ? "Saving…" : "Save SDS Record"}
            </Button>
          </div>
        </div>
      </IncidentGlassCard>
    </HazcomFormLayout>
  );
}
