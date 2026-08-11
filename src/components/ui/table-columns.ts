import type { ColumnDef } from "@tanstack/react-table";

/**
 * Column list type for our TanStack tables.
 *
 * `ColumnDef<TRow, TValue>` uses `TValue` in both a covariant position
 * (`accessorFn`'s return) and a contravariant one (`cell`'s `CellContext`
 * parameter), which makes it invariant in practice. A column array that mixes
 * accessors of different value types therefore has no common supertype:
 *
 *   - `ColumnDef<TRow, unknown>[]` is rejected — `unknown` is not assignable to
 *     the concrete `TValue` that `cell` expects.
 *   - `ColumnDef<TRow, never>[]` is accepted where the array is built, but is
 *     then rejected at the consumer boundary (`Table`'s `columns` prop).
 *   - Letting TypeScript infer the array type produces a per-column union that
 *     no single `ColumnDef` parameterisation accepts.
 *
 * TanStack hits the same wall in its own types and resolves it the same way —
 * see `TableOptions.columns: ColumnDef<TData, any>[]` in
 * `@tanstack/table-core/build/lib/core/table.d.ts`. So this alias is the single
 * place that escape hatch lives, rather than an `eslint-disable` in every
 * column file.
 *
 * Per-column value types are still fully checked: `createColumnHelper<TRow>()`
 * infers `TValue` from the accessor key, so `info.getValue()` stays typed
 * inside each `cell` renderer regardless of this alias.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableColumns<TRow> = ColumnDef<TRow, any>[];
