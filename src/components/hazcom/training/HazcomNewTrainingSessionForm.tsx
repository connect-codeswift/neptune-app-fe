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
import type { TrainingLogRequestDto } from "@/dtos/req/hazcom-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateTrainingLogMutation } from "@/hooks/use-hazcom-mutations";
import { toast } from "@/lib/toast";

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

const TRAINING_LOG_ROUTE = "/dashboard/hazcom/training";

/**
 * `sessionDate` is a date-time on the wire while the field collects a plain
 * date, so the day is sent as UTC midnight.
 */
function toSessionDate(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString();
}

function toTrainingLogRequest(
  form: NewTrainingSessionFormState,
): TrainingLogRequestDto {
  return {
    sessionDate: toSessionDate(form.date),
    trainer: form.trainer.trim(),
    // The API has no "topic" column; `trainerTitle` is the only free-text
    // field this can land in.
    trainerTitle: form.topic.trim(),
    chemicalsCovered: form.chemicals.trim(),
    // A string on the wire even though the field collects a count.
    attendees: form.attendees.trim(),
    materialsLink: form.materialsLink.trim(),
    notes: form.notes.trim(),
    // The form covers a session, not a specific chemical; the list of names
    // it collects goes to `chemicalsCovered` instead.
    chemicalId: null,
  };
}

export type HazcomNewTrainingSessionFormProps = Readonly<{
  className?: string;
}>;

export function HazcomNewTrainingSessionForm(
  props: Readonly<HazcomNewTrainingSessionFormProps>,
) {
  const { className = "" } = props;
  const router = useRouter();
  const createTrainingLog = useCreateTrainingLogMutation();
  const [form, setForm] =
    useState<NewTrainingSessionFormState>(INITIAL_FORM_STATE);

  const updateField = <K extends keyof NewTrainingSessionFormState>(
    field: K,
    value: NewTrainingSessionFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // The two fields the API requires; both are asterisked in the form.
    const missing =
      form.date.trim() === ""
        ? "Session Date"
        : form.trainer.trim() === ""
          ? "Trainer"
          : null;

    if (missing !== null) {
      toast.error(`${missing} is required`);
      return;
    }

    createTrainingLog.mutate(toTrainingLogRequest(form), {
      onSuccess: () => {
        toast.success("Training session logged");
        router.push(TRAINING_LOG_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not save the training session. Please try again.",
          ),
        );
      },
    });
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
            onChange={(event) => updateField("chemicals", event.target.value)}
          />
          <HazcomTextField
            label="Attendees (count)"
            type="number"
            min={0}
            placeholder="0"
            value={form.attendees}
            onChange={(event) => updateField("attendees", event.target.value)}
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
          <Link href={TRAINING_LOG_ROUTE}>
            <Button type="button" variant="tertiary">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={createTrainingLog.isPending}
          >
            <Icon icon="mdi:check" className="text-base" aria-hidden="true" />
            {createTrainingLog.isPending ? "Saving…" : "Save Session"}
          </Button>
        </div>
      </form>
    </HazcomGlassCard>
  );
}
