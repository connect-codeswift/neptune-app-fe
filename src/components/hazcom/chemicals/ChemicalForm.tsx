"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_PICTOGRAMS,
  HazcomGlassCard,
  HazcomPictogramChip,
  HazcomSelectField,
  HazcomTextField,
  HazcomTextareaField,
  hazcomFieldInputClass,
  type HazcomChemical,
  type HazcomPictogram,
  type HazcomSignalWord,
} from "@/components/hazcom/shared";
import { splitQuantity } from "@/components/hazcom/chemicals/chemical-utils";

export type ChemicalFormProps = Readonly<{
  mode: "add" | "edit";
  chemical?: HazcomChemical;
  className?: string;
}>;

const STATUS_OPTIONS = [
  { value: "", label: "Select status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
] as const;

export function ChemicalForm(props: Readonly<ChemicalFormProps>) {
  const { mode, chemical, className = "" } = props;
  const router = useRouter();
  const initialQuantity = chemical
    ? splitQuantity(chemical.quantity)
    : { amount: "", unit: "" };

  const [name, setName] = useState(chemical?.name ?? "");
  const [casNumber, setCasNumber] = useState(chemical?.casNumber ?? "");
  const [hazardClass, setHazardClass] = useState(chemical?.hazardClass ?? "");
  const [location, setLocation] = useState(chemical?.location ?? "");
  const [quantityAmount, setQuantityAmount] = useState(initialQuantity.amount);
  const [quantityUnit, setQuantityUnit] = useState(initialQuantity.unit);
  const [signalWord, setSignalWord] = useState<HazcomSignalWord>(
    chemical?.signalWord ?? "Danger",
  );
  const [sdsLink, setSdsLink] = useState(chemical?.sdsFileName ?? "");
  const [status, setStatus] = useState(chemical?.status ?? "");
  const [pictograms, setPictograms] = useState<readonly HazcomPictogram[]>(
    chemical?.pictograms ?? [],
  );
  const [notes, setNotes] = useState(chemical?.storageNotes ?? "");

  function togglePictogram(pictogram: HazcomPictogram) {
    setPictograms((current) =>
      current.includes(pictogram)
        ? current.filter((item) => item !== pictogram)
        : [...current, pictogram],
    );
  }

  const cancelHref =
    mode === "edit" && chemical
      ? `/dashboard/hazcom/chemicals/${chemical.id}`
      : "/dashboard/hazcom/chemicals";
  const primaryLabel = mode === "add" ? "Add Chemical" : "Save Changes";

  /**
   * Persistence is out of scope for this module — the inventory is static mock
   * data. The save actions still route distinctly so they are not silently
   * identical to Cancel: a submit returns to the record, a draft returns to the
   * inventory list.
   */
  function handleSubmit() {
    router.push(cancelHref);
  }

  function handleSaveDraft() {
    router.push("/dashboard/hazcom/chemicals");
  }

  return (
    <HazcomGlassCard
      paddingClassName="p-6"
      className={["w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <HazcomTextField
            label="Chemical / Substance Name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Hydrochloric Acid"
            className="sm:col-span-2"
          />

          <HazcomTextField
            label="CAS Number"
            value={casNumber}
            onChange={(event) => setCasNumber(event.target.value)}
            placeholder="e.g. 7647-01-0"
          />
          <HazcomTextField
            label="Hazard Class"
            required
            value={hazardClass}
            onChange={(event) => setHazardClass(event.target.value)}
            placeholder="e.g. Corrosive"
          />

          <HazcomTextField
            label="Location / Work Area"
            required
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Lab 1 - Room 131"
          />
          <QuantityField
            amount={quantityAmount}
            unit={quantityUnit}
            onAmountChange={setQuantityAmount}
            onUnitChange={setQuantityUnit}
          />

          <SignalWordField value={signalWord} onChange={setSignalWord} />
          <HazcomTextField
            label="Link to SDS Record"
            value={sdsLink}
            onChange={(event) => setSdsLink(event.target.value)}
            placeholder="e.g. SDS_Hydrochloric_Acid_Rev2026.pdf"
          />

          <HazcomSelectField
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={STATUS_OPTIONS}
          />

          <div className="flex flex-col gap-2.5 sm:col-span-2">
            <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
              GHS Pictograms
            </Text>
            <div className="flex flex-wrap gap-2">
              {HAZCOM_PICTOGRAMS.map((pictogram) => (
                <HazcomPictogramChip
                  key={pictogram}
                  pictogram={pictogram}
                  selected={pictograms.includes(pictogram)}
                  onToggle={() => togglePictogram(pictogram)}
                />
              ))}
            </div>
          </div>

          <HazcomTextareaField
            label="Additional Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Storage conditions, special handling instructions, etc."
            className="sm:col-span-2"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)] pt-5">
          <Link href={cancelHref}>
            <Button
              type="button"
              variant="tertiary"
              className="rounded-lg px-4 py-2 text-[13px]"
            >
              <Icon icon="mdi:arrow-left" className="text-base" aria-hidden="true" />
              Cancel
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg px-4 py-2 text-[13px]"
              onClick={handleSaveDraft}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              className="rounded-lg px-5 py-2 text-[13px]"
              onClick={handleSubmit}
            >
              {primaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </HazcomGlassCard>
  );
}

type QuantityFieldProps = Readonly<{
  amount: string;
  unit: string;
  onAmountChange: (value: string) => void;
  onUnitChange: (value: string) => void;
}>;

function QuantityField(props: Readonly<QuantityFieldProps>) {
  const { amount, unit, onAmountChange, onUnitChange } = props;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-7 items-end gap-1.5">
        <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
          Current Quantity
        </Text>
        <Text as="span" className="text-ehs-red text-[12px]">
          *
        </Text>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="0"
          aria-label="Quantity amount"
          className={`${hazcomFieldInputClass} flex-1`}
        />
        <input
          type="text"
          value={unit}
          onChange={(event) => onUnitChange(event.target.value)}
          placeholder="Unit"
          aria-label="Quantity unit"
          className={`${hazcomFieldInputClass} w-24 shrink-0`}
        />
      </div>
    </div>
  );
}

type SignalWordFieldProps = Readonly<{
  value: HazcomSignalWord;
  onChange: (value: HazcomSignalWord) => void;
}>;

const SIGNAL_WORDS = ["Danger", "Warning"] as const;

function SignalWordField(props: Readonly<SignalWordFieldProps>) {
  const { value, onChange } = props;

  return (
    <div className="flex flex-col gap-1.5">
      <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
        GHS Signal Word
      </Text>
      <div className="flex gap-2">
        {SIGNAL_WORDS.map((word) => {
          const isSelected = value === word;
          const isDanger = word === "Danger";

          return (
            <button
              key={word}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(word)}
              className={[
                "h-9 flex-1 rounded-[10px] border text-[13px] font-bold tracking-wide uppercase transition-colors",
                isSelected
                  ? isDanger
                    ? "border-ehs-red text-ehs-red bg-ehs-red/5"
                    : "border-ehs-yellow text-ehs-yellow bg-ehs-yellow/10"
                  : "border-ehs-border text-ehs-gray bg-white/60 hover:border-ehs-normal-blue/40",
              ].join(" ")}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
