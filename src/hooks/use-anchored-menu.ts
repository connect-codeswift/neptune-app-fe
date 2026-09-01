"use client";

import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

/** Distance between the control and its menu. */
const DEFAULT_GAP = 6;

/** Never let a flipped-up menu touch the top edge of the viewport. */
const VIEWPORT_MARGIN = 8;

type Placement = Readonly<{
  top: number;
  left: number;
  width: number;
  /** False on the first pass, before the menu exists to be measured. */
  measured: boolean;
}>;

export type UseAnchoredMenuArgs = Readonly<{
  open: boolean;
  /** The control the menu hangs off. */
  anchorRef: RefObject<HTMLElement | null>;
  /** The portaled menu element. Must be rendered whenever `open` is true. */
  menuRef: RefObject<HTMLElement | null>;
  gap?: number;
  /**
   * Floor for the menu width. A calendar has a width of its own to keep; a
   * listbox is just as wide as the field it belongs to.
   */
  minWidth?: number;
  /**
   * `start` (default) lines the menu up with the control's left edge. `center`
   * centres it, for a menu wider than its control, and keeps it inside the
   * viewport.
   */
  align?: "start" | "center";
}>;

function isSamePlacement(a: Placement | null, b: Placement): boolean {
  return (
    a !== null &&
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.measured === b.measured
  );
}

/**
 * Positions a menu that portals to `document.body` under (or over) its control.
 *
 * The subtlety is the flip. Deciding whether a menu opens downward needs its
 * height, and the height needs the menu on the page — so every one of these
 * popovers used to guess a constant (240px, 320px, 208px) on the first pass and
 * position against it. When the real menu was shorter, which is the common case
 * — one search result, a two-line list — it flipped upward it didn't need to
 * and then sat that guessed distance above the field, floating over whatever
 * was there. That is the distorted dropdown on Create CAPA.
 *
 * So this measures instead of guessing, in two passes. The first sets left and
 * width and parks the menu below the control, hidden — hidden rather than
 * unmounted, because a menu that isn't in the DOM has no height to read, which
 * is the trap the guess existed to work around. The second measures the real
 * box and commits the final top. `visibility` rather than a mount gate means
 * the intermediate position is never seen.
 *
 * A `ResizeObserver` then keeps it honest: these lists change height *after*
 * they open — skeletons give way to results, a search narrows ten rows to one —
 * and each of those is a fresh chance for a downward menu to need flipping, or
 * a flipped one to stop needing it.
 */
export function useAnchoredMenu(args: UseAnchoredMenuArgs): CSSProperties {
  const {
    open,
    anchorRef,
    menuRef,
    gap = DEFAULT_GAP,
    minWidth = 0,
    align = "start",
  } = args;

  const [placement, setPlacement] = useState<Placement | null>(null);
  const isMounted = placement !== null;

  useLayoutEffect(() => {
    // Closing deliberately leaves the last placement in state rather than
    // clearing it. This effect runs before paint, so the next open re-measures
    // and overwrites it in the same frame — whereas resetting here would be a
    // setState in an effect body for a value nothing renders while closed.
    if (!open) {
      return;
    }

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const menu = menuRef.current;

      const width = Math.max(minWidth, rect.width);

      // Width before height, and set on the node rather than waiting a render
      // for it: a menu measured at its natural width is a menu measured with
      // the wrong wrapping, so its height would be a guess again. React writes
      // the same value on the next commit, so this isn't fighting anything.
      if (menu) {
        menu.style.width = `${String(width)}px`;
      }

      const height = menu?.getBoundingClientRect().height ?? 0;

      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const opensUpward =
        height > 0 && spaceBelow < height && rect.top > spaceBelow;
      const top = opensUpward
        ? Math.max(VIEWPORT_MARGIN, rect.top - height - gap)
        : rect.bottom + gap;

      const centred = rect.left + rect.width / 2 - width / 2;
      const left =
        align === "center"
          ? Math.min(
              Math.max(VIEWPORT_MARGIN, centred),
              window.innerWidth - width - VIEWPORT_MARGIN,
            )
          : rect.left;

      const next: Placement = {
        top,
        left,
        width,
        measured: height > 0,
      };

      setPlacement((prev) => (isSamePlacement(prev, next) ? prev : next));
    };

    update();

    // Capture phase: a scroll inside a modal body never reaches window.
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    const menu = menuRef.current;
    const observer = new ResizeObserver(update);
    if (menu) {
      observer.observe(menu);
    }

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      observer.disconnect();
    };
    // `isMounted` is a dependency on purpose: it flips once when the first pass
    // puts the menu on the page, which is what re-runs this to measure it and
    // to attach the observer to a node that now exists.
  }, [open, isMounted, anchorRef, menuRef, gap, minWidth, align]);

  if (!placement) {
    // Off-screen rather than absent: the menu still has to render and lay out
    // at its natural size for the pass above to have anything to measure.
    return {
      position: "fixed",
      top: 0,
      left: 0,
      visibility: "hidden",
      pointerEvents: "none",
    };
  }

  return {
    position: "fixed",
    top: placement.top,
    left: placement.left,
    width: placement.width,
    visibility: placement.measured ? "visible" : "hidden",
    pointerEvents: placement.measured ? undefined : "none",
  };
}
