/** Body for POST /api/v1/capas/{capaId}/comments — matches OpenAPI `CapaCommentDto`. */
export type CapaCommentRequestDto = {
  capaId: number;
  title: string;
  description: string;
  userId: number;
  assignedId: number;
};
