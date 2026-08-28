"use client";

import {
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

export type UserPickerVariant = "form" | "embedded";

type MenuPosition = Readonly<{
  top: number;
  left: number;
  width: number;
}>;

export type UserPickerMenuProps = Readonly<{
  open: boolean;
  variant: UserPickerVariant;
  /** The control the menu hangs off. Only read in the `embedded` variant. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Set on the portaled menu so an outside-click handler can spare it. */
  menuRef: RefObject<HTMLDivElement | null>;
  /**
   * Changes whenever the menu's content changes height — the position is
   * recomputed then, so a list that grows doesn't hang off the bottom of a modal.
   */
  contentKey: string;
  children: ReactNode;
}>;

const MENU_SHELL_CLASS =
  "animate-popover-in rounded-2.5 border-ehs-border-ink/10 bg-ehs-surface overflow-hidden border shadow-(--ehs-shadow-popover)";

/**
 * The popover a user picker opens, in the two flavours the app needs.
 *
 * `form` is an absolutely-positioned child, which is right on a page. Inside a
 * modal it is wrong: the dialog clips it, or its own stacking context buries it.
 * `embedded` therefore portals to `document.body` and tracks the control's
 * rect, flipping above the field when there isn't room below.
 */
export function UserPickerMenu(props: Readonly<UserPickerMenuProps>) {
  const { open, variant, anchorRef, menuRef, contentKey, children } = props;

  const [position, setPosition] = useState<MenuPosition | null>(null);
  const isEmbedded = variant === "embedded";

  useLayoutEffect(() => {
    if (!isEmbedded || !open) {
      return;
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const menuHeight = menuRef.current?.offsetHeight ?? 240;
      const gap = 6;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const openUpward = spaceBelow < menuHeight && rect.top > spaceBelow;

      setPosition({
        top: openUpward
          ? Math.max(8, rect.top - menuHeight - gap)
          : rect.bottom + gap,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    // Capture phase: a scroll inside a modal body doesn't bubble to window.
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isEmbedded, open, contentKey, anchorRef, menuRef]);

  if (!open) {
    return null;
  }

  if (!isEmbedded) {
    return (
      <div
        className={`${MENU_SHELL_CLASS} absolute top-full right-0 left-0 z-30 mt-1.5`}
      >
        {children}
      </div>
    );
  }

  // `open` is only ever true after an interaction, so there is no server render
  // to guard against beyond the document check itself.
  if (typeof document === "undefined" || !position) {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      style={{ top: position.top, left: position.left, width: position.width }}
      className={`${MENU_SHELL_CLASS} fixed z-120`}
    >
      {children}
    </div>,
    document.body,
  );
}
