"use client";

import { useState, type KeyboardEvent } from "react";

type Highlight = Readonly<{ resultsKey: string; index: number }>;

export type OptionHighlight = Readonly<{
  /** Index of the highlighted row, or `-1` when nothing is highlighted. */
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  /**
   * Runs the shared combobox keys — Escape, Arrow Up/Down, Enter — and reports
   * whether the key was consumed, so a picker can keep its own handling for
   * everything else (Backspace on a chip row, say) without re-deriving these.
   */
  handleKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    options: Readonly<{
      open: boolean;
      setOpen: (open: boolean) => void;
      onEnter: (index: number) => boolean;
    }>,
  ) => boolean;
}>;

/**
 * Keyboard highlight for an option list that changes under the cursor.
 *
 * The highlight is tagged with the result set it was made against and expires
 * on its own when a new one arrives. Without that, results landing after a
 * debounced search leave the highlight pointing at a row that now holds a
 * different person, and Enter commits them — a bug that is invisible in review
 * and obvious to whoever files the wrong report.
 */
export function useOptionHighlight(
  resultsKey: string,
  length: number,
): OptionHighlight {
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  const activeIndex =
    highlight?.resultsKey === resultsKey ? highlight.index : -1;

  function setActiveIndex(index: number) {
    setHighlight({ resultsKey, index });
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    options: Readonly<{
      open: boolean;
      setOpen: (open: boolean) => void;
      onEnter: (index: number) => boolean;
    }>,
  ): boolean {
    const { open, setOpen, onEnter } = options;

    if (event.key === "Escape") {
      setOpen(false);
      return true;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!open) {
        setOpen(true);
      } else if (length > 0) {
        const next = activeIndex + (event.key === "ArrowDown" ? 1 : -1);
        setActiveIndex(wrapIndex(next, length));
      }

      return true;
    }

    if (event.key === "Enter" && open && onEnter(activeIndex)) {
      // Only swallow Enter when it actually picked someone — otherwise the
      // form's own submit handling should still see it.
      event.preventDefault();
      return true;
    }

    return false;
  }

  return { activeIndex, setActiveIndex, handleKeyDown };
}

/** Wrap a highlight index around the ends of the list. */
export function wrapIndex(next: number, length: number): number {
  if (next < 0) {
    return length - 1;
  }

  return next >= length ? 0 : next;
}
