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
import type { ChemicalRequestDto } from "@/dtos/req/hazcom-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateChemicalMutation } from "@/hooks/use-hazcom-mutations";
import { toast } from "@/lib/toast";

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

/**
 * GHS hazard category — the severity level, where Category 1 is the most
 * severe. The *kind* of hazard is captured by the GHS Pictograms field below,
 * so this field carries the level only.
 */
const HAZARD_CATEGORY_OPTIONS = [
  { value: "", label: "Select category" },
  { value: "Category 1", label: "Category 1 (most severe)" },
  { value: "Category 2", label: "Category 2" },
  { value: "Category 3", label: "Category 3" },
  { value: "Category 4", label: "Category 4" },
  { value: "Category 5", label: "Category 5 (least severe)" },
] as const;

const CHEMICALS_LIST_ROUTE = "/dashboard/hazcom/chemicals";

/**
 * Rows saved before this field became a category list hold a hazard *type*
 * ("Corrosive", "Flammable Liquid"). A `<select>` renders blank for a value it
 * has no option for, which would quietly overwrite that value on the next save
 * — so the stored one stays selectable until a category is chosen.
 */
function hazardCategoryOptions(
  current: string,
): readonly { value: string; label: string }[] {
  const isKnown = HAZARD_CATEGORY_OPTIONS.some(
    (option) => option.value === current,
  );

  if (isKnown) {
    return HAZARD_CATEGORY_OPTIONS;
  }

  return [
    ...HAZARD_CATEGORY_OPTIONS,
    { value: current, label: `${current} (existing value)` },
  ];
}

/** Everything the form collects, gathered for validation and mapping. */
type ChemicalFormValues = Readonly<{
  name: string;
  casNumber: string;
  hazardClass: string;
  location: string;
  disposeLocation: string;
  quantityAmount: string;
  quantityUnit: string;
  signalWord: HazcomSignalWord;
  sdsLink: string;
  status: string;
  pictograms: readonly HazcomPictogram[];
  notes: string;
}>;

/**
 * Label of the first empty asterisked field, or null when the form is
 * complete. The shared HazCom fields render no inline error slot, so the
 * caller reports this as a toast.
 */
function firstMissingRequiredField(values: ChemicalFormValues): string | null {
  if (values.name.trim() === "") {
    return "Chemical / Substance Name";
  }
  if (values.hazardClass.trim() === "") {
    return "Hazard Class";
  }
  if (values.location.trim() === "") {
    return "Location / Work Area";
  }
  if (values.quantityAmount.trim() === "") {
    return "Current Quantity";
  }
  return null;
}

/** Row id as a number, or null when it isn't one the API can address. */
function toNumericId(id: string | undefined): number | null {
  if (id === undefined || !/^\d+$/.test(id.trim())) {
    return null;
  }
  return Number(id.trim());
}

/**
 * Field names here are the backend's own spellings — see `ChemicalRequestDto`.
 * The schema is `additionalProperties: false`, so nothing extra (notably the
 * `siteId`/`userId` pair the other modules attach) may be added.
 */
function toChemicalRequest(
  values: ChemicalFormValues,
  options: Readonly<{ isDraft: boolean; existingId: number | null }>,
): ChemicalRequestDto {
  return {
    // Omitted on add; POST /chemical treats a present id as an update.
    ...(options.existingId === null ? {} : { id: options.existingId }),
    chemi_Name: values.name.trim(),
    caS_Number: values.casNumber.trim(),
    location: values.location.trim(),
    disposeLocation: values.disposeLocation.trim() || null,
    // Sent as one combined string ("15 Liters").
    currentQuantity: [values.quantityAmount.trim(), values.quantityUnit.trim()]
      .filter((part) => part !== "")
      .join(" "),
    hazardClass: values.hazardClass.trim(),
    // The column is a single string; ", " is the separator the mapper reads
    // back. Confirm it against a stored row — the schema doesn't say.
    ghsPictograms: values.pictograms.join(", "),
    ghsSignal: values.signalWord,
    // Optional in the UI; a new chemical is in use unless the user says
    // otherwise.
    status: values.status === "" ? "Active" : values.status,
    notes: values.notes.trim(),
    linkToSdsRecord: values.sdsLink.trim(),
    isDraft: options.isDraft,
  };
}

export function ChemicalForm(props: Readonly<ChemicalFormProps>) {
  const { mode, chemical, className = "" } = props;
  const router = useRouter();
  const saveChemical = useCreateChemicalMutation();
  const initialQuantity = chemical
    ? splitQuantity(chemical.quantity)
    : { amount: "", unit: "" };

  const [name, setName] = useState(chemical?.name ?? "");
  const [casNumber, setCasNumber] = useState(chemical?.casNumber ?? "");
  const [hazardClass, setHazardClass] = useState(chemical?.hazardClass ?? "");
  const [location, setLocation] = useState(chemical?.location ?? "");
  const [disposeLocation, setDisposeLocation] = useState(
    chemical?.disposeLocation ?? "",
  );
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
      : CHEMICALS_LIST_ROUTE;
  const primaryLabel = mode === "add" ? "Add Chemical" : "Save Changes";
  const existingId = mode === "edit" ? toNumericId(chemical?.id) : null;

  /**
   * Both actions hit POST /api/hazcom/chemical; only `isDraft` and the route
   * they return to differ — a submit lands on the record, a draft on the
   * inventory list.
   */
  function save(isDraft: boolean) {
    const values: ChemicalFormValues = {
      name,
      casNumber,
      hazardClass,
      location,
      disposeLocation,
      quantityAmount,
      quantityUnit,
      signalWord,
      sdsLink,
      status,
      pictograms,
      notes,
    };

    // A draft is allowed to be incomplete, but it still needs a name to be
    // identifiable in the drafts list.
    const missing = isDraft
      ? name.trim() === ""
        ? "Chemical / Substance Name"
        : null
      : firstMissingRequiredField(values);

    if (missing !== null) {
      toast.error(`${missing} is required`);
      return;
    }

    // Editing reuses the create endpoint with the id attached; without a
    // numeric id the call would add a second record instead of updating this
    // one, so it is refused rather than duplicating the chemical.
    if (mode === "edit" && existingId === null) {
      toast.error("This chemical cannot be saved — its id is not recognised.");
      return;
    }

    saveChemical.mutate(toChemicalRequest(values, { isDraft, existingId }), {
      onSuccess: () => {
        toast.success(
          isDraft
            ? "Chemical saved as draft"
            : mode === "add"
              ? "Chemical added"
              : "Chemical updated",
        );
        router.push(isDraft ? CHEMICALS_LIST_ROUTE : cancelHref);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not save the chemical. Please try again.",
          ),
        );
      },
    });
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
          <HazcomSelectField
            label="Hazard Class"
            required
            hint="GHS severity level — the hazard type comes from the pictograms below"
            value={hazardClass}
            onChange={(event) => setHazardClass(event.target.value)}
            options={hazardCategoryOptions(hazardClass)}
          />

          <HazcomTextField
            label="Location / Work Area"
            required
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Lab 1 - Room 131"
          />
          <HazcomTextField
            label="Dispose Location"
            trailingHint="Optional — max 250 chars"
            value={disposeLocation}
            onChange={(event) => setDisposeLocation(event.target.value)}
            placeholder="e.g. Hazardous waste drum — Bay 3"
            maxLength={250}
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
              <Icon
                icon="mdi:arrow-left"
                className="text-base"
                aria-hidden="true"
              />
              Cancel
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg px-4 py-2 text-[13px]"
              disabled={saveChemical.isPending}
              onClick={() => save(true)}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              className="rounded-lg px-5 py-2 text-[13px]"
              disabled={saveChemical.isPending}
              onClick={() => save(false)}
            >
              {saveChemical.isPending ? "Saving..." : primaryLabel}
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
      {/*
        Both inputs carry `w-full` from `hazcomFieldInputClass`, so sizing is
        set via flex-basis — it beats `width` for flex items and avoids a
        `w-full` vs `w-24` conflict that collapsed the amount box to 0px.
      */}
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="0"
          aria-label="Quantity amount"
          className={`${hazcomFieldInputClass} min-w-0 grow basis-0`}
        />
        <input
          type="text"
          value={unit}
          onChange={(event) => onUnitChange(event.target.value)}
          placeholder="Unit"
          aria-label="Quantity unit"
          className={`${hazcomFieldInputClass} shrink-0 grow-0 basis-24`}
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
                  : "border-ehs-border text-ehs-gray hover:border-ehs-normal-blue/40 bg-white/60",
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
