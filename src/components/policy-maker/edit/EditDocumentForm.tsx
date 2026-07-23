"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { TextInput } from "@/components/inputs/TextInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { EditDocumentFileCard } from "@/components/policy-maker/edit/EditDocumentFileCard";
import {
  documentFileName,
  mapDocumentKindToCategory,
  nextDocumentVersion,
} from "@/components/policy-maker/edit/edit-document-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { toast } from "@/lib/toast";

export type EditDocumentFormProps = Readonly<{
  document: PolicyDocument;
}>;

const fieldLabelClass =
  "block text-[12px] leading-normal font-semibold text-[#566072]";
const fieldWrapperClass = "flex w-full min-w-0 flex-col gap-1.5";
const controlClass =
  "!h-auto !min-w-0 !rounded-lg !border !border-[rgba(11,19,32,0.1)] !bg-white !px-3 !py-2.5 !text-[14px] !leading-normal !text-[#0b1320] !shadow-none focus:!border-[#0891a6] focus:!ring-[#0891a6]/20";

const CATEGORY_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "policy", label: "Policy" },
  { value: "procedure", label: "Procedure" },
  { value: "sop", label: "SOP" },
  { value: "form", label: "Form" },
  { value: "training", label: "Training" },
] as const;

const DEPARTMENT_OPTIONS = [
  { value: "Production", label: "Production" },
  { value: "EHS", label: "EHS" },
  { value: "Operations", label: "Operations" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Training", label: "Training" },
  { value: "Logistics", label: "Logistics" },
] as const;

const REVIEW_CYCLE_OPTIONS = [
  { value: "6-months", label: "6 Months" },
  { value: "1-year", label: "1 Year" },
  { value: "2-years", label: "2 Years" },
  { value: "3-years", label: "3 Years" },
] as const;

const AUDIENCE_OPTIONS = [
  { value: "ehs-team", label: "EHS Team" },
  { value: "all-employees", label: "All employees" },
  { value: "production", label: "Production" },
  { value: "contractors", label: "Contractors" },
] as const;

const APPROVER_OPTIONS = [
  { value: "sarah-mitchell", label: "Sarah Mitchell, VP EHS" },
  { value: "mike-rivera", label: "Mike Rivera" },
  { value: "priya-mehra", label: "Priya Mehra" },
  { value: "alex-kim", label: "Alex Kim" },
] as const;

/** Figma 5568:25826 — 800px card; grows like upload on larger breakpoints. */
const glassCardClass =
  "relative w-full min-w-0 max-w-full overflow-hidden rounded-[16px] border-[0.973px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[16px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:max-w-3xl lg:max-w-[800px] xl:max-w-5xl";

/**
 * Edit form card (Figma 5568:25826).
 */
export function EditDocumentForm(props: Readonly<EditDocumentFormProps>) {
  const { document } = props;
  const router = useRouter();

  const [fileName, setFileName] = useState(documentFileName(document));
  const [fileMeta, setFileMeta] = useState(
    `${document.fileSize} · Current version attached`,
  );
  const [title, setTitle] = useState(document.title);
  const [category, setCategory] = useState(
    mapDocumentKindToCategory(document.documentKind),
  );
  const [department, setDepartment] = useState(document.department);
  const [reviewCycle, setReviewCycle] = useState("1-year");
  const [audience, setAudience] = useState("ehs-team");
  const [approvers, setApprovers] = useState("sarah-mitchell");
  const [versionNotes, setVersionNotes] = useState(
    "Added updated safety lock configuration schematics and streamlined steps 4-7 to improve emergency reaction times.",
  );
  const [submitAsNewVersion, setSubmitAsNewVersion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upcomingVersion = nextDocumentVersion(document.version);

  const handleCancel = () => {
    router.push(`/dashboard/policy-maker/${encodeURIComponent(document.id)}`);
  };

  const handleReplaceFile = (file: File) => {
    setFileName(file.name);
    setFileMeta(
      `${(file.size / (1024 * 1024)).toFixed(1)} MB · Replacement selected`,
    );
    toast.success("File selected", `${file.name} will replace the current PDF.`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Missing title", "Document title is required.");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        "Changes saved",
        submitAsNewVersion
          ? `${title.trim()} saved as ${upcomingVersion}.`
          : `${title.trim()} was updated.`,
      );
      router.push(`/dashboard/policy-maker/${encodeURIComponent(document.id)}`);
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className={glassCardClass} noValidate>
      <div className="relative z-1 flex min-w-0 flex-col gap-5 px-4 pt-3.5 pb-6 sm:gap-5 sm:px-7 sm:pt-3.5 sm:pb-7">
        <EditDocumentFileCard
          fileName={fileName}
          fileMeta={fileMeta}
          onReplaceFile={handleReplaceFile}
        />

        <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[560px]:gap-x-4 min-[560px]:gap-y-6">
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
          <SelectInput
            label="Department *"
            placeholder="Select department"
            options={DEPARTMENT_OPTIONS}
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
                  Audience for Acknowledgment *
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
          <SelectInput
            label="Approvers *"
            placeholder="Select approvers"
            options={APPROVER_OPTIONS}
            value={approvers}
            onChange={(event) => setApprovers(event.target.value)}
            required
            labelClassName={fieldLabelClass}
            wrapperClassName={fieldWrapperClass}
            className={controlClass}
          />
        </div>

        <div className={fieldWrapperClass}>
          <label htmlFor="version-notes" className={fieldLabelClass}>
            Version Notes
          </label>
          <textarea
            id="version-notes"
            value={versionNotes}
            onChange={(event) => setVersionNotes(event.target.value)}
            rows={3}
            className="min-h-[80px] w-full resize-y rounded-lg border border-[rgba(11,19,32,0.1)] bg-white p-3 text-[14px] text-[#566072] shadow-none outline-none focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <span
            className={[
              "inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors",
              submitAsNewVersion
                ? "border-[#0891a6] bg-[#0891a6]"
                : "border-[rgba(11,19,32,0.2)] bg-white",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={submitAsNewVersion}
              onChange={(event) => setSubmitAsNewVersion(event.target.checked)}
              className="sr-only"
            />
            {submitAsNewVersion ? (
              <Icon
                icon="mdi:check"
                className="size-3 text-white"
                aria-hidden="true"
              />
            ) : null}
          </span>
          <Text as="span" className="text-[14px] font-medium text-[#0b1320]">
            {`Submit as new version (creates ${upcomingVersion})`}
          </Text>
        </label>

        <div className="flex flex-col-reverse items-stretch gap-3 pt-2.5 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="tertiary"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="h-auto w-full rounded-lg border border-[rgba(11,19,32,0.1)] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#566072] shadow-none hover:bg-[#eef1f6] sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="h-auto w-full rounded-lg bg-[#0891a6] px-6 py-2.5 text-[14px] font-semibold whitespace-nowrap shadow-none hover:bg-[#078196] sm:w-auto"
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
