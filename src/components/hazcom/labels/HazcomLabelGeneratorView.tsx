"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import {
  HazcomEmptyCard,
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
} from "@/components/hazcom/shared";
import { HazcomLabelPreviewPanel } from "@/components/hazcom/labels/HazcomLabelPreviewPanel";
import { HazcomLabelSettingsPanel } from "@/components/hazcom/labels/HazcomLabelSettingsPanel";
import {
  HAZCOM_LABEL_DEFAULT_SIZE_ID,
  type HazcomLabelSizeId,
} from "@/components/hazcom/labels/hazcom-label-constants";
import { useChemicalsListQuery } from "@/hooks/use-hazcom-queries";

/**
 * The picker needs the whole inventory in one go — the endpoint has no search
 * param, so a large page stands in for one.
 */
const CHEMICAL_PICKER_PAGE_SIZE = 100;

const CHEMICAL_ADD_ROUTE = "/dashboard/hazcom/chemicals/new";

export function HazcomLabelGeneratorView() {
  const [chemicalId, setChemicalId] = useState("");
  const [labelSizeId, setLabelSizeId] = useState<HazcomLabelSizeId>(
    HAZCOM_LABEL_DEFAULT_SIZE_ID,
  );
  const [includeBarcode, setIncludeBarcode] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(false);
  const [internalNote, setInternalNote] = useState("");

  const {
    items: chemicals,
    isLoading,
    errorMessage,
    refetch,
  } = useChemicalsListQuery({
    pageNumber: 1,
    pageSize: CHEMICAL_PICKER_PAGE_SIZE,
  });

  // Nothing is selected until the inventory arrives, so the first row stands
  // in until the user picks.
  const selectedChemical =
    chemicals.find((chemical) => chemical.id === chemicalId) ?? chemicals[0];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5 px-3 pb-8 sm:px-4">
      {/* Tabs first, then the header — this view had them the other way round
          and was the only HazCom page where the module navigation sat below the
          page title, so the tab row jumped position when you arrived here. */}
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Label Generator"]}
        title="GHS Label Generator"
        subtitle="Generate compliant GHS container labels — pull data from SDS, preview, and print"
      />

      {errorMessage ? (
        <HazcomErrorCard
          title="Couldn’t load chemicals"
          message={errorMessage}
          onRetry={refetch}
        />
      ) : null}

      {!errorMessage && isLoading ? (
        <HazcomLoadingCard message="Loading chemicals…" />
      ) : null}

      {/* An empty inventory is a normal state, not a load failure — this used
          the error card, so a fresh site was greeted by a red alert glyph. */}
      {!errorMessage && !isLoading && !selectedChemical ? (
        <HazcomEmptyCard
          icon="mdi:label-off-outline"
          title="No chemicals to label"
          message="A GHS label is generated from a chemical record, so add one to the inventory first."
          action={
            <Link href={CHEMICAL_ADD_ROUTE}>
              <Button
                type="button"
                variant="primary"
                className="mt-1 rounded-lg px-4 py-2 text-[13px]"
              >
                <Icon
                  icon="mdi:plus"
                  className="text-base"
                  aria-hidden="true"
                />
                Add Chemical
              </Button>
            </Link>
          }
        />
      ) : null}

      {!errorMessage && !isLoading && selectedChemical ? (
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
          <HazcomLabelSettingsPanel
            chemicals={chemicals}
            chemicalId={selectedChemical.id}
            onChemicalIdChange={setChemicalId}
            labelSizeId={labelSizeId}
            onLabelSizeIdChange={setLabelSizeId}
            includeBarcode={includeBarcode}
            onIncludeBarcodeChange={setIncludeBarcode}
            includeQrCode={includeQrCode}
            onIncludeQrCodeChange={setIncludeQrCode}
            internalNote={internalNote}
            onInternalNoteChange={setInternalNote}
            onPrint={() => window.print()}
          />

          <HazcomLabelPreviewPanel
            chemical={selectedChemical}
            labelSizeId={labelSizeId}
            includeBarcode={includeBarcode}
            includeQrCode={includeQrCode}
            internalNote={internalNote}
          />
        </div>
      ) : null}
    </div>
  );
}
