import type {
  FormSchema,
  FormValues,
  SelectOption,
} from "@/components/form-builder";
import { HAZCOM_PICTOGRAMS } from "@/components/hazcom/shared";
import type { SafetyDataSheetRequestDto } from "@/dtos/req/hazcom-request.dto";
import { getFileMaxBytes } from "@/lib/files";

export const HAZCOM_SDS_FORM_ID = "hazcom-upload-sds";
export const HAZCOM_SDS_LIBRARY_ROUTE = "/dashboard/hazcom/sds";

const SDS_MAX_BYTES = getFileMaxBytes("HazCom");

const PICTOGRAM_OPTIONS: readonly SelectOption[] = HAZCOM_PICTOGRAMS.map(
  (pictogram) => ({ value: pictogram, label: pictogram }),
);

export type BuildSdsUploadSchemaArgs = Readonly<{
  chemicalOptions: readonly SelectOption[];
}>;

/** Upload SDS — POST /api/hazcom/sds. */
export function buildSdsUploadSchema(
  args: BuildSdsUploadSchemaArgs,
): FormSchema {
  return [
    {
      type: "photo",
      name: "pdfUrl",
      label: "Safety Data Sheet PDF",
      colSpan: 12,
      accept: "pdf",
      listVariant: "rows",
      storage: "cloudinary",
      maxFiles: 1,
      maxBytes: SDS_MAX_BYTES,
      placeholder: "Drop a PDF here or click to browse",
      helperText:
        "Uploads to Cloudinary immediately. The secure URL is sent as pdfUrl.",
    },
    {
      type: "heading",
      name: "ghsMetadata",
      label: "GHS Metadata",
    },
    {
      type: "select",
      name: "chemicalId",
      label: "Chemical",
      required: true,
      colSpan: 6,
      placeholder: "Select a chemical…",
      options: args.chemicalOptions,
    },
    {
      type: "text",
      name: "productName",
      label: "Product Name",
      required: true,
      colSpan: 6,
      placeholder: "e.g. Acetone SDS",
    },
    {
      type: "text",
      name: "manufacturer",
      label: "Manufacturer",
      colSpan: 6,
      placeholder: "e.g. ChemCo",
    },
    {
      type: "text",
      name: "casNumber",
      label: "CAS Number",
      colSpan: 6,
      placeholder: "e.g. 67-64-1",
    },
    {
      type: "text",
      name: "hazardClass",
      label: "Hazard Class",
      colSpan: 6,
      placeholder: "e.g. Flammable",
    },
    {
      type: "text",
      name: "disposeLocation",
      label: "Dispose Location",
      colSpan: 6,
      maxLength: 250,
      placeholder: "e.g. Hazmat disposal",
    },
    {
      type: "tiles",
      name: "signalWord",
      label: "Signal Word",
      colSpan: 12,
      variant: "segmented",
      options: [
        { value: "Danger", label: "Danger" },
        { value: "Warning", label: "Warning" },
      ],
    },
    {
      type: "date",
      name: "revisionDate",
      label: "Revision Date",
      colSpan: 6,
    },
    {
      type: "text",
      name: "version",
      label: "Version",
      colSpan: 6,
      placeholder: "e.g. 1.0",
    },
    {
      type: "chips",
      name: "ghsPictograms",
      label: "GHS Pictograms",
      colSpan: 12,
      options: PICTOGRAM_OPTIONS,
    },
    {
      type: "textarea",
      name: "hazardStatement",
      label: "Hazard Statement",
      required: true,
      colSpan: 6,
      rows: 4,
      placeholder: "e.g. Highly flammable liquid and vapor.",
    },
    {
      type: "textarea",
      name: "precautionaryStatement",
      label: "Precautionary Statement",
      required: true,
      colSpan: 6,
      rows: 4,
      placeholder:
        "e.g. Keep away from heat, sparks, open flames and hot surfaces.",
    },
  ];
}

export const HAZCOM_SDS_INITIAL_VALUES: FormValues = {
  pdfUrl: [],
  chemicalId: "",
  productName: "",
  manufacturer: "",
  casNumber: "",
  hazardClass: "",
  disposeLocation: "",
  signalWord: "",
  revisionDate: "",
  version: "",
  ghsPictograms: [],
  hazardStatement: "",
  precautionaryStatement: "",
};

function toIsoRevisionDate(date: string): string | null {
  const trimmed = date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const parsed = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function optionalText(value: unknown): string | null {
  const trimmed = String(value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

/** Maps FormBuilder values onto POST /api/hazcom/sds. */
export function toSdsRequest(
  values: FormValues,
  isDraft: boolean,
): SafetyDataSheetRequestDto | { error: string } {
  const chemicalId = Number(String(values.chemicalId ?? "").trim());
  if (!Number.isFinite(chemicalId) || chemicalId <= 0) {
    return { error: "Chemical is required" };
  }

  const productName = String(values.productName ?? "").trim();
  if (!productName) {
    return { error: "Product name is required" };
  }

  const hazardStatement = String(values.hazardStatement ?? "").trim();
  if (!hazardStatement) {
    return { error: "Hazard statement is required" };
  }

  const precautionaryStatement = String(
    values.precautionaryStatement ?? "",
  ).trim();
  if (!precautionaryStatement) {
    return { error: "Precautionary statement is required" };
  }

  const pdfUrls = Array.isArray(values.pdfUrl) ? values.pdfUrl : [];
  const pdfUrl = pdfUrls[0]?.trim() || null;

  const pictograms = Array.isArray(values.ghsPictograms)
    ? values.ghsPictograms.map((item) => item.trim()).filter(Boolean)
    : [];

  return {
    id: 0,
    chemicalId,
    pdfUrl,
    productName,
    manufacturer: optionalText(values.manufacturer),
    casNumber: optionalText(values.casNumber),
    hazardClass: optionalText(values.hazardClass),
    disposeLocation: optionalText(values.disposeLocation),
    signalWord: optionalText(values.signalWord),
    revisionDate: toIsoRevisionDate(String(values.revisionDate ?? "")),
    version: optionalText(values.version),
    ghsPictograms: pictograms.length > 0 ? pictograms.join(", ") : null,
    hazardStatement,
    precautionaryStatement,
    isDraft,
  };
}
