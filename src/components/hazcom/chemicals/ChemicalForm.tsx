"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_FIELD_LABEL_CLASS,
  HAZCOM_PICTOGRAMS,
  HazcomPictogramChip,
  HazcomSelectField,
  HazcomTextField,
  HazcomTextareaField,
  type HazcomChemical,
  type HazcomPictogram,
  type HazcomSignalWord,
} from "@/components/hazcom/shared";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
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
const SIGNAL_WORDS = ["Danger", "Warning"] as const;
const actionClass = "text4 h-9.5 rounded-2.5 px-4 sm:px-5";

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

function FormSection(
  props: Readonly<{
    title: string;
    description?: string;
    children: ReactNode;
  }>,
) {
  const { title, description, children } = props;

  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-0.5">
        <Text as="h3" className="text3 text-ehs-darker">
          {title}
        </Text>
        {description ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            {description}
          </Text>
        ) : null}
      </div>
      {children}
    </section>
  );
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
  const [status, setStatus] = useState(chemical?.status ?? "Active");
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save(false);
  }

  const pictogramCount = pictograms.length;

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col gap-6 p-4 sm:p-5">
          <FormSection
            title="Identity"
            description="Name and identifiers used across the inventory."
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
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
                label="Link to SDS Record"
                value={sdsLink}
                onChange={(event) => setSdsLink(event.target.value)}
                placeholder="e.g. SDS_Hydrochloric_Acid_Rev2026.pdf"
              />
            </div>
          </FormSection>

          <div className="border-ehs-border border-t" />

          <FormSection
            title="Inventory & location"
            description="Where it is stored and how much is on hand."
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <HazcomTextField
                label="Location / Work Area"
                required
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Lab 1 - Room 131"
              />
              <HazcomTextField
                label="Dispose Location"
                trailingHint="Optional"
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
              <StatusField value={status} onChange={setStatus} />
            </div>
          </FormSection>

          <div className="border-ehs-border border-t" />

          <FormSection
            title="GHS classification"
            description="Signal word, severity category, and pictograms."
          >
            <div className="grid grid-cols-1 items-start gap-x-4 gap-y-4 sm:grid-cols-2">
              <SignalWordField value={signalWord} onChange={setSignalWord} />
              <HazcomSelectField
                label="Hazard Class"
                required
                trailingHint="Severity level"
                value={hazardClass}
                onChange={(event) => setHazardClass(event.target.value)}
                options={hazardCategoryOptions(hazardClass)}
              />

              <div className="flex flex-col gap-2 sm:col-span-2">
                <div className="flex min-h-7 flex-wrap items-end justify-between gap-2">
                  <Text as="span" className={HAZCOM_FIELD_LABEL_CLASS}>
                    GHS Pictograms
                  </Text>
                  <Text as="span" className="text8 text-ehs-muted-text">
                    {pictogramCount === 0
                      ? "None selected"
                      : `${String(pictogramCount)} selected`}
                  </Text>
                </div>
                <div className="border-ehs-border bg-ehs-light-bg/35 flex flex-wrap gap-2 rounded-2.5 border border-dashed p-3">
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
            </div>
          </FormSection>

          <div className="border-ehs-border border-t" />

          <FormSection
            title="Storage & notes"
            description="Handling instructions and any extra context for this record."
          >
            <HazcomTextareaField
              label="Additional Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Storage conditions, special handling instructions, etc."
            />
          </FormSection>
        </div>

        <div className="border-ehs-border bg-white/40 sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3.5 backdrop-blur-xl sm:px-5">
          <Link href={cancelHref}>
            <Button
              type="button"
              variant="tertiary"
              className={`${actionClass} border-[0.8px] border-[rgba(11,19,32,0.14)] text-[#0b1320] shadow-none`}
            >
              <Icon
                icon="mdi:arrow-left"
                className="size-4"
                aria-hidden="true"
              />
              Cancel
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className={actionClass}
              disabled={saveChemical.isPending}
              onClick={() => save(true)}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={actionClass}
              isLoading={saveChemical.isPending}
            >
              {saveChemical.isPending ? "Saving..." : primaryLabel}
            </Button>
          </div>
        </div>
      </form>
    </IncidentGlassCard>
  );
}

/** Shared label row so paired columns keep the same control baseline. */
function FieldLabelRow(
  props: Readonly<{
    label: string;
    required?: boolean;
    trailing?: ReactNode;
  }>,
) {
  const { label, required = false, trailing } = props;

  return (
    <div className="flex h-7 min-h-7 items-end gap-1.5">
      <Text as="span" className={HAZCOM_FIELD_LABEL_CLASS}>
        {label}
      </Text>
      {required ? (
        <Text as="span" className="text8 text-ehs-red">
          *
        </Text>
      ) : null}
      {trailing ? <span className="ml-auto shrink-0">{trailing}</span> : null}
    </div>
  );
}

/**
 * Matches `FIELD_INPUT_CLASS` control height (`p-3`) so toggles line up with
 * text inputs / selects in the same row.
 */
const choiceButtonBaseClass =
  "text5 flex-1 rounded-2.5 border px-3 py-3 tracking-normal transition-colors";
const choiceButtonIdleClass =
  "border-ehs-border bg-white/55 text-ehs-gray hover:border-ehs-normal-blue/40 hover:bg-white/78";

type QuantityFieldProps = Readonly<{
  amount: string;
  unit: string;
  onAmountChange: (value: string) => void;
  onUnitChange: (value: string) => void;
}>;

function QuantityField(props: Readonly<QuantityFieldProps>) {
  const { amount, unit, onAmountChange, onUnitChange } = props;

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <FieldLabelRow label="Current Quantity" required />
      {/*
        Override `w-full` from FIELD_INPUT_CLASS inside the flex row so amount
        fills leftover space and unit keeps a stable share of the column.
      */}
      <div className="flex w-full min-w-0 gap-2">
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="0"
          aria-label="Quantity amount"
          className={`${FIELD_INPUT_CLASS} min-w-0 flex-1 !w-auto`}
        />
        <input
          type="text"
          value={unit}
          onChange={(event) => onUnitChange(event.target.value)}
          placeholder="Unit"
          aria-label="Quantity unit"
          className={`${FIELD_INPUT_CLASS} w-28 shrink-0 !w-28`}
        />
      </div>
    </div>
  );
}

type ChoiceFieldProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
}>;

function StatusField(props: Readonly<ChoiceFieldProps>) {
  const { value, onChange } = props;

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <FieldLabelRow label="Status" />
      <div className="flex w-full gap-2">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={[
                choiceButtonBaseClass,
                isSelected
                  ? option.value === "Active"
                    ? "border-ehs-normal-blue bg-ehs-normal-blue/10 text-ehs-dark-blue"
                    : "border-ehs-muted-text/50 bg-ehs-dark-bg/8 text-ehs-gray"
                  : choiceButtonIdleClass,
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type SignalWordFieldProps = Readonly<{
  value: HazcomSignalWord;
  onChange: (value: HazcomSignalWord) => void;
}>;

function SignalWordField(props: Readonly<SignalWordFieldProps>) {
  const { value, onChange } = props;

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <FieldLabelRow label="GHS Signal Word" />
      <div className="flex w-full gap-2">
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
                choiceButtonBaseClass,
                "uppercase tracking-wide",
                isSelected
                  ? isDanger
                    ? "border-ehs-red bg-ehs-red/5 text-ehs-red"
                    : "border-ehs-yellow bg-ehs-yellow/10 text-ehs-yellow"
                  : choiceButtonIdleClass,
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
