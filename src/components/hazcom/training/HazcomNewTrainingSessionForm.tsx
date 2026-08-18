"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  ReportTextField,
  ReportTextareaField,
} from "@/components/incidents/report/shared/ReportFormField";
import { ReportDateField } from "@/components/incidents/report/shared/ReportDateField";
import { ReportPersonSearchField } from "@/components/incidents/report/shared/ReportPersonSearchField";
import { parseMmDdYyyy } from "@/components/incidents/report/shared/report-date-time";
import { UploadDocumentDropzone } from "@/components/policy-maker/upload/UploadDocumentDropzone";
import type {
  TrainingLogRequestDto,
  TrainingMaterialRequestDto,
} from "@/dtos/req/hazcom-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateTrainingLogMutation } from "@/hooks/use-hazcom-mutations";
import { getAuthContext } from "@/lib/auth-context";
import {
  CLOUDINARY_MAX_BYTES,
  formatFileSize,
} from "@/lib/cloudinary-constants";
import { toast } from "@/lib/toast";
import { uploadFile } from "@/lib/upload-file";

const TRAINING_MATERIAL_ACCEPT =
  ".pdf,.ppt,.pptx,.doc,.docx,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

const TRAINING_MATERIAL_EXTENSIONS = new Set([
  "pdf",
  "ppt",
  "pptx",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
]);

function validateTrainingMaterial(file: File): string | null {
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  const allowed =
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    TRAINING_MATERIAL_EXTENSIONS.has(extension);

  if (!allowed) {
    return "Use PDF, PPT, DOC, or an image file.";
  }
  if (file.size > CLOUDINARY_MAX_BYTES) {
    return "File must be 50MB or smaller.";
  }
  return null;
}

type TrainingMaterialDraft = Readonly<{
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
}>;

type NewTrainingSessionFormState = Readonly<{
  date: string;
  trainer: string;
  trainerId: string;
  topic: string;
  chemicals: string;
  attendees: string;
  materials: readonly TrainingMaterialDraft[];
  notes: string;
}>;

const INITIAL_FORM_STATE: NewTrainingSessionFormState = {
  date: "",
  trainer: "",
  trainerId: "",
  topic: "",
  chemicals: "",
  attendees: "",
  materials: [],
  notes: "",
};

const TRAINING_LOG_ROUTE = "/dashboard/hazcom/training";

const fieldLabelClass = "block text8 font-semibold text-ehs-gray";

const glassCardClass =
  "relative w-full min-w-0 max-w-full overflow-hidden rounded-4 border-[0.8px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-4 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:max-w-3xl lg:max-w-5xl";

/**
 * Session date is collected as `MM/DD/YYYY` (incident date field) and sent as
 * UTC midnight on the wire.
 */
function toSessionDate(date: string): string | null {
  const parsed = parseMmDdYyyy(date);
  return parsed ? parsed.toISOString() : null;
}

function toTrainingLogRequest(
  form: NewTrainingSessionFormState,
  sessionDate: string,
): TrainingLogRequestDto {
  const materials: TrainingMaterialRequestDto[] = form.materials.map(
    (material) => ({
      fileUrl: material.fileUrl,
      fileName: material.fileName,
      ...(material.fileType ? { fileType: material.fileType } : {}),
    }),
  );

  return {
    sessionDate,
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
  const [form, setForm] =
    useState<NewTrainingSessionFormState>(INITIAL_FORM_STATE);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const auth = useMemo(() => getAuthContext(), []);
  const siteId = auth?.siteId ?? 0;
  const siteName = auth?.siteName ?? null;
  const usersSource = siteId > 0 ? "site" : "dropdown";

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

  const handleMaterialFileChange = (file: File | null) => {
    setPendingFile(file);
    setUploadError(null);

    if (!file) {
      return;
    }

    setIsUploadingMaterial(true);
    try {
      const uploaded = await uploadFile(file, { module: "HazCom" });
      setForm((prev) => ({
        ...prev,
        materials: [
          ...prev.materials,
          {
            fileUrl: uploaded.fileId,
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
    })();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUploadingMaterial) {
      toast.error("Wait for the material upload to finish");
      return;
    }

    const sessionDate = toSessionDate(form.date);
    const missing =
      sessionDate == null
        ? "Session Date"
        : form.trainer.trim() === ""
          ? "Trainer"
          : null;

    if (missing !== null) {
      toast.error(
        missing === "Session Date"
          ? "Session Date is required"
          : "Trainer is required",
      );
      return;
    }

    createTrainingLog.mutate(toTrainingLogRequest(form, sessionDate), {
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

  const busy = createTrainingLog.isPending || isUploadingMaterial;

  return (
    <form
      onSubmit={handleSubmit}
      className={[glassCardClass, className].filter(Boolean).join(" ")}
      noValidate
    >
      <div className="relative z-1 flex min-w-0 flex-col gap-4 p-3.5 sm:gap-5 sm:px-6 sm:pt-6 sm:pb-6 lg:gap-6 lg:px-8 lg:pt-8 lg:pb-8">
        <div className="flex flex-col gap-1.5">
          <Text as="label" className={fieldLabelClass}>
            Training Materials
          </Text>
          <UploadDocumentDropzone
            file={pendingFile}
            isUploading={isUploadingMaterial}
            error={uploadError}
            accept={TRAINING_MATERIAL_ACCEPT}
            emptyHint={`PDF, PPT, DOC, or image — Max ${formatFileSize(CLOUDINARY_MAX_BYTES)}`}
            validateFile={validateTrainingMaterial}
            onFileChange={handleMaterialFileChange}
          />
          {form.materials.length > 0 ? (
            <ul className="mt-1 flex flex-col gap-2">
              {form.materials.map((material, index) => (
                <li
                  key={`${material.fileUrl}-${String(index)}`}
                  className="border-ehs-border flex items-center justify-between gap-3 rounded-2.5 border bg-white/60 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon
                      icon="mdi:file-document-outline"
                      className="text-ehs-muted-text size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <Text
                      as="span"
                      className="text4 text-ehs-darker min-w-0 truncate"
                    >
                      {material.fileName}
                    </Text>
                  </div>
                  <button
                    type="button"
                    className="text-ehs-muted-text hover:text-ehs-red shrink-0"
                    aria-label={`Remove ${material.fileName}`}
                    disabled={busy}
                    onClick={() => removeMaterial(index)}
                  >
                    <Icon icon="mdi:close" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-5 lg:gap-6">
          <div className="grid grid-cols-1 gap-3.5 min-[800px]:grid-cols-2 sm:gap-4 lg:gap-x-6 lg:gap-y-5">
            <ReportDateField
              variant="embedded"
              label="Session Date"
              required
              value={form.date}
              onChange={(value) => updateField("date", value)}
              placeholder="MM/DD/YYYY"
              className="min-w-0"
            />

            <ReportPersonSearchField
              variant="embedded"
              label="Trainer"
              required
              value={form.trainer}
              selectedUserId={form.trainerId}
              onChange={({ name, userId }) => {
                setForm((prev) => ({
                  ...prev,
                  trainer: name,
                  trainerId: userId,
                }));
              }}
              usersSource={usersSource}
              siteId={siteId}
              siteName={siteName}
              placeholder="Start typing a name…"
              trailingHint="Search people at your site."
              className="min-w-0"
            />

            <ReportTextField
              label="Topic / Training Title"
              placeholder="e.g. GHS Right-to-Know"
              value={form.topic}
              onChange={(event) => updateField("topic", event.target.value)}
              disabled={busy}
              className="min-w-0"
            />

            <ReportTextField
              label="Attendees (count)"
              type="number"
              min={0}
              placeholder="0"
              value={form.attendees}
              onChange={(event) =>
                updateField("attendees", event.target.value)
              }
              disabled={busy}
              className="min-w-0"
            />

            <ReportTextField
              label="Chemicals Covered"
              placeholder="e.g. HCl, Acetone, NaOH"
              value={form.chemicals}
              onChange={(event) =>
                updateField("chemicals", event.target.value)
              }
              disabled={busy}
              className="min-w-0 min-[800px]:col-span-2"
            />

            <ReportTextareaField
              label="Notes"
              rows={4}
              placeholder="Additional notes..."
              value={form.notes}
              disabled={busy}
              onChange={(event) => updateField("notes", event.target.value)}
              className="min-w-0 min-[800px]:col-span-2"
            />
          </div>
        </div>

        <div className="border-ehs-border flex flex-wrap items-center justify-end gap-2 border-t pt-4 sm:gap-3 sm:pt-5">
          <Link href={TRAINING_LOG_ROUTE}>
            <Button
              type="button"
              variant="tertiary"
              disabled={createTrainingLog.isPending}
              className="text4 h-9 rounded-2.5 px-3 sm:h-9.5 sm:px-4"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={createTrainingLog.isPending}
            disabled={busy}
            className="text4 h-9 rounded-2.5 px-3 sm:h-9.5 sm:px-4"
          >
            <Icon icon="mdi:check" className="size-4" aria-hidden="true" />
            {createTrainingLog.isPending ? "Saving…" : "Save Session"}
          </Button>
        </div>
      </div>
    </form>
  );
}
