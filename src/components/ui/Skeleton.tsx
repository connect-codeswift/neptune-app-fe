export type SkeletonProps = Readonly<{
  className?: string;
}>;

/**
 * A single placeholder block with a sheen travelling across it. Sizing and
 * rounding come from `className`.
 *
 * The sheen replaced an opacity pulse, which blinks the whole block; a sweep
 * reads as work in progress. `skeleton-sweep` disables itself under
 * prefers-reduced-motion, leaving a still block.
 *
 * The fill is pinned to `slate-200/80` (#e2e8f0 at 80%), which is lighter and
 * cooler than `--ehs-border` (#e5e7eb); this is the global skeleton grey, so
 * rounding it changes every loading state in the app.
 */
export function Skeleton(props: SkeletonProps) {
  const { className = "" } = props;

  return (
    <div
      aria-hidden="true"
      className={["skeleton-sweep rounded bg-slate-200/80", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
