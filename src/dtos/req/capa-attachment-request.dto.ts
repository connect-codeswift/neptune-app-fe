/** Body for POST /api/CAPA/UploadCapaAttachments. */
export type CapaAttachmentRequestDto = {
  capaId: number;
  userId: number;
  attachments: readonly {
    attachmentUrl: string;
    attachmentTitle: string;
    size?: string | null;
  }[];
};
