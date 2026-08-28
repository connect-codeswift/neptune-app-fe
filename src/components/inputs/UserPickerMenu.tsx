"use client";

import { type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useAnchoredMenu } from "@/hooks/use-anchored-menu";

export type UserPickerVariant = "form" | "embedded";

export type UserPickerMenuProps = Readonly<{
  open: boolean;
  variant: UserPickerVariant;
  /** The control the menu hangs off. Only read in the `embedded` variant. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Set on the portaled menu so an outside-click handler can spare it. */
  menuRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}>;

const MENU_SHELL_CLASS =
  "animate-popover-in rounded-2.5 border-ehs-border-ink/10 bg-ehs-surface overflow-hidden border shadow-(--ehs-shadow-popover)";

/**
 * The popover a user picker opens, in the two flavours the app needs.
 *
 * `embedded` — the default — portals to `document.body` and tracks the control's
 * rect, flipping above the field when there isn't room below. It is the default
 * because every form card in this app carries `backdrop-blur`, and that creates
 * a stacking context: a menu rendered inside one card is painted under the card
 * that follows it however high its z-index goes.
 *
 * `form` is the absolutely-positioned child, correct only where the picker's
 * nearest card is the last thing on the page and nothing can overlap it.
 */
export function UserPickerMenu(props: Readonly<UserPickerMenuProps>) {
  const { open, variant, anchorRef, menuRef, children } = props;

  const isEmbedded = variant === "embedded";
  const menuStyle = useAnchoredMenu({
    open: open && isEmbedded,
    anchorRef,
    menuRef,
  });

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
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      style={menuStyle}
      className={`${MENU_SHELL_CLASS} z-120`}
    >
      {children}
    </div>,
    document.body,
  );
}
