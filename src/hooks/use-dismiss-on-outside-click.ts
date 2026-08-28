"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Closes a popover when a pointer goes down anywhere outside `ref`.
 *
 * `mousedown` rather than `click`, so the menu is gone before the click lands
 * on whatever is underneath — closing on `click` lets the first click through
 * to the element behind the menu.
 *
 * Escape is deliberately not handled here: each popover already owns a keydown
 * handler for its own navigation keys, and splitting Escape away from those
 * would put one component's key handling in two places.
 *
 * `alsoInside` is for a menu that portals to `document.body`: it is visually
 * part of the control but not a DOM descendant of it, so without this a click
 * on an option would read as a click outside and close the menu underneath the
 * pointer.
 */
export function useDismissOnOutsideClick(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void,
  alsoInside?: RefObject<HTMLElement | null>,
): void {
  // Callers pass an inline arrow, so the callback is a new function every
  // render. Reading it through a ref keeps the listener subscribed once per
  // open rather than resubscribing on every keystroke behind the menu.
  const latest = useRef(onDismiss);

  useEffect(() => {
    latest.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!active) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        ref.current?.contains(target) ||
        alsoInside?.current?.contains(target)
      ) {
        return;
      }

      latest.current();
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [active, ref, alsoInside]);
}
