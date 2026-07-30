"use client";

import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { CreatableSelectInput } from "@/components/inputs/CreatableSelectInput";
import { MultiSelectInput } from "@/components/inputs/MultiSelectInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { EditDocumentFileCard } from "@/components/policy-maker/edit/EditDocumentFileCard";
import { documentFileName } from "@/components/policy-maker/edit/edit-document-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useAddDocumentCategoryMutation,
  useAddDocumentDepartmentMutation,
  useCreateDocumentMutation,
  useCreateDocumentVersionMutation,
} from "@/hooks/use-document-mutations";
import {
  useDocumentCategoriesQuery,
  useDocumentDepartmentsQuery,
} from "@/hooks/use-document-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import {
  categoryOptionLabel,
  departmentOptionLabel,
} from "@/services/mappers/document-list.mapper";
import { getAuthContext } from "@/lib/auth-context";
import {
  CLOUDINARY_MAX_BYTES,
  formatFileSize,
  isPdfMimeType,
} from "@/lib/cloudinary-constants";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";

export type EditDocumentFormProps = Readonly<{
  document: PolicyDocument;
}>;

const fieldLabelClass =
  "block text-[12px] leading-normal font-semibold text-[#566072]";
const fieldWrapperClass = "flex w-full min-w-0 flex-col gap-1.5";
const controlClass =
  "!h-auto !min-w-0 !rounded-lg !border !border-[rgba(11,19,32,0.1)] !bg-white !px-3 !py-2.5 !text-[14px] !leading-normal !text-[#0b1320] !shadow-none focus:!border-[#0891a6] focus:!ring-[#0891a6]/20";

/** API expects years as a number string (e.g. `"1"` for 1 Year) — matches Upload. */
const REVIEW_CYCLE_OPTIONS = [
  { value: "0.5", label: "6 Months" },
  { value: "1", label: "1 Year" },
  { value: "2", label: "2 Years" },
  { value: "3", label: "3 Years" },
] as const;

/** Figma 5568:25826 — 800px card; grows like upload on larger breakpoints. */
const glassCardClass =
  "relative w-full min-w-0 max-w-full overflow-hidden rounded-[16px] border-[0.973px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[16px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:max-w-3xl lg:max-w-[800px] xl:max-w-5xl";

function isPdfFile(file: File): boolean {
  return isPdfMimeType(file.type) || file.name.toLowerCase().endsWith(".pdf");
}

/** "v3.1" -> "v3.2". Falls back to the original string if it doesn't parse. */
function incrementVersionLabel(version: string): string {
  const match = /^v?(\d+)\.(\d+)$/i.exec(version.trim());
  if (!match) {
    return version;
  }
  const [, major, minor] = match;
  return `v${major ?? "1"}.${String(Number(minor ?? "0") + 1)}`;
}

/**
 * Edit form card (Figma 5568:25826).
 * Saves in two steps: document metadata (title/category/department/reviewCycle)
 * goes through the same POST /api/Document/document endpoint Upload uses (the
 * backend upserts on `id`); the attached PDF is saved as a new revision via
 * POST /api/Document/document_version, which carries no metadata fields.
 */
export function EditDocumentForm(props: Readonly<EditDocumentFormProps>) {
  const { document } = props;
  const router = useRouter();

  const createDocumentMutation = useCreateDocumentMutation();
  const createDocumentVersionMutation = useCreateDocumentVersionMutation();
  const addCategoryMutation = useAddDocumentCategoryMutation();
  const addDepartmentMutation = useAddDocumentDepartmentMutation();
  const categoriesQuery = useDocumentCategoriesQuery();
  const departmentsQuery = useDocumentDepartmentsQuery();
  const usersQuery = useUserDropdownQuery();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const title = document.title;
  const [categoryId, setCategoryId] = useState(
    document.categoryId != null ? String(document.categoryId) : "",
  );
  const [departmentId, setDepartmentId] = useState(
    document.departmentId != null ? String(document.departmentId) : "",
  );
  const [reviewCycle, setReviewCycle] = useState(document.reviewCycle ?? "1");
  const [ackUserIds, setAckUserIds] = useState<string[]>([
    ...(document.ackUserIds ?? []),
  ]);
  const [approverIds, setApproverIds] = useState<string[]>([
    ...(document.approverIds ?? []),
  ]);
  const [versionNotes, setVersionNotes] = useState("");
  const [submitAsNewVersion, setSubmitAsNewVersion] = useState(true);
  const titleInputId = useId();
  const versionNotesId = useId();

  const nextVersionLabel = incrementVersionLabel(document.version);
  const currentFileName = documentFileName(document);
  const currentFileMeta =
    document.fileSize === "—"
      ? `${document.version} · Current version attached`
      : `${document.fileSize} · ${document.version} · Current version attached`;

  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data ?? []).flatMap((category) => {
        const id = category.categoryId ?? category.id;
        if (id == null) {
          return [];
        }
        return [{ value: String(id), label: categoryOptionLabel(category) }];
      }),
    [categoriesQuery.data],
  );

  const departmentOptions = useMemo(
    () =>
      (departmentsQuery.data ?? []).flatMap((department) => {
        const id = department.departmentId ?? department.id;
        if (id == null) {
          return [];
        }
        return [
          { value: String(id), label: departmentOptionLabel(department) },
        ];
      }),
    [departmentsQuery.data],
  );

  const userOptions = useMemo(
    () => toAssigneeOptions(usersQuery.data?.dataModel ?? []),
    [usersQuery.data?.dataModel],
  );

  useEffect(() => {
    if (categoriesQuery.isError) {
      toast.error(
        "Could not load categories",
        getMutationErrorMessage(
          categoriesQuery.error,
          "Failed to load document categories.",
        ),
      );
    }
  }, [categoriesQuery.isError, categoriesQuery.error]);

  useEffect(() => {
    if (departmentsQuery.isError) {
      toast.error(
        "Could not load departments",
        getMutationErrorMessage(
          departmentsQuery.error,
          "Failed to load document departments.",
        ),
      );
    }
  }, [departmentsQuery.isError, departmentsQuery.error]);

  const handleCancel = () => {
    router.push(`/dashboard/policy-maker/${encodeURIComponent(document.id)}`);
  };

  const handleAddCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Missing name", "Enter a category name.");
      throw new Error("Category name is required.");
    }
    if (trimmed.length > 100) {
      toast.error(
        "Name too long",
        "Category name must be 100 characters or fewer.",
      );
      throw new Error("Category name is too long.");
    }

    try {
      await addCategoryMutation.mutateAsync({ categorytName: trimmed });
      toast.success("Category added", `"${trimmed}" is available to select.`);
      const refreshed = await categoriesQuery.refetch();
      const match = (refreshed.data ?? []).find((category) => {
        const label = categoryOptionLabel(category);
        return label.toLowerCase() === trimmed.toLowerCase();
      });
      const id = match?.categoryId ?? match?.id;
      if (id != null) {
        setCategoryId(String(id));
      }
    } catch (error: unknown) {
      toast.error(
        "Could not add category",
        getMutationErrorMessage(error, "Please try again."),
      );
      throw error;
    }
  };

  const handleAddDepartment = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Missing name", "Enter a department name.");
      throw new Error("Department name is required.");
    }
    if (trimmed.length > 100) {
      toast.error(
        "Name too long",
        "Department name must be 100 characters or fewer.",
      );
      throw new Error("Department name is too long.");
    }

    try {
      await addDepartmentMutation.mutateAsync({ departmentName: trimmed });
      toast.success(
        "Department added",
        `"${trimmed}" is available to select.`,
      );
      const refreshed = await departmentsQuery.refetch();
      const match = (refreshed.data ?? []).find((department) => {
        const label = departmentOptionLabel(department);
        return label.toLowerCase() === trimmed.toLowerCase();
      });
      const id = match?.departmentId ?? match?.id;
      if (id != null) {
        setDepartmentId(String(id));
      }
    } catch (error: unknown) {
      toast.error(
        "Could not add department",
        getMutationErrorMessage(error, "Please try again."),
      );
      throw error;
    }
  };

  const handleReplaceFile = (next: File) => {
    if (!isPdfFile(next)) {
      setFileError("Only PDF files are allowed.");
      return;
    }
    if (next.size > CLOUDINARY_MAX_BYTES) {
      setFileError("File must be 50MB or smaller.");
      return;
    }
    setFile(next);
    setFileError(null);
    toast.success("File selected", `${next.name} will replace the current PDF.`);
  };

  const isSubmitting =
    createDocumentMutation.isPending || createDocumentVersionMutation.isPending;
  const isAddingCategory = addCategoryMutation.isPending;
  const isAddingDepartment = addDepartmentMutation.isPending;
  const busy = isSubmitting || isAddingCategory || isAddingDepartment;
  const lookupsLoading =
    categoriesQuery.isLoading ||
    departmentsQuery.isLoading ||
    usersQuery.isLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Missing title", "Document title is required.");
      return;
    }
    if (!categoryId) {
      toast.error("Missing category", "Select a category.");
      return;
    }
    if (!departmentId) {
      toast.error("Missing department", "Select a department.");
      return;
    }
    if (ackUserIds.length === 0) {
      toast.error(
        "Missing audience",
        "Select at least one user for acknowledgment tracking.",
      );
      return;
    }
    if (approverIds.length === 0) {
      toast.error("Missing approvers", "Select at least one approver.");
      return;
    }
    if (!file) {
      setFileError(
        "Select the PDF again to save — the same upload endpoint is used for edits and always needs a file.",
      );
      return;
    }

    const auth = getAuthContext();
    if (!auth) {
      toast.error("Sign in required", "Please sign in to save changes.");
      return;
    }

    const numericId = Number(document.id);
    const ackUserIdsCsv = ackUserIds.join(",");
    const approvalUserIdsCsv = approverIds.join(",");

    try {
      await createDocumentMutation.mutateAsync({
        id: numericId,
        title: title.trim(),
        categoryId: Number(categoryId),
        departmentId: Number(departmentId),
        pdfFile: file,
        reviewCycle,
        createdBy: auth.userId,
        subCompanyId: auth.subCompanyId,
        ackUserIds: ackUserIdsCsv,
        approvalUserIds: approvalUserIdsCsv,
      });

      if (submitAsNewVersion) {
        await createDocumentVersionMutation.mutateAsync({
          documentId: numericId,
          pdfFile: file,
          uploadedBy: auth.userId,
          ackUserIds: ackUserIdsCsv,
          approvalUserIds: approvalUserIdsCsv,
        });
      }

      toast.success(
        "Changes saved",
        submitAsNewVersion
          ? `${title.trim()} was updated — ${nextVersionLabel} created.`
          : `${title.trim()} was updated.`,
      );
      router.push(`/dashboard/policy-maker/${encodeURIComponent(document.id)}`);
    } catch (error: unknown) {
      toast.error(
        "Could not save changes",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={glassCardClass} noValidate>
      <div className="relative z-1 flex min-w-0 flex-col gap-5 px-4 pt-3.5 pb-6 sm:gap-5 sm:px-7 sm:pt-3.5 sm:pb-7">
        <EditDocumentFileCard
          fileName={file ? file.name : currentFileName}
          fileMeta={
            file
              ? `${formatFileSize(file.size)} · Replacement selected`
              : currentFileMeta
          }
          onReplaceFile={handleReplaceFile}
        />
        {fileError ? (
          <p className="-mt-3 text-[12px] text-[#ef4444]">{fileError}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[560px]:gap-x-4 min-[560px]:gap-y-6">
          <div className={fieldWrapperClass}>
            <label htmlFor={titleInputId} className={fieldLabelClass}>
              Document Title *
            </label>
            <div className="relative">
              <input
                id={titleInputId}
                type="text"
                value={title}
                readOnly
                disabled={busy}
                aria-readonly="true"
                className={`${controlClass} !cursor-not-allowed !bg-[#eef1f6] !pr-9 !text-[#566072] italic`}
              />
              <Icon
                icon="mdi:lock-outline"
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#8892a3]"
                aria-hidden="true"
              />
            </div>
          </div>
          <CreatableSelectInput
            label="Category *"
            placeholder={
              categoriesQuery.isLoading
                ? "Loading categories…"
                : categoriesQuery.isError
                  ? "Failed to load categories"
                  : "Select Category"
            }
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            onCreate={handleAddCategory}
            createLabel="Add category"
            createPlaceholder="New category name…"
            required
            disabled={busy || categoriesQuery.isLoading}
            isCreating={isAddingCategory}
            maxCreateLength={100}
            labelClassName={fieldLabelClass}
            wrapperClassName={fieldWrapperClass}
          />
          <CreatableSelectInput
            label="Department *"
            placeholder={
              departmentsQuery.isLoading
                ? "Loading departments…"
                : departmentsQuery.isError
                  ? "Failed to load departments"
                  : "Select Department"
            }
            options={departmentOptions}
            value={departmentId}
            onChange={setDepartmentId}
            onCreate={handleAddDepartment}
            createLabel="Add department"
            createPlaceholder="New department name…"
            required
            disabled={busy || departmentsQuery.isLoading}
            isCreating={isAddingDepartment}
            maxCreateLength={100}
            labelClassName={fieldLabelClass}
            wrapperClassName={fieldWrapperClass}
          />
          <SelectInput
            label="Review Cycle *"
            placeholder="Select review cycle"
            options={REVIEW_CYCLE_OPTIONS}
            value={reviewCycle}
            onChange={(event) => setReviewCycle(event.target.value)}
            required
            disabled={busy}
            labelClassName={fieldLabelClass}
            wrapperClassName={fieldWrapperClass}
            className={controlClass}
          />
          <MultiSelectInput
            label={
              <>
                <span className="sm:hidden">Audience *</span>
                <span className="hidden sm:inline">
                  Audience (for acknowledgment tracking) *
                </span>
              </>
            }
            placeholder={
              usersQuery.isLoading ? "Loading users…" : "Select audience"
            }
            options={userOptions}
            value={ackUserIds}
            onChange={setAckUserIds}
            required
            disabled={busy || userOptions.length === 0}
            labelClassName={fieldLabelClass}
            wrapperClassName={fieldWrapperClass}
          />
          <MultiSelectInput
            label="Approvers *"
            placeholder={
              usersQuery.isLoading ? "Loading users…" : "Select approvers"
            }
            options={userOptions}
            value={approverIds}
            onChange={setApproverIds}
            required
            disabled={busy || userOptions.length === 0}
            labelClassName={fieldLabelClass}
            wrapperClassName={fieldWrapperClass}
          />
        </div>

        <div className={fieldWrapperClass}>
          <label htmlFor={versionNotesId} className={fieldLabelClass}>
            Version Notes
          </label>
          <textarea
            id={versionNotesId}
            value={versionNotes}
            onChange={(event) => setVersionNotes(event.target.value)}
            placeholder="Describe what changed in this version…"
            rows={3}
            disabled={busy}
            className={`${controlClass} !h-auto resize-none`}
          />
        </div>

        <label className="flex w-fit items-center gap-2 text-[13px] font-medium text-[#0b1320]">
          <input
            type="checkbox"
            checked={submitAsNewVersion}
            onChange={(event) => setSubmitAsNewVersion(event.target.checked)}
            disabled={busy}
            className="size-4 rounded border-[rgba(11,19,32,0.2)] accent-[#0891a6]"
          />
          {`Submit as new version (creates ${nextVersionLabel})`}
        </label>

        <div className="flex flex-col-reverse items-stretch gap-3 pt-2.5 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="tertiary"
            onClick={handleCancel}
            disabled={busy}
            className="h-auto w-full rounded-lg border border-[rgba(11,19,32,0.1)] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#566072] shadow-none hover:bg-[#eef1f6] sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={busy || lookupsLoading}
            className="h-auto w-full rounded-lg bg-[#0891a6] px-6 py-2.5 text-[14px] font-semibold whitespace-nowrap shadow-none hover:bg-[#078196] sm:w-auto"
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
