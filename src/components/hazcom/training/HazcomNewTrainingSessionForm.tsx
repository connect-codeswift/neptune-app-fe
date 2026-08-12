"use client";

import { useRef, useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_FIELD_LABEL_CLASS,
  HazcomGlassCard,
  HazcomTextareaField,
  HazcomTextField,
} from "@/components/hazcom/shared";
import type {
  TrainingLogRequestDto,
  TrainingMaterialRequestDto,
} from "@/dtos/req/hazcom-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateTrainingLogMutation } from "@/hooks/use-hazcom-mutations";
import { toast } from "@/lib/toast";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";

type TrainingMaterialDraft = Readonly<{
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
}>;

type NewTrainingSessionFormState = Readonly<{
  date: string;
  trainer: string;
  topic: string;
  chemicals: string;
  attendees: string;
  materials: readonly TrainingMaterialDraft[];
  notes: string;
}>;

const INITIAL_FORM_STATE: NewTrainingSessionFormState = {
  date: "",
  trainer: "",
  topic: "",
  chemicals: "",
  attendees: "",
  materials: [],
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
  const materials: TrainingMaterialRequestDto[] = form.materials.map(
    (material) => ({
      fileUrl: material.fileUrl,
      fileName: material.fileName,
      ...(material.fileType ? { fileType: material.fileType } : {}),
    }),
  );

  return {
    sessionDate: toSessionDate(form.date),
    trainer: form.trainer.trim(),
    // The API has no "topic" column; `trainerTitle` is the only free-text
    // field this can land in.
    trainerTitle: form.topic.trim(),
    chemicalsCovered: form.chemicals.trim(),
    // A string on the wire even though the field collects a count.
    attendees: form.attendees.trim(),
    materials: materials.length > 0 ? materials : null,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] =
    useState<NewTrainingSessionFormState>(INITIAL_FORM_STATE);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);

  const updateField = <K extends keyof NewTrainingSessionFormState>(
    field: K,
    value: NewTrainingSessionFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const removeMaterial = (index: number) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleMaterialUpload = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setIsUploadingMaterial(true);
    try {
      const uploaded = await uploadFileToCloudinary(file);
      setForm((prev) => ({
        ...prev,
        materials: [
          ...prev.materials,
          {
            fileUrl: uploaded.secureUrl,
            fileName: file.name.trim() || uploaded.name,
            fileType: uploaded.mimeType || uploaded.format || null,
          },
        ],
      }));
      toast.success("Training material uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload the training material.",
      );
    } finally {
      setIsUploadingMaterial(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUploadingMaterial) {
      toast.error("Wait for the material upload to finish");
      return;
    }

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
        {/* Names the section, not the page — the page header above already
            says what this form creates. */}
        <Text as="h2" className="text3 text-ehs-darker">
          Session Details
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <Text as="span" className={HAZCOM_FIELD_LABEL_CLASS}>
              Training Materials
            </Text>
            <Button
              type="button"
              variant="tertiary"
              disabled={isUploadingMaterial}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon icon="mdi:upload" className="size-4" aria-hidden="true" />
              {isUploadingMaterial ? "Uploading…" : "Add file"}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx,image/*"
            className="hidden"
            onChange={(event) => {
              void handleMaterialUpload(event.target.files?.[0]);
            }}
          />
          {form.materials.length === 0 ? (
            <Text as="p" className="text4 text-ehs-muted-text">
              No materials attached yet.
            </Text>
          ) : (
            <ul className="flex flex-col gap-2">
              {form.materials.map((material, index) => (
                <li
                  key={`${material.fileUrl}-${String(index)}`}
                  className="border-ehs-border flex items-center justify-between gap-3 rounded-2.5 border bg-white/60 px-3 py-2"
                >
                  <Text
                    as="span"
                    className="text4 text-ehs-dark-bg min-w-0 truncate"
                  >
                    {material.fileName}
                  </Text>
                  <button
                    type="button"
                    className="text-ehs-muted-text hover:text-ehs-red shrink-0"
                    aria-label={`Remove ${material.fileName}`}
                    onClick={() => removeMaterial(index)}
                  >
                    <Icon icon="mdi:close" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
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
            isLoading={createTrainingLog.isPending}
            disabled={isUploadingMaterial}
          >
            <Icon icon="mdi:check" className="size-4" aria-hidden="true" />
            {createTrainingLog.isPending ? "Saving…" : "Save Session"}
          </Button>
        </div>
      </form>
    </HazcomGlassCard>
  );
}
