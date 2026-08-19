"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  HAZCOM_FIELD_LABEL_CLASS,
  HazcomSelectField,
  HazcomTextareaField,
  type HazcomChemical,
} from "@/components/hazcom/shared";
import {
  HAZCOM_LABEL_SIZES,
  type HazcomLabelSizeId,
} from "@/components/hazcom/labels/hazcom-label-constants";

export type HazcomLabelSettingsPanelProps = Readonly<{
  /** Inventory rows to choose from — loaded from the chemical endpoint. */
  chemicals: readonly HazcomChemical[];
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
      <label htmlFor={id} className="text4 text-ehs-gray cursor-pointer">
        {label}
      </label>
    </div>
  );
}

export function HazcomLabelSettingsPanel(
  props: Readonly<HazcomLabelSettingsPanelProps>,
) {
  const {
    chemicals,
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
      <IncidentGlassCard paddingClassName="p-5">
        <div className="flex flex-col gap-5">
          <Text as="h2" className="text3 text-ehs-darker">
            Label Settings
          </Text>

          <HazcomSelectField
            label="Chemical"
            value={chemicalId}
            onChange={(event) => onChemicalIdChange(event.target.value)}
            options={chemicals.map((chemical) => ({
              value: chemical.id,
              label: chemical.name,
            }))}
          />

          <div className="flex flex-col gap-1.5">
            <Text as="span" className={HAZCOM_FIELD_LABEL_CLASS}>
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
                          "rounded-2.5 h-9 border transition-colors",
                          isSelected
                            ? "border-ehs-normal-blue bg-ehs-normal-blue-bg-light text5 text-ehs-dark-blue"
                            : "border-ehs-border-ink/18 text4 text-ehs-gray bg-ehs-surface/62 hover:border-ehs-border-strong",
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
                        "rounded-2.5 h-9 w-full border transition-colors",
                        isSelected
                          ? "border-ehs-normal-blue bg-ehs-normal-blue-bg-light text5 text-ehs-dark-blue"
                          : "border-ehs-border-ink/18 text4 text-ehs-gray bg-ehs-surface/62 hover:border-ehs-border-strong",
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
            <Text as="span" className={HAZCOM_FIELD_LABEL_CLASS}>
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
      </IncidentGlassCard>

      <Button
        type="button"
        variant="primary"
        onClick={onPrint}
        className="w-full"
      >
        <Icon
          icon="mdi:printer-outline"
          className="size-4"
          aria-hidden="true"
        />
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
