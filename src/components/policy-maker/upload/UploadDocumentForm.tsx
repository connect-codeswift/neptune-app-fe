"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CreatableSelectInput } from "@/components/inputs/CreatableSelectInput";
import { MultiSelectInput } from "@/components/inputs/MultiSelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { UploadDocumentDropzone } from "@/components/policy-maker/upload/UploadDocumentDropzone";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useAddDocumentCategoryMutation,
  useAddDocumentDepartmentMutation,
  useCreateDocumentMutation,
} from "@/hooks/use-document-mutations";
import {
  useDocumentCategoriesQuery,
  useDocumentDepartmentsQuery,
} from "@/hooks/use-document-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { withAttachmentDisplayName } from "@/lib/attachment-url";
import { getAuthContext } from "@/lib/auth-context";
import {
  CLOUDINARY_MAX_BYTES,
  isCloudinaryPublicConfigReady,
  isPdfMimeType,
} from "@/lib/cloudinary-constants";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";

const fieldLabelClass =
  "block text-[12px] leading-4 font-medium text-[#566072]";
const fieldWrapperClass = "flex w-full min-w-0 flex-col gap-1";
const controlClass =
  "!h-9 !min-w-0 !rounded-[10px] !border-[0.8px] !border-[rgba(15,23,42,0.1)] !bg-[#eef1f6] !px-3 !py-2 !text-[14px] !shadow-none focus:!border-[#0891a6] focus:!ring-[#0891a6]/20 sm:!h-[36px]";

/** API expects years as a number string (e.g. `"1"` for 1 Year). */
const REVIEW_CYCLE_OPTIONS = [
  { value: "0.5", label: "6 Months" },
  { value: "1", label: "1 Year" },
  { value: "2", label: "2 Years" },
  { value: "3", label: "3 Years" },
] as const;

const glassCardClass =
  "relative w-full min-w-0 max-w-full overflow-hidden rounded-[16px] border-[0.8px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[16px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:max-w-3xl lg:max-w-5xl";

function isPdfFile(file: File): boolean {
  return isPdfMimeType(file.type) || file.name.toLowerCase().endsWith(".pdf");
}

function categoryOptionLabel(category: {
  categorytName?: string | null;
  categoryName?: string | null;
  name?: string | null;
  id?: number;
  categoryId?: number;
}): string {
  return (
    category.categoryName?.trim() ||
    category.categorytName?.trim() ||
    category.name?.trim() ||
    `Category ${String(category.categoryId ?? category.id ?? "")}`
  );
}

function departmentOptionLabel(department: {
  departmentName?: string | null;
  name?: string | null;
  id?: number;
  departmentId?: number;
}): string {
  return (
    department.departmentName?.trim() ||
    department.name?.trim() ||
    `Department ${String(department.departmentId ?? department.id ?? "")}`
  );
}

/**
 * Upload form card — dropzone + fields + actions (Figma 5568:24714).
 * PDF goes to Cloudinary for preview; submit posts multipart to /Document/document.
 */
export function UploadDocumentForm() {
  const router = useRouter();
  const createDocumentMutation = useCreateDocumentMutation();
  const addCategoryMutation = useAddDocumentCategoryMutation();
  const addDepartmentMutation = useAddDocumentDepartmentMutation();
  const categoriesQuery = useDocumentCategoriesQuery();
  const departmentsQuery = useDocumentDepartmentsQuery();
  const usersQuery = useUserDropdownQuery();

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
      await addDepartmentMutation.mutateAsync({ departmentName: trimmed });
      toast.success("Department added", `"${trimmed}" is available to select.`);
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
      const message = getMutationErrorMessage(
        error,
        error instanceof Error
          ? error.message
          : "Failed to upload PDF to Cloudinary.",
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

    createDocumentMutation.mutate(
      {
        id: 1,
        title: title.trim(),
        categoryId: Number(categoryId),
        departmentId: Number(departmentId),
        pdfFile: file,
        reviewCycle,
        createdBy: auth.userId,
        subCompanyId: auth.subCompanyId,
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
          toast.error(
            "Could not upload document",
            getMutationErrorMessage(error, "Please try again."),
          );
        },
      },
    );
  };

  const isSubmitting = createDocumentMutation.isPending;
  const isAddingCategory = addCategoryMutation.isPending;
  const isAddingDepartment = addDepartmentMutation.isPending;
  const busy =
    isSubmitting || isUploadingPdf || isAddingCategory || isAddingDepartment;
  const lookupsLoading =
    categoriesQuery.isLoading ||
    departmentsQuery.isLoading ||
    usersQuery.isLoading;

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
              className={controlClass}
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

          <div className="flex flex-col-reverse items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleCancel}
              disabled={busy}
              className="h-9 w-full rounded-[10px] border border-[rgba(11,19,32,0.14)] px-4 text-[14px] font-medium text-[#0b1320] shadow-none sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={busy || !pdfSecureUrl || lookupsLoading}
              className="h-[38px] w-full rounded-[10px] bg-[#0891a6] px-4 text-[14px] font-medium whitespace-nowrap shadow-[0px_5.838px_17.514px_-5.838px_#0891a6] hover:bg-[#078196] sm:w-auto sm:min-w-[208px]"
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
