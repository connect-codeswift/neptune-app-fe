"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_CHEMICALS,
  HAZCOM_PICTOGRAMS,
  HazcomGlassCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPictogramChip,
  HazcomSelectField,
  HazcomTextField,
  type HazcomPictogram,
  type HazcomSignalWord,
} from "@/components/hazcom/shared";
import { SdsUploadDropzone } from "@/components/hazcom/sds/SdsUploadDropzone";

const STATEMENT_PLACEHOLDER_OPTION = { value: "", label: "Select a statement…" };

function buildStatementOptions(
  pick: "hazardStatements" | "precautionaryStatements",
): readonly { value: string; label: string }[] {
  const seen = new Map<string, string>();

  HAZCOM_CHEMICALS.forEach((chemical) => {
    chemical[pick].forEach((statement) => {
      if (!seen.has(statement.code)) {
        seen.set(statement.code, `${statement.code} — ${statement.text}`);
      }
    });
  });

  return [STATEMENT_PLACEHOLDER_OPTION, ...Array.from(seen, ([value, label]) => ({ value, label }))];
}

const HAZARD_STATEMENT_OPTIONS = buildStatementOptions("hazardStatements");
const PRECAUTIONARY_STATEMENT_OPTIONS = buildStatementOptions(
  "precautionaryStatements",
);

const SIGNAL_WORD_OPTIONS: readonly HazcomSignalWord[] = ["Danger", "Warning"];

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

export function SdsUploadPageClient() {
  const router = useRouter();

  const [fileName, setFileName] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [casNumber, setCasNumber] = useState("");
  const [hazardClass, setHazardClass] = useState("");
  const [signalWord, setSignalWord] = useState<HazcomSignalWord | null>(null);
  const [revisionDate, setRevisionDate] = useState("");
  const [version, setVersion] = useState("");
  const [selectedPictograms, setSelectedPictograms] = useState<
    readonly HazcomPictogram[]
  >([]);
  const [hazardStatementCode, setHazardStatementCode] = useState("");
  const [precautionaryStatementCode, setPrecautionaryStatementCode] =
    useState("");

  const togglePictogram = (pictogram: HazcomPictogram) => {
    setSelectedPictograms((current) =>
      current.includes(pictogram)
        ? current.filter((item) => item !== pictogram)
        : [...current, pictogram],
    );
  };

  const handleDone = () => {
    router.push("/hazcom/sds");
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col gap-4 px-3 pt-4 pb-8 sm:px-4">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "SDS Library", "Upload"]}
        title="Upload Safety Data Sheet"
        subtitle="Upload a PDF and enter GHS metadata for the SDS record"
      />

      <HazcomGlassCard
        paddingClassName="p-6"
        hazcomGlassCardClassName="gap-6"
        className="mx-auto w-full max-w-3xl"
      >
        <SdsUploadDropzone fileName={fileName} onFileNameChange={setFileName} />

        <div className="flex flex-col gap-4">
          <Text as="h2" className="text-ehs-darker text-[15px] font-bold">
            GHS Metadata
          </Text>

          <HazcomTextField
            label="Product Name"
            required
            placeholder="Full product name from SDS Section 1"
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HazcomTextField
              label="Manufacturer"
              required
              placeholder="e.g. Sigma-Aldrich"
              value={manufacturer}
              onChange={(event) => setManufacturer(event.target.value)}
            />
            <HazcomTextField
              label="CAS Number"
              placeholder="e.g. 7647-01-0"
              value={casNumber}
              onChange={(event) => setCasNumber(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HazcomTextField
              label="Hazard Class"
              value={hazardClass}
              onChange={(event) => setHazardClass(event.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
                Signal Word
              </Text>
              <div className="flex gap-2">
                {SIGNAL_WORD_OPTIONS.map((word) => {
                  const selected = signalWord === word;

                  return (
                    <button
                      key={word}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setSignalWord((current) =>
                          current === word ? null : word,
                        )
                      }
                      className={[
                        "h-9 flex-1 rounded-[10px] border text-[13px] font-bold tracking-[0.4px] uppercase transition-colors",
                        signalWordButtonClass(word, selected),
                      ].join(" ")}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

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

          <div className="flex flex-col gap-1.5">
            <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
              GHS Pictograms
            </Text>
            <div className="flex flex-wrap gap-2">
              {HAZCOM_PICTOGRAMS.map((pictogram) => (
                <HazcomPictogramChip
                  key={pictogram}
                  pictogram={pictogram}
                  selected={selectedPictograms.includes(pictogram)}
                  onToggle={() => togglePictogram(pictogram)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HazcomSelectField
              label="Hazard Statements (Section 2)"
              options={HAZARD_STATEMENT_OPTIONS}
              value={hazardStatementCode}
              onChange={(event) => setHazardStatementCode(event.target.value)}
            />
            <HazcomSelectField
              label="Precautionary Statements (Section 2)"
              options={PRECAUTIONARY_STATEMENT_OPTIONS}
              value={precautionaryStatementCode}
              onChange={(event) =>
                setPrecautionaryStatementCode(event.target.value)
              }
            />
          </div>
        </div>

        <div className="border-ehs-border flex items-center justify-between border-t pt-5">
          <Link href="/hazcom/sds">
            <Button type="button" variant="tertiary">
              <Icon icon="mdi:arrow-left" className="text-base" aria-hidden="true" />
              Cancel
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={handleDone}>
              Save as Draft
            </Button>
            <Button type="button" variant="primary" onClick={handleDone}>
              <Icon
                icon="mdi:tray-arrow-up"
                className="text-base"
                aria-hidden="true"
              />
              Save SDS Record
            </Button>
          </div>
        </div>
      </HazcomGlassCard>
    </div>
  );
}
