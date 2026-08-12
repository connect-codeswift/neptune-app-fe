export type LogoMarkProps = Readonly<{
  className?: string;
  /** Set when the mark is decorative and a sibling already names the brand. */
  decorative?: boolean;
}>;

/**
 * The Neptune monogram — the N glyph inside a ring.
 *
 * The glyph is the *same path* as the leading N of the wordmark in
 * `LogoIcon.tsx`, not a redrawing of it, so the letterform can never drift
 * from the brand. It is authored on the wordmark's own 10-unit baseline grid
 * (x 37.375–49.448, y 8–17.827), which is why it needs the transform below to
 * sit centred in a square viewBox.
 *
 * Ring geometry is taken from the supplied monogram: the outer edge sits at
 * 32% of the canvas and the stroke is 2.15% of it, so `r` is the centreline
 * radius (outer minus half the stroke) and both scale with the viewBox.
 */

/** Leading N of the Neptune wordmark. Keep in sync with LogoIcon.tsx. */
const NEPTUNE_N_PATH =
  "M40.1264 9.40381H39.3039C39.0139 9.40381 38.7788 9.63892 38.7788 9.92894V17.1247C38.7788 17.5124 38.4646 17.8266 38.0769 17.8266C37.6893 17.8266 37.375 17.5124 37.375 17.1247V9.57541C37.375 8.70533 38.0803 8 38.9504 8H39.8176C40.8705 8 41.8952 8.61768 42.3866 9.55823L45.5732 15.735C45.7838 16.1421 46.233 16.4228 46.6963 16.4228H47.5188C47.8088 16.4228 48.0439 16.1877 48.0439 15.8977V8.7019C48.0439 8.31425 48.3582 8 48.7458 8C49.1335 8 49.4477 8.31425 49.4477 8.7019V16.2512C49.4477 17.1213 48.7424 17.8266 47.8723 17.8266H47.0051C45.9522 17.8266 44.9275 17.209 44.4361 16.2684L41.2495 10.0917C41.0389 9.67053 40.5897 9.40381 40.1264 9.40381Z";

/**
 * Centres the glyph in the 48-unit viewBox. Derived, not eyeballed: the glyph
 * is 12.073 × 9.827 with its centre at (43.411, 12.913), so scaling by 1.2 and
 * translating by (24 − 43.411 × 1.2, 24 − 12.913 × 1.2) lands its centre on
 * (24, 24).
 */
const GLYPH_TRANSFORM = "translate(-28.093 8.504) scale(1.2)";

export const LOGO_MARK_RING_RADIUS = 14.84;
export const LOGO_MARK_RING_WIDTH = 1.03;

export function LogoMark(props: Readonly<LogoMarkProps>) {
  const { className = "", decorative = false } = props;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={["size-12", className].filter(Boolean).join(" ")}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": "Neptune" })}
    >
      <circle
        cx="24"
        cy="24"
        r={LOGO_MARK_RING_RADIUS}
        stroke="currentColor"
        strokeWidth={LOGO_MARK_RING_WIDTH}
      />
      <g transform={GLYPH_TRANSFORM}>
        <path d={NEPTUNE_N_PATH} fill="currentColor" />
      </g>
    </svg>
  );
}

export { NEPTUNE_N_PATH };
