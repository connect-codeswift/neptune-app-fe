/** Body for POST /api/v1/capas/{capaId}/attachments. */
export type CapaAttachmentRequestDto = {
  capaId: number;
  userId: number;
  attachments: readonly {
    attachmentUrl: string;
    attachmentTitle: string;
    size?: string | null;
  }[];
};
