"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import {
  HAZCOM_CHEMICALS,
  HazcomGlassCard,
  HazcomSelectField,
  HazcomTextareaField,
} from "@/components/hazcom/shared";
import {
  HAZCOM_LABEL_SIZES,
  type HazcomLabelSizeId,
} from "@/components/hazcom/labels/hazcom-label-constants";

export type HazcomLabelSettingsPanelProps = Readonly<{
  chemicalId: string;
  onChemicalIdChange: (chemicalId: string) => void;
  labelSizeId: HazcomLabelSizeId;
  onLabelSizeIdChange: (labelSizeId: HazcomLabelSizeId) => void;
  includeBarcode: boolean;
  onIncludeBarcodeChange: (includeBarcode: boolean) => void;
  includeQrCode: boolean;
  onIncludeQrCodeChange: (includeQrCode: boolean) => void;
  internalNote: string;
  onInternalNoteChange: (internalNote: string) => void;
  onPrint: () => void;
  className?: string;
}>;

type HazcomExtraCheckboxProps = Readonly<{
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}>;

function HazcomExtraCheckbox(props: Readonly<HazcomExtraCheckboxProps>) {
  const { id, label, checked, onChange } = props;

  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="border-ehs-border text-ehs-normal-blue focus:ring-ehs-normal-blue/20 size-4 shrink-0 rounded focus:ring-2"
      />
      <label
        htmlFor={id}
        className="text-ehs-gray cursor-pointer text-[13px]"
      >
        {label}
      </label>
    </div>
  );
}

export function HazcomLabelSettingsPanel(
  props: Readonly<HazcomLabelSettingsPanelProps>,
) {
  const {
    chemicalId,
    onChemicalIdChange,
    labelSizeId,
    onLabelSizeIdChange,
    includeBarcode,
    onIncludeBarcodeChange,
    includeQrCode,
    onIncludeQrCodeChange,
    internalNote,
    onInternalNoteChange,
    onPrint,
    className = "",
  } = props;

  return (
    <div
      className={["flex min-w-0 flex-col gap-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomGlassCard paddingClassName="p-5">
        <div className="flex flex-col gap-5">
          <Text as="h2" className="text-ehs-darker text-base font-bold">
            Label Settings
          </Text>

          <HazcomSelectField
            label="Chemical"
            value={chemicalId}
            onChange={(event) => onChemicalIdChange(event.target.value)}
            options={HAZCOM_CHEMICALS.map((chemical) => ({
              value: chemical.id,
              label: chemical.name,
            }))}
          />

          <div className="flex flex-col gap-1.5">
            <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
              Label Size
            </Text>
            <div
              className="flex flex-col gap-2"
              role="radiogroup"
              aria-label="Label Size"
            >
              <div className="grid grid-cols-4 gap-2">
                {HAZCOM_LABEL_SIZES.filter((size) => !size.fullWidth).map(
                  (size) => {
                    const isSelected = size.id === labelSizeId;

                    return (
                      <button
                        key={size.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onLabelSizeIdChange(size.id)}
                        className={[
                          "h-9 rounded-[10px] border text-[13px] font-bold transition-colors",
                          isSelected
                            ? "border-ehs-normal-blue bg-ehs-normal-blue-bg-light text-ehs-dark-blue"
                            : "border-ehs-border bg-white/62 text-ehs-gray hover:border-[rgba(15,23,42,0.18)]",
                        ].join(" ")}
                      >
                        {size.label}
                      </button>
                    );
                  },
                )}
              </div>
              {HAZCOM_LABEL_SIZES.filter((size) => size.fullWidth).map(
                (size) => {
                  const isSelected = size.id === labelSizeId;

                  return (
                    <button
                      key={size.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onLabelSizeIdChange(size.id)}
                      className={[
                        "h-9 w-full rounded-[10px] border text-[13px] font-bold transition-colors",
                        isSelected
                          ? "border-ehs-normal-blue bg-ehs-normal-blue-bg-light text-ehs-dark-blue"
                          : "border-ehs-border bg-white/62 text-ehs-gray hover:border-[rgba(15,23,42,0.18)]",
                      ].join(" ")}
                    >
                      {size.label}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
              Extras
            </Text>
            <HazcomExtraCheckbox
              id="hazcom-label-include-barcode"
              label="Include Barcode"
              checked={includeBarcode}
              onChange={onIncludeBarcodeChange}
            />
            <HazcomExtraCheckbox
              id="hazcom-label-include-qr"
              label="Include QR Code"
              checked={includeQrCode}
              onChange={onIncludeQrCodeChange}
            />
          </div>

          <HazcomTextareaField
            label="Internal Note (optional)"
            value={internalNote}
            onChange={(event) => onInternalNoteChange(event.target.value)}
            placeholder="Something for internal use only got it?"
          />
        </div>
      </HazcomGlassCard>

      <Button
        type="button"
        variant="primary"
        onClick={onPrint}
        className="w-full"
      >
        <Icon icon="mdi:printer-outline" className="size-4" aria-hidden="true" />
        Print Label
      </Button>

      <Button type="button" variant="tertiary" className="w-full">
        <Icon
          icon="mdi:tray-arrow-down"
          className="size-4"
          aria-hidden="true"
        />
        Export as PDF
      </Button>
    </div>
  );
}
