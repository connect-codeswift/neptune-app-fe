/**
 * Canonical form-control styling for the whole app.
 *
 * These classes were previously redeclared in ten places and had drifted into
 * five different looks — three input heights, two corner radii, two font sizes
 * and two border colours, depending on which screen you were on. Everything now
 * imports from here, so a change lands once.
 *
 * The values are the incident-report / HazCom treatment, which was already the
 * most widely used. Colours are expressed as theme tokens rather than the raw
 * hex the originals hardcoded — `--ehs-dark-bg` is `#0b1320`, `--ehs-muted-text`
 * is `#8892a3` and `--ehs-normal-blue` is `#0891a6`, so this renders identically
 * while staying tied to the palette.
 *
 * `ehsInputClass` in `@/lib/ehs-classes` (auth screens and the generic
 * `components/inputs` controls) now mirrors this treatment — same fill,
 * hairline, blur and focus halo. It used to be a solid panel because those
 * screens sat on opaque backgrounds; the app went glass, and the fields went
 * with it. If FIELD_BASE's material changes, change it there too.
 */

const FIELD_BASE = [
  "w-full rounded-[10px] border border-[rgba(15,23,42,0.08)]",
  // 55% white to sit on the thinner glass cards the app now uses — 62% read
  // a step more solid than the surface underneath it.
  "bg-white/55 text-ehs-dark-bg backdrop-blur-[5px] outline-none",
  "transition-[color,background-color,border-color,box-shadow] duration-150",
  "placeholder:text-ehs-muted-text",
  "hover:border-[rgba(15,23,42,0.18)] hover:bg-white/[0.78]",
  // A soft 3px halo rather than a hard 2px ring — reads as a glow at this
  // field size instead of a second border fighting the first.
  "focus:border-ehs-normal-blue focus:ring-[3px] focus:ring-ehs-normal-blue/[0.15]",
  // Error state, driven by `aria-invalid` so the styling and the accessible
  // state can't disagree.
  "aria-invalid:border-ehs-red aria-invalid:focus:border-ehs-red aria-invalid:focus:ring-ehs-red/[0.15]",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

/** Single-line inputs and selects. */
export const FIELD_INPUT_CLASS = ` p-3 text4  ${FIELD_BASE}`;

/**
 * Selects: native chevron removed so we can draw our own, with room for it.
 */
export const FIELD_SELECT_CLASS = `${FIELD_INPUT_CLASS} cursor-pointer appearance-none pr-9 `;

/**
 * Applied while a select has no value, so "Select…" reads as a prompt rather
 * than an answer. Matters now that the classification questions start blank —
 * an unanswered field should look unanswered.
 */
export const FIELD_SELECT_PLACEHOLDER_CLASS = "text-ehs-muted-text text4";

/** Multi-line inputs — same skin, no fixed height. */
export const FIELD_TEXTAREA_CLASS = `min-h-[110px] resize-y px-[13px] py-[10.5px] text4 leading-normal ${FIELD_BASE}`;

/**
 * Textarea with a reserved strip along the bottom for in-field controls such as
 * the AI assist button. Taller than the plain variant so the writing area still
 * shows three lines once the strip is taken out.
 */
export const FIELD_TEXTAREA_WITH_CONTROLS_CLASS = `min-h-[128px] resize-y px-[13px] pt-[10.5px] pb-10 text4 leading-[19.5px] ${FIELD_BASE}`;

/**
 * Taller variant for the template/form builders, where a field is the primary
 * thing on the row rather than one cell in a dense grid.
 */
export const FIELD_INPUT_LG_CLASS = `px-3 py-2.5 text4 ${FIELD_BASE}`;
