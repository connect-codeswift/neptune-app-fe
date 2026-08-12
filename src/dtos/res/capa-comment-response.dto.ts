/**
 * Matches backend `CapaCommentDto` (OpenAPI) plus optional list fields
 * returned by GET /api/CAPA/Comments.
 */
export type CapaCommentDto = {
  id?: number | null;
  capaId: number;
  title?: string | null;
  description: string;
  userId: number;
  assignedId: number;
  createdAt?: string | null;
  userName?: string | null;
  assignedName?: string | null;
};
