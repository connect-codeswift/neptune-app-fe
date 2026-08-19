export const FILE_MODULES = [
  "Incident",
  "NearMiss",
  "Hazard",
  "Audit",
  "Inspection",
  "Capa",
  "Document",
  "HazCom",
  "Bbs",
  "Ppe",
  "Profile",
] as const;

export type FileModule = (typeof FILE_MODULES)[number];

export type CreateUploadIntentRequestDto = Readonly<{
  fileName: string;
  contentType: string;
  sizeBytes: number;
  module: FileModule;
  withThumbnail?: boolean;
}>;
