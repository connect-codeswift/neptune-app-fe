import {
  LOGO_MARK_RING_RADIUS,
  LOGO_MARK_RING_WIDTH,
  NEPTUNE_N_PATH,
} from "@/components/LogoMark";

export type NeptuneLoaderProps = Readonly<{
  /** Announced to screen readers and shown under the mark. */
  label?: string;
  /** Covers the viewport. Leave false to sit inline in a card or panel. */
  fullScreen?: boolean;
  className?: string;
}>;

/** 2πr for the monogram's ring, so the dash below is a true quarter turn. */
const RING_CIRCUMFERENCE = 2 * Math.PI * LOGO_MARK_RING_RADIUS;
const ARC_LENGTH = RING_CIRCUMFERENCE * 0.24;

/**
 * Branded wait state: the Neptune monogram with an arc orbiting its ring.
 *
 * This is for user-initiated waits — signing in, in particular — which is why
 * it is a loader and not a skeleton. Page loads keep their skeletons, per the
 * house rule that skeletons stand in for content whose shape is known and
 * spinners cover actions whose duration isn't.
 *
 * Geometry and the glyph come from LogoMark's exported constants rather than
 * being restated, so the ring here can't drift from the monogram elsewhere.
 */
export function NeptuneLoader(props: Readonly<NeptuneLoaderProps>) {
  const { label = "Loading…", fullScreen = false, className = "" } = props;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "flex flex-col items-center justify-center gap-4",
        fullScreen
          ? "bg-ehs-light-bg/85 fixed inset-0 z-100 backdrop-blur-1.5"
          : "py-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-ehs-dark-bg size-14"
        aria-hidden="true"
      >
        {/* Faint full ring: keeps the monogram legible as itself while the arc
            travels, so this still reads as the logo rather than as a spinner. */}
        <circle
          cx="24"
          cy="24"
          r={LOGO_MARK_RING_RADIUS}
          stroke="currentColor"
          strokeWidth={LOGO_MARK_RING_WIDTH}
          className="opacity-15"
        />

        <circle
          cx="24"
          cy="24"
          r={LOGO_MARK_RING_RADIUS}
          stroke="currentColor"
          strokeWidth={LOGO_MARK_RING_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${String(ARC_LENGTH)} ${String(RING_CIRCUMFERENCE - ARC_LENGTH)}`}
          className="animate-mark-orbit text-ehs-normal-blue"
        />

        <g transform="translate(-28.093 8.504) scale(1.2)">
          <path d={NEPTUNE_N_PATH} fill="currentColor" />
        </g>
      </svg>

      <p className="text-ehs-muted-text text-sm font-medium">{label}</p>
    </div>
  );
}
