/** Body for POST /api/CAPA/Comment — matches OpenAPI `CapaCommentDto`. */
export type CapaCommentRequestDto = {
  capaId: number;
  title: string;
  description: string;
  userId: number;
  assignedId: number;
};
