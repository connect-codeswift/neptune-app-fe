/**
 * Capitalizes the first letter of each whitespace-separated word.
 * Leaves the rest of each word as-is (does not force lowercase).
 */
export function toTitleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
