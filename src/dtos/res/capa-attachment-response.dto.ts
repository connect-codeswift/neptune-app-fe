export type CapaAttachmentItemDto = Readonly<{
  attachmentUrl: string;
  attachmentTitle: string;
  size?: string | null;
}>;

export type CapaAttachmentDto = Readonly<{
  capaId: number;
  userId: number;
  attachments: readonly CapaAttachmentItemDto[];
}>;
