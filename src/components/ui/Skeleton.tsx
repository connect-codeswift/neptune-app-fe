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
