"use client";

import { useMemo, useState } from "react";
import {
  findHazcomChemical,
  HAZCOM_CHEMICALS,
  HazcomModuleTabs,
  HazcomPageHeader,
} from "@/components/hazcom/shared";
import { HazcomLabelPreviewPanel } from "@/components/hazcom/labels/HazcomLabelPreviewPanel";
import { HazcomLabelSettingsPanel } from "@/components/hazcom/labels/HazcomLabelSettingsPanel";
import {
  HAZCOM_LABEL_DEFAULT_SIZE_ID,
  type HazcomLabelSizeId,
} from "@/components/hazcom/labels/hazcom-label-constants";

const DEFAULT_CHEMICAL_ID = HAZCOM_CHEMICALS[0].id;

export function HazcomLabelGeneratorView() {
  const [chemicalId, setChemicalId] = useState(DEFAULT_CHEMICAL_ID);
  const [labelSizeId, setLabelSizeId] = useState<HazcomLabelSizeId>(
    HAZCOM_LABEL_DEFAULT_SIZE_ID,
  );
  const [includeBarcode, setIncludeBarcode] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(false);
  const [internalNote, setInternalNote] = useState("");

  const selectedChemical = useMemo(
    () => findHazcomChemical(chemicalId) ?? HAZCOM_CHEMICALS[0],
    [chemicalId],
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5 px-3 pb-8 sm:px-4">
      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Label Generator"]}
        title="GHS Label Generator"
        subtitle="Generate compliant GHS container labels — pull data from SDS, preview, and print"
      />

      <HazcomModuleTabs />

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <HazcomLabelSettingsPanel
          chemicalId={chemicalId}
          onChemicalIdChange={setChemicalId}
          labelSizeId={labelSizeId}
          onLabelSizeIdChange={setLabelSizeId}
          includeBarcode={includeBarcode}
          onIncludeBarcodeChange={setIncludeBarcode}
          includeQrCode={includeQrCode}
          onIncludeQrCodeChange={setIncludeQrCode}
          internalNote={internalNote}
          onInternalNoteChange={setInternalNote}
          onPrint={handlePrint}
        />

        <HazcomLabelPreviewPanel
          chemical={selectedChemical}
          labelSizeId={labelSizeId}
          includeBarcode={includeBarcode}
          includeQrCode={includeQrCode}
          internalNote={internalNote}
        />
      </div>
    </div>
  );
}
