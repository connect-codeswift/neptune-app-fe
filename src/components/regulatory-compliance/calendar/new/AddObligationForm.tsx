"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { Button } from "@/components/ui/Button";
import { CreatableSelectInput } from "@/components/inputs/CreatableSelectInput";
import {
  SelectInput,
  type SelectOption,
} from "@/components/inputs/SelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import { UploadDocumentDropzone } from "@/components/policy-maker";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useAddComplianceMutation } from "@/hooks/use-compliance-mutations";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { withAttachmentDisplayName } from "@/lib/attachment-url";
import {
  CLOUDINARY_MAX_BYTES,
  isCloudinaryPublicConfigReady,
  isPdfMimeType,
} from "@/lib/cloudinary-constants";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";
import { buildAddComplianceRequest } from "@/services/mappers/compliance.mapper";

const fieldLabelClass = "text-ehs-gray block text-[12px] leading-4 font-medium";
const fieldWrapperClass = "flex w-full min-w-0 flex-col gap-1";
const controlClass =
  "!h-9 !min-w-0 !rounded-[10px] !border-[0.8px] !border-ehs-border !bg-[#eef1f6] !px-3 !py-2 !text-[14px] !shadow-none focus:!border-ehs-normal-blue focus:!ring-ehs-normal-blue/20 sm:!h-[36px]";

const DEFAULT_CATEGORY_OPTIONS: readonly SelectOption[] = [
  { value: "permit", label: "Permit" },
  { value: "inspection", label: "Inspection" },
  { value: "training", label: "Training" },
  { value: "reporting", label: "Reporting" },
  { value: "certification", label: "Certification" },
  { value: "assessment", label: "Assessment" },
];

const REGULATORY_BODY_OPTIONS: readonly SelectOption[] = [
  { value: "osha", label: "OSHA" },
  { value: "epa", label: "EPA" },
  { value: "nfpa", label: "NFPA" },
  { value: "dot", label: "DOT" },
  { value: "state-dep", label: "State DEP" },
  { value: "local-fire-marshal", label: "Local Fire Marshal" },
];

const RECURRENCE_OPTIONS: readonly SelectOption[] = [
  { value: "one-time", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

const PRIORITY_OPTIONS: readonly SelectOption[] = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const JURISDICTION_OPTIONS: readonly SelectOption[] = [
  { value: "Federal", label: "Federal" },
  { value: "State", label: "State" },
  { value: "Local", label: "Local" },
];

function todayInputValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${String(now.getFullYear())}-${month}-${day}`;
}

function isPdfFile(file: File): boolean {
  return isPdfMimeType(file.type) || file.name.toLowerCase().endsWith(".pdf");
}

function optionLabel(
  options: readonly SelectOption[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function AddObligationForm() {
  const router = useRouter();
  const usersQuery = useUserDropdownQuery();
  const addComplianceMutation = useAddComplianceMutation();

  const [title, setTitle] = useState("");
  const [categoryOptions, setCategoryOptions] = useState(
    DEFAULT_CATEGORY_OPTIONS,
  );
  const [category, setCategory] = useState("");
  const [regulatoryBody, setRegulatoryBody] = useState("");
  const [dueDate, setDueDate] = useState(todayInputValue());
  const [recurrence, setRecurrence] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [priority, setPriority] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [code, setCode] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [pdfSecureUrl, setPdfSecureUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const userOptions = useMemo(
    () => toAssigneeOptions(usersQuery.data?.dataModel ?? []),
    [usersQuery.data?.dataModel],
  );

  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    const value = trimmed.toLowerCase().replace(/\s+/g, "-");
    setCategoryOptions((prev) =>
      prev.some((option) => option.value === value)
        ? prev
        : [...prev, { value, label: trimmed }],
    );
    setCategory(value);
    toast.success("Category added", `"${trimmed}" is available to select.`);
  };

  const handleCancel = () => {
    router.push("/dashboard/regulatory-compliance/calendar");
  };

  const clearPdf = () => {
    setFile(null);
    setPdfSecureUrl(null);
    setFileError(null);
  };

  const handleFileChange = async (next: File | null) => {
    if (!next) {
      clearPdf();
      return;
    }

    if (!isPdfFile(next)) {
      clearPdf();
      setFileError("Only PDF files are allowed.");
      return;
    }

    if (next.size > CLOUDINARY_MAX_BYTES) {
      clearPdf();
      setFileError("File must be 50MB or smaller.");
      return;
    }

    if (!isCloudinaryPublicConfigReady()) {
      clearPdf();
      setFileError(
        "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
      );
      return;
    }

    setFile(next);
    setPdfSecureUrl(null);
    setFileError(null);
    setIsUploadingPdf(true);
    toast.info("Uploading PDF…", "Transferring to Cloudinary server.");

    try {
      const result = await uploadFileToCloudinary(next);
      if (result.kind !== "pdf" && !next.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("Only PDF documents can be uploaded.");
      }
      const originalName = next.name.trim() || result.name;
      const secureUrl = withAttachmentDisplayName(
        result.secureUrl,
        originalName,
      );
      setPdfSecureUrl(secureUrl);
      toast.success("PDF uploaded", `"${originalName}" is ready to submit.`);
    } catch (error: unknown) {
      clearPdf();
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload PDF to Cloudinary.";
      setFileError(message);
      toast.error("Upload failed", message);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUploadingPdf) {
      toast.error("Still uploading", "Wait for the PDF upload to finish.");
      return;
    }
    if (!file || !pdfSecureUrl) {
      setFileError("Please upload a PDF document.");
      return;
    }
    if (!title.trim()) {
      toast.error("Missing title", "Compliance obligation title is required.");
      return;
    }
    if (!category) {
      toast.error("Missing category", "Select a category.");
      return;
    }
    if (!dueDate) {
      toast.error("Missing due date", "Select a due date.");
      return;
    }
    if (!responsiblePerson) {
      toast.error(
        "Missing responsible person",
        "Select who owns this obligation.",
      );
      return;
    }

    const responsiblePersonId = Number(responsiblePerson);
    if (!Number.isFinite(responsiblePersonId) || responsiblePersonId <= 0) {
      toast.error(
        "Invalid responsible person",
        "Select a valid user from the list.",
      );
      return;
    }

    addComplianceMutation.mutate(
      buildAddComplianceRequest({
        title,
        category: optionLabel(categoryOptions, category),
        code,
        jurisdiction,
        regulatoryBody: optionLabel(REGULATORY_BODY_OPTIONS, regulatoryBody),
        dueDate,
        recurrence: optionLabel(RECURRENCE_OPTIONS, recurrence),
        responsiblePersonId,
        priority,
        evidenceUrls: [pdfSecureUrl],
      }),
      {
        onSuccess: () => {
          toast.success(
            "Compliance obligation added",
            `${title.trim()} was saved.`,
          );
          router.push("/dashboard/regulatory-compliance/calendar");
        },
        onError: (error) => {
          toast.error(
            "Could not save compliance item",
            getMutationErrorMessage(error, "Please try again."),
          );
        },
      },
    );
  };

  const isSubmitting = addComplianceMutation.isPending;
  const busy = isSubmitting || isUploadingPdf;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full min-w-0 sm:max-w-3xl lg:max-w-5xl"
    >
      <IncidentGlassCard
        paddingClassName="p-6"
        className="bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]"
      >
        <div className="flex w-full min-w-0 flex-col gap-5">
          <TextInput
            label="Title *"
            placeholder="Compliance obligation title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            disabled={busy}
            labelClassName={fieldLabelClass}
            wrapperClassName={fieldWrapperClass}
            className={controlClass}
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <CreatableSelectInput
              label="Category *"
              placeholder="Select an option"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              onCreate={handleAddCategory}
              createLabel="Add category"
              createPlaceholder="New category name…"
              required
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
            />

            <SelectInput
              label="Regulatory Body"
              placeholder="Select an option"
              options={REGULATORY_BODY_OPTIONS}
              value={regulatoryBody}
              onChange={(event) => setRegulatoryBody(event.target.value)}
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />

            <div className={fieldWrapperClass}>
              <label htmlFor="obligation-due-date" className={fieldLabelClass}>
                Due Date *
              </label>
              <div className="relative">
                <input
                  id="obligation-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  required
                  disabled={busy}
                  className={[
                    "text-ehs-dark-bg border-ehs-border w-full appearance-none rounded-[10px] border-[0.8px] bg-[#eef1f6] px-3 py-2 text-[14px] outline-none",
                    "focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 focus:ring-2",
                    "h-9 sm:h-[36px]",
                  ].join(" ")}
                />
                <Icon
                  icon="mdi:calendar-month-outline"
                  className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-base"
                  aria-hidden="true"
                />
              </div>
            </div>

            <SelectInput
              label="Recurrence"
              placeholder="Select an option (weekly/monthly)"
              options={RECURRENCE_OPTIONS}
              value={recurrence}
              onChange={(event) => setRecurrence(event.target.value)}
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />

            <SelectInput
              label="Responsible Person *"
              placeholder={
                usersQuery.isLoading ? "Loading users…" : "Select an option"
              }
              options={userOptions}
              value={responsiblePerson}
              onChange={(event) => setResponsiblePerson(event.target.value)}
              required
              disabled={busy || usersQuery.isLoading}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />

            <SelectInput
              label="Priority"
              placeholder="Select an option"
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />

            <SelectInput
              label="Jurisdiction"
              placeholder="Select an option"
              options={JURISDICTION_OPTIONS}
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />

            <TextInput
              label="Code"
              placeholder="Enter Compliance Code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />
          </div>

          <UploadDocumentDropzone
            file={file}
            error={fileError}
            isUploading={isUploadingPdf}
            uploadedLabel={pdfSecureUrl ? "Uploaded" : null}
            onFileChange={(next) => {
              void handleFileChange(next);
            }}
          />

          <div className="flex flex-col-reverse items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleCancel}
              disabled={busy}
              className="h-9 w-full rounded-[10px] px-4 text-[14px] font-medium shadow-none sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={busy || !pdfSecureUrl}
              className="h-[38px] w-full rounded-[10px] px-4 text-[14px] font-medium whitespace-nowrap sm:w-auto"
            >
              {isUploadingPdf
                ? "Uploading PDF…"
                : isSubmitting
                  ? "Saving…"
                  : "Save Compliance Item"}
            </Button>
          </div>
        </div>
      </IncidentGlassCard>
    </form>
  );
}
