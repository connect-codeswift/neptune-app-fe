"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HazcomGlassCard,
  HazcomTextareaField,
  HazcomTextField,
} from "@/components/hazcom/shared";

type NewTrainingSessionFormState = Readonly<{
  date: string;
  trainer: string;
  topic: string;
  chemicals: string;
  attendees: string;
  materialsLink: string;
  notes: string;
}>;

const INITIAL_FORM_STATE: NewTrainingSessionFormState = {
  date: "",
  trainer: "",
  topic: "",
  chemicals: "",
  attendees: "",
  materialsLink: "",
  notes: "",
};

export type HazcomNewTrainingSessionFormProps = Readonly<{
  className?: string;
}>;

export function HazcomNewTrainingSessionForm(
  props: Readonly<HazcomNewTrainingSessionFormProps>,
) {
  const { className = "" } = props;
  const router = useRouter();
  const [form, setForm] = useState<NewTrainingSessionFormState>(
    INITIAL_FORM_STATE,
  );

  const updateField = <K extends keyof NewTrainingSessionFormState>(
    field: K,
    value: NewTrainingSessionFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard/hazcom/training");
  };

  return (
    <HazcomGlassCard
      paddingClassName="p-6"
      className={["w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Text as="h2" className="text-ehs-darker text-[15px] font-bold">
          New Training Session
        </Text>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <HazcomTextField
            label="Session Date"
            required
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
          <HazcomTextField
            label="Trainer"
            required
            placeholder="e.g. Sarah Mitchell"
            value={form.trainer}
            onChange={(event) => updateField("trainer", event.target.value)}
          />
          <HazcomTextField
            label="Topic / Training Title"
            placeholder="e.g. GHS Right-to-Know"
            value={form.topic}
            onChange={(event) => updateField("topic", event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <HazcomTextField
            label="Chemicals Covered"
            placeholder="e.g. HCI, Acetone, NaOH"
            value={form.chemicals}
            onChange={(event) =>
              updateField("chemicals", event.target.value)
            }
          />
          <HazcomTextField
            label="Attendees (count)"
            type="number"
            min={0}
            placeholder="0"
            value={form.attendees}
            onChange={(event) =>
              updateField("attendees", event.target.value)
            }
          />
          <HazcomTextField
            label="Training Materials Link"
            placeholder="Document ID or URL"
            value={form.materialsLink}
            onChange={(event) =>
              updateField("materialsLink", event.target.value)
            }
          />
        </div>

        <HazcomTextareaField
          label="Notes"
          placeholder="Additional notes..."
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
        />

        <div className="mt-2 flex items-center justify-end gap-3 border-t border-[rgba(15,23,42,0.08)] pt-5">
          <Link href="/dashboard/hazcom/training">
            <Button type="button" variant="tertiary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary">
            <Icon icon="mdi:check" className="text-base" aria-hidden="true" />
            Save Session
          </Button>
        </div>
      </form>
    </HazcomGlassCard>
  );
}
