/** Display like `Apr 24 · 09:12`. */
export function formatShortDateTime(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) {
    return "—";
  }

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate());
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${month} ${day} · ${hh}:${min}`;
}
