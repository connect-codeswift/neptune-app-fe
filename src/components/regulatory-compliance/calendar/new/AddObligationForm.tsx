"use client";

import { Icon } from "@iconify/react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  SelectInput,
  type SelectOption,
} from "@/components/inputs/SelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import { UploadDocumentDropzone } from "@/components/policy-maker";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useAddComplianceMutation } from "@/hooks/use-compliance-mutations";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { getFileMaxBytes, isPdfMimeType } from "@/lib/files";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import { uploadFile } from "@/lib/upload-file";
import { buildAddComplianceRequest } from "@/services/mappers/compliance.mapper";

const fieldLabelClass = "block text8 font-semibold text-ehs-gray";
const fieldWrapperClass = "flex w-full min-w-0 flex-col gap-1";
const fieldShellClass =
  "text4 !min-w-0 !rounded-2.5 !border !border-ehs-border-ink/10 !bg-ehs-form-classes-bg !px-3 !py-2 !shadow-none focus:!border-ehs-normal-blue focus:!ring-2 focus:!ring-ehs-normal-blue/20";
const textFieldClass = [
  fieldShellClass,
  "!text-ehs-dark-bg placeholder:!text-ehs-muted-text",
].join(" ");
const selectFieldClass = [fieldShellClass, "!h-9"].join(" ");
const dateFieldClass = [
  fieldShellClass,
  "!h-[38px] !w-full appearance-none pr-10",
  "[&::-webkit-calendar-picker-indicator]:hidden",
  "[&::-webkit-datetime-edit]:text-inherit",
  "[&::-webkit-datetime-edit-fields-wrapper]:text-inherit",
  "[&::-webkit-datetime-edit-text]:text-inherit",
  "[&::-webkit-datetime-edit-month-field]:text-inherit",
  "[&::-webkit-datetime-edit-day-field]:text-inherit",
  "[&::-webkit-datetime-edit-year-field]:text-inherit",
].join(" ");
const titleFieldClass = [
  fieldShellClass,
  "!h-[38px] !text-ehs-dark-bg placeholder:!text-ehs-muted-text",
].join(" ");

const formCardClass =
  "relative w-full rounded-4 border border-ehs-hairline/90 bg-ehs-surface/62 p-6 shadow-(--ehs-shadow-panel) backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-4";

/** Figma EHSS-Web node 3326:20854 — stash:data-date */
function openDatePicker(input: HTMLInputElement | null) {
  if (!input || input.disabled) {
    return;
  }

  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
      return;
    } catch {
      // Fall through when showPicker is blocked.
    }
  }

  input.focus();
  input.click();
}

const CATEGORY_OPTIONS: readonly SelectOption[] = [
  { value: "Regulatory", label: "Regulatory" },
  { value: "Safety", label: "Safety" },
  { value: "Health", label: "Health" },
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
  { value: "One-time", label: "One-time" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Annually", label: "Annually" },
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

function optionLabel(options: readonly SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function AddObligationForm() {
  const router = useRouter();
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const usersQuery = useUserDropdownQuery();
  const addComplianceMutation = useAddComplianceMutation();
  // Held past the response: `isPending` drops when the record is created,
  // while the push to the next page is still in flight. A click in that gap
  // saved a duplicate.
  const submitLock = useSubmitLock();

  const [title, setTitle] = useState("");
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

    if (next.size > getFileMaxBytes("Document")) {
      clearPdf();
      setFileError("File must be 50MB or smaller.");
      return;
    }

    setFile(next);
    setPdfSecureUrl(null);
    setFileError(null);
    setIsUploadingPdf(true);
    toast.info("Uploading PDF…", "Transferring to secure storage.");

    try {
      const result = await uploadFile(next, { module: "Document" });
      if (result.kind !== "pdf" && !next.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("Only PDF documents can be uploaded.");
      }
      const originalName = next.name.trim() || result.name;
      setPdfSecureUrl(result.fileId);
      toast.success("PDF uploaded", `"${originalName}" is ready to submit.`);
    } catch (error: unknown) {
      clearPdf();
      const message =
        error instanceof Error ? error.message : "Failed to upload PDF.";
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
    // The form is noValidate, so `min` on the input only greys the calendar
    // out — a typed or pasted date still reaches here.
    if (dueDate < todayInputValue()) {
      toast.error("Due date in the past", "Pick today or a later date.");
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

    if (!submitLock.acquire()) {
      return;
    }

    addComplianceMutation.mutate(
      buildAddComplianceRequest({
        title,
        category,
        code,
        jurisdiction,
        regulatoryBody: optionLabel(REGULATORY_BODY_OPTIONS, regulatoryBody),
        dueDate,
        recurrence,
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
          submitLock.release();
          toast.error(
            "Could not save compliance item",
            getMutationErrorMessage(error, "Please try again."),
          );
        },
      },
    );
  };

  const isSubmitting = submitLock.isLocked;
  const busy = isSubmitting || isUploadingPdf;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative w-full max-w-186 min-w-0"
    >
      <div className={formCardClass}>
        <div className="relative z-1 flex w-full min-w-0 flex-col gap-4">
          <TextInput
            label="Title *"
            placeholder="Compliance obligation title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            disabled={busy}
            labelClassName={fieldLabelClass}
            wrapperClassName={fieldWrapperClass}
            className={titleFieldClass}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectInput
              label="Category *"
              placeholder="Select an option ()"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={selectFieldClass}
            />

            <SelectInput
              label="Regulatory Body"
              placeholder="Select an option ()"
              options={REGULATORY_BODY_OPTIONS}
              value={regulatoryBody}
              onChange={(event) => setRegulatoryBody(event.target.value)}
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={selectFieldClass}
            />

            <div className={fieldWrapperClass}>
              <label htmlFor="obligation-due-date" className={fieldLabelClass}>
                Due Date *
              </label>
              <div className="relative w-full">
                <input
                  ref={dueDateInputRef}
                  id="obligation-due-date"
                  type="date"
                  value={dueDate}
                  // An obligation is a deadline, so today is the earliest one
                  // that means anything — POST /api/Compliance rejects the rest.
                  min={todayInputValue()}
                  onChange={(event) => setDueDate(event.target.value)}
                  required
                  disabled={busy}
                  className={[
                    dateFieldClass,
                    dueDate ? "!text-ehs-dark-bg" : "!text-ehs-muted-text",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => openDatePicker(dueDateInputRef.current)}
                  disabled={busy}
                  aria-label="Open calendar"
                  className="absolute top-1/2 right-2 size-6 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon
                    icon="stash:data-date"
                    className="text-ehs-gray size-6"
                    aria-hidden="true"
                  />
                </button>
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
              className={selectFieldClass}
            />

            <SelectInput
              label="Responsible Person *"
              placeholder={
                usersQuery.isLoading ? "Loading users…" : "Select an option ()"
              }
              options={userOptions}
              value={responsiblePerson}
              onChange={(event) => setResponsiblePerson(event.target.value)}
              required
              disabled={busy || usersQuery.isLoading}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={selectFieldClass}
            />

            <SelectInput
              label="Priority"
              placeholder="Select an option ()"
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={selectFieldClass}
            />

            <SelectInput
              label="Jurisdiction"
              placeholder="Select an option ()"
              options={JURISDICTION_OPTIONS}
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={selectFieldClass}
            />

            <TextInput
              label="Code"
              placeholder="Enter Compliance Code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={[textFieldClass, "!h-9"].join(" ")}
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

          <div className="flex flex-col-reverse items-stretch gap-4 pt-1 sm:flex-row sm:items-center sm:justify-end sm:gap-6.75">
            <button
              type="button"
              onClick={handleCancel}
              disabled={busy}
              className="text4 text-ehs-gray hover:text-ehs-dark-bg cursor-pointer text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !pdfSecureUrl}
              className="text4 rounded-2.5 bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-dark-blue inline-flex h-9 min-w-49.25 cursor-pointer items-center justify-center px-4 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.25)] drop-shadow-[0px_6px_9px_color-mix(in_oklab,var(--ehs-normal-blue)_10%,transparent)] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploadingPdf
                ? "Uploading PDF…"
                : isSubmitting
                  ? "Saving…"
                  : "Save Compliance Item"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
