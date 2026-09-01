"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CreatableSelectInput } from "@/components/inputs/CreatableSelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { UploadDocumentDropzone } from "@/components/policy-maker/upload/UploadDocumentDropzone";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import {
  useAddDocumentCategoryMutation,
  useCreateDocumentMutation,
} from "@/hooks/use-document-mutations";
import { useDocumentCategoriesQuery } from "@/hooks/use-document-queries";
import { useDepartmentsQuery } from "@/hooks/use-department-queries";
import { useAddDepartmentMutation } from "@/hooks/use-department-mutations";
import { MultipleUsersPickerInput } from "@/components/inputs/MultipleUsersPickerInput";
import { useResolvedUserValues } from "@/hooks/use-user-options";
import {
  categoryOptionLabel,
  departmentOptionLabel,
} from "@/services/mappers/document-list.mapper";
import { getAuthContext } from "@/lib/auth-context";
import { getFileMaxBytes, isPdfMimeType } from "@/lib/files";
import { toast } from "@/lib/toast";
import { uploadFile } from "@/lib/upload-file";

const fieldLabelClass = "block text8 font-semibold text-ehs-gray";
const fieldWrapperClass = "flex w-full min-w-0 flex-col gap-1";

/** API expects years as a number string (e.g. `"1"` for 1 Year). */
const REVIEW_CYCLE_OPTIONS = [
  { value: "0.5", label: "6 Months" },
  { value: "1", label: "1 Year" },
  { value: "2", label: "2 Years" },
  { value: "3", label: "3 Years" },
] as const;

const glassCardClass =
  "relative w-full min-w-0 max-w-full overflow-hidden rounded-4 border border-ehs-hairline/90 bg-ehs-surface/62 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-4 before:content-[''] sm:max-w-3xl lg:max-w-5xl";

function isPdfFile(file: File): boolean {
  return isPdfMimeType(file.type) || file.name.toLowerCase().endsWith(".pdf");
}

/**
 * Upload form card — dropzone + fields + actions (Figma 5568:24714).
 * PDF goes to Cloudinary for preview; submit posts multipart to /Document/document.
 */
export function UploadDocumentForm() {
  const router = useRouter();
  const createDocumentMutation = useCreateDocumentMutation();
  // Held past the response: `isPending` drops when the record is created,
  // while the push to the next page is still in flight. A click in that gap
  // saved a duplicate.
  const submitLock = useSubmitLock();
  const addCategoryMutation = useAddDocumentCategoryMutation();
  const addDepartmentMutation = useAddDepartmentMutation();
  const categoriesQuery = useDocumentCategoriesQuery();
  const departmentsQuery = useDepartmentsQuery();

  const [file, setFile] = useState<File | null>(null);
  const [pdfSecureUrl, setPdfSecureUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [reviewCycle, setReviewCycle] = useState("1");
  const [ackUserIds, setAckUserIds] = useState<string[]>([]);
  const [approverIds, setApproverIds] = useState<string[]>([]);

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
      (departmentsQuery.data ?? []).map((department) => ({
        value: String(department.id),
        label: departmentOptionLabel(department),
      })),
    [departmentsQuery.data],
  );

  // Ids are what the payload carries; the pickers need names to label chips.
  const ackUsers = useResolvedUserValues(ackUserIds, { source: "org" });
  const approvers = useResolvedUserValues(approverIds, { source: "org" });

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
    router.push("/dashboard/policy-maker");
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
      await addDepartmentMutation.mutateAsync({ name: trimmed });
      toast.success("Department added", `"${trimmed}" is available to select.`);
      const refreshed = await departmentsQuery.refetch();
      const match = (refreshed.data ?? []).find((department) => {
        const label = departmentOptionLabel(department);
        return label.toLowerCase() === trimmed.toLowerCase();
      });
      if (match) {
        setDepartmentId(String(match.id));
      }
    } catch (error: unknown) {
      toast.error(
        "Could not add department",
        getMutationErrorMessage(error, "Please try again."),
      );
      throw error;
    }
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
      const message = getMutationErrorMessage(
        error,
        error instanceof Error ? error.message : "Failed to upload PDF.",
      );
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

    const auth = getAuthContext();
    if (!auth) {
      toast.error("Sign in required", "Please sign in to upload a document.");
      return;
    }

    if (!submitLock.acquire()) {
      return;
    }

    createDocumentMutation.mutate(
      {
        id: 1,
        title: title.trim(),
        categoryId: Number(categoryId),
        departmentId: Number(departmentId),
        pdfPath: pdfSecureUrl,
        fileName: file.name,
        reviewCycle,
        createdBy: auth.userId,
        siteId: auth.siteId,
        ackUserIds: ackUserIds.join(","),
        approvalUserIds: approverIds.join(","),
      },
      {
        onSuccess: () => {
          toast.success(
            "Document uploaded",
            `${title.trim()} was submitted for approval.`,
          );
          router.push("/dashboard/policy-maker");
        },
        onError: (error) => {
          submitLock.release();
          toast.error(
            "Could not upload document",
            getMutationErrorMessage(error, "Please try again."),
          );
        },
      },
    );
  };

  const isSubmitting = submitLock.isLocked;
  const isAddingCategory = addCategoryMutation.isPending;
  const isAddingDepartment = addDepartmentMutation.isPending;
  const busy =
    isSubmitting || isUploadingPdf || isAddingCategory || isAddingDepartment;
  const lookupsLoading =
    categoriesQuery.isLoading || departmentsQuery.isLoading;

  return (
    <form onSubmit={handleSubmit} className={glassCardClass} noValidate>
      <div className="relative z-1 flex min-w-0 flex-col gap-4 p-3.5 sm:gap-5 sm:px-6 sm:pt-6 sm:pb-6 lg:gap-6 lg:px-8 lg:pt-8 lg:pb-8">
        <UploadDocumentDropzone
          file={file}
          error={fileError}
          isUploading={isUploadingPdf}
          uploadedLabel={pdfSecureUrl ? "Uploaded" : null}
          onFileChange={(next) => {
            void handleFileChange(next);
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
              disabled={busy}
              labelClassName={fieldLabelClass}
              wrapperClassName={fieldWrapperClass}
            />
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
            />
            <MultipleUsersPickerInput
              label="Audience (for acknowledgment tracking)"
              required
              source="org"
              placeholder="Search people…"
              value={ackUsers}
              onChange={(next) => {
                setAckUserIds(next.map((entry) => entry.userId));
              }}
              disabled={busy}
            />
            <MultipleUsersPickerInput
              label="Approvers"
              required
              source="org"
              placeholder="Search people…"
              value={approvers}
              onChange={(next) => {
                setApproverIds(next.map((entry) => entry.userId));
              }}
              disabled={busy}
            />
          </div>

          <div className="flex flex-col-reverse items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleCancel}
              disabled={busy}
              className="text4 text-ehs-dark-bg rounded-2.5 border-ehs-border-ink/14 h-9 w-full border px-4 shadow-none sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={busy || !pdfSecureUrl || lookupsLoading}
              className="text4 rounded-2.5 bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover h-9.5 w-full px-4 whitespace-nowrap shadow-[0px_5.838px_17.514px_-5.838px_var(--ehs-normal-blue)] sm:w-auto sm:min-w-52"
            >
              {isUploadingPdf
                ? "Uploading PDF…"
                : isSubmitting
                  ? "Submitting…"
                  : "Upload & Start Approval"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
