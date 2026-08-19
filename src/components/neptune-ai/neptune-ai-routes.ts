/**
 * The assistant's route, in one place.
 *
 * Shared because three things must agree on it: the sidebar entry, the page itself, and the
 * floating button that hides when you are already there. The `page:` permission slug is derived
 * from the href with no override, so changing this changes the claim the backend must grant.
 */
export const NEPTUNE_AI_HREF = "/dashboard/neptune-ai";
