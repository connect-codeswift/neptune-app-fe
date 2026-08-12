export type CapaAttachmentItemDto = Readonly<{
  id?: number | null;
  capaId?: number | null;
  userId?: number | null;
  attachmentUrl: string;
  attachmentTitle: string;
  size?: string | null;
  createdAt?: string | null;
  userName?: string | null;
}>;

export type CapaAttachmentDto = Readonly<{
  capaId: number;
  userId: number;
  attachments: readonly CapaAttachmentItemDto[];
}>;
