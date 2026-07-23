"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MultiSelectInput } from "@/components/inputs/MultiSelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { UploadDocumentDropzone } from "@/components/policy-maker/upload/UploadDocumentDropzone";
import { toast } from "@/lib/toast";

const fieldLabelClass =
  "block text-[12px] leading-4 font-medium text-[#566072]";
const fieldWrapperClass = "flex w-full min-w-0 flex-col gap-1";
const controlClass =
  "!h-9 !min-w-0 !rounded-[10px] !border-[0.8px] !border-[rgba(15,23,42,0.1)] !bg-[#eef1f6] !px-3 !py-2 !text-[14px] !shadow-none focus:!border-[#0891a6] focus:!ring-[#0891a6]/20 sm:!h-[36px]";

const CATEGORY_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "policy", label: "Policy" },
  { value: "procedure", label: "Procedure" },
  { value: "sop", label: "SOP" },
  { value: "form", label: "Form" },
  { value: "training", label: "Training" },
] as const;

const REVIEW_CYCLE_OPTIONS = [
  { value: "6-months", label: "6 Months" },
  { value: "1-year", label: "1 Year" },
  { value: "2-years", label: "2 Years" },
  { value: "3-years", label: "3 Years" },
] as const;

const AUDIENCE_OPTIONS = [
  { value: "ehs-team", label: "EHS team" },
  { value: "all-employees", label: "All employees" },
  { value: "production", label: "Production" },
  { value: "contractors", label: "Contractors" },
] as const;

const APPROVER_OPTIONS = [
  { value: "sarah-mitchell", label: "Sarah Mitchell" },
  { value: "mike-rivera", label: "Mike Rivera" },
  { value: "priya-mehra", label: "Priya Mehra" },
  { value: "alex-kim", label: "Alex Kim" },
] as const;

const glassCardClass =
  "relative w-full min-w-0 max-w-full overflow-hidden rounded-[16px] border-[0.8px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[16px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:max-w-3xl lg:max-w-5xl";

/**
 * Upload form card — dropzone + fields + actions (Figma 5568:24714).
 */
export function UploadDocumentForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("standard");
  const [department, setDepartment] = useState("Production");
  const [reviewCycle, setReviewCycle] = useState("1-year");
  const [audience, setAudience] = useState("ehs-team");
  const [approvers, setApprovers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    router.push("/dashboard/policy-maker");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setFileError("Please upload a PDF document.");
      return;
    }
    if (!title.trim()) {
      toast.error("Missing title", "Document title is required.");
      return;
    }
    if (approvers.length === 0) {
      toast.error("Missing approvers", "Select at least one approver.");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        "Upload started",
        `${title.trim()} was queued for approval.`,
      );
      router.push("/dashboard/policy-maker");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className={glassCardClass} noValidate>
      <div className="relative z-1 flex min-w-0 flex-col gap-4 p-3.5 sm:gap-5 sm:px-6 sm:pt-6 sm:pb-6 lg:gap-6 lg:px-8 lg:pt-8 lg:pb-8">
        <UploadDocumentDropzone
          file={file}
          error={fileError}
          onFileChange={(next) => {
            setFile(next);
            setFileError(null);
          }}
        />

        <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-5 lg:gap-6">
          <div className="grid grid-cols-1 gap-3.5 min-[800px]:grid-cols-2 sm:gap-4 lg:gap-x-6 lg:gap-y-5">
            <TextInput
              label="Document Title *"
              placeholder="Enter document title..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />
            <SelectInput
              label="Category *"
              placeholder="Select category"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />
            <TextInput
              label="Department *"
              placeholder="Enter department..."
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              required
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />
            <SelectInput
              label="Review Cycle *"
              placeholder="Select review cycle"
              options={REVIEW_CYCLE_OPTIONS}
              value={reviewCycle}
              onChange={(event) => setReviewCycle(event.target.value)}
              required
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />
            <SelectInput
              label={
                <>
                  <span className="sm:hidden">Audience *</span>
                  <span className="hidden sm:inline">
                    Audience (for acknowledgment tracking) *
                  </span>
                </>
              }
              placeholder="Select audience"
              options={AUDIENCE_OPTIONS}
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              required
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
              className={controlClass}
            />
            <MultiSelectInput
              label="Approvers *"
              placeholder="Select approvers"
              options={APPROVER_OPTIONS}
              value={approvers}
              onChange={setApprovers}
              required
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
            />
          </div>

          <div className="flex flex-col-reverse items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-9 w-full rounded-[10px] border border-[rgba(11,19,32,0.14)] px-4 text-[14px] font-medium text-[#0b1320] shadow-none sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="h-[38px] w-full rounded-[10px] bg-[#0891a6] px-4 text-[14px] font-medium whitespace-nowrap shadow-[0px_5.838px_17.514px_-5.838px_#0891a6] hover:bg-[#078196] sm:w-auto sm:min-w-[208px]"
            >
              {isSubmitting ? "Uploading…" : "Upload & Start Approval"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
