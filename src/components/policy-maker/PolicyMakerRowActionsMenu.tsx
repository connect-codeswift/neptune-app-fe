"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type PolicyMakerRowActionsMenuProps = Readonly<{
  documentTitle: string;
  onEditDocument?: () => void;
}>;

type MenuPosition = Readonly<{
  top: number;
  left: number;
}>;

/**
 * Horizontal ⋯ trigger + glass context menu (Figma 5568:22802).
 */
export function PolicyMakerRowActionsMenu(
  props: Readonly<PolicyMakerRowActionsMenuProps>,
) {
  const { documentTitle, onEditDocument } = props;
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const menuWidth = 208.4;
      const gap = 6;
      const left = Math.max(8, rect.right - menuWidth);
      const top = rect.bottom + gap;

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`More actions for ${documentTitle}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className={[
          "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-[#8892a3] transition-colors",
          open
            ? "bg-[rgba(15,23,42,0.06)] text-[#0b1320]"
            : "hover:bg-[rgba(15,23,42,0.05)] hover:text-[#0b1320]",
        ].join(" ")}
      >
        <Icon
          icon="mdi:dots-horizontal"
          className="size-[13.62px]"
          aria-hidden="true"
        />
      </button>

      {open && position
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={`Actions for ${documentTitle}`}
              style={{ top: position.top, left: position.left }}
              className="fixed z-50 w-[208.4px] origin-top-right overflow-hidden rounded-[14px] border-[0.8px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.82)] p-[5.8px] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-[14px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onEditDocument?.();
                }}
                className="relative z-1 flex h-[34.75px] w-full cursor-pointer items-center gap-[9px] rounded-[9px] px-[10px] py-[8px] text-left transition-colors hover:bg-[rgba(15,23,42,0.05)]"
              >
                <Icon
                  icon="mdi:pencil-outline"
                  className="size-[13px] shrink-0 text-[#8892a3]"
                  aria-hidden="true"
                />
                <Text
                  as="span"
                  className="text-[12.5px] leading-[18.75px] font-medium whitespace-nowrap text-[#2a3446]"
                >
                  Edit a Document
                </Text>
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
