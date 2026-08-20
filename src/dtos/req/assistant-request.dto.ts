/**
 * A question for Neptune AI.
 *
 * POST /api/v1/assistant/conversations/messages — see neptune-be/FEGuides/NeptuneAiAssistant.md
 *
 * The whole request. Who is asking, which site they belong to and what they are allowed to see
 * all come from the bearer token — there is deliberately no way to ask on someone else's behalf,
 * or about another site.
 */
export type AskAssistantRequestDto = {
  /** Max 2000 characters. */
  message: string;
};
