export type SkeletonProps = Readonly<{
  className?: string;
}>;

/** A single pulsing placeholder block. Sizing/rounding comes from `className`. */
export function Skeleton(props: SkeletonProps) {
  const { className = "" } = props;

  return (
    <div
      aria-hidden="true"
      className={["animate-pulse rounded bg-slate-200/80", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
