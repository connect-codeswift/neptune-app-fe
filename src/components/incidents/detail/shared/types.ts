export type AttachmentItem = Readonly<{
  id: string;
  name: string;
  description: string;
  sizeLabel: string;
  bytes: number;
  addedBy: string;
  time: string;
  secureUrl?: string;
  kind: "image" | "pdf" | "video";
}>;
