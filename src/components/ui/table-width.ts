/**
 * How every table in the app decides its column widths.
 *
 * The rule is one sentence: **a column's configured size is a minimum, not a
 * width.** The table fills its container whenever there is room, and only
 * scrolls once the container is narrower than the sum of those minimums.
 *
 * Getting there needs both halves to agree:
 *
 * - `tableMinWidthStyle(total)` floors the `<table>` at the sum of the column
 *   sizes and pairs with `w-full`, so the table is
 *   `max(container, sum-of-minimums)` wide. The wrapper's `overflow-x-auto`
 *   then has something to scroll once the container loses.
 * - `columnWidthStyle(size, total)` gives each column its share of that width
 *   as a percentage. At exactly the minimum, `size / total` of `total` is
 *   `size` — every column lands on its configured px. Above it, the surplus is
 *   split in the same proportions instead of pooling in dead space at the
 *   right-hand edge.
 *
 * Fixed px widths were the previous approach, and they are what left a wide
 * screen with a table hugging the left and empty card behind it: a `width` is
 * an instruction, not a floor, so the table simply stopped growing at its
 * total. Percentages alone are the opposite failure — they always resolve
 * against the container, so the table can never exceed it and a narrow screen
 * silently crushes every column instead of scrolling.
 *
 * Use these with `table-fixed`. Auto layout treats a percentage as a
 * suggestion and re-weighs it against content, which puts the column widths
 * back under the browser's control rather than the schema's.
 */

/** Floor for the `<table>`, in px. Pair with `w-full` on the element. */
export function tableMinWidthStyle(totalSize: number) {
  return { minWidth: `${String(totalSize)}px` };
}

/** One column's share of the table width. Apply to `<col>`, `<th>` and `<td>`. */
export function columnWidthStyle(size: number, totalSize: number) {
  if (totalSize <= 0) {
    return { width: `${String(size)}px` };
  }

  // Four decimals: enough that a dozen columns don't visibly drift from 100%,
  // short enough to stay readable in devtools.
  return { width: `${((size / totalSize) * 100).toFixed(4)}%` };
}
