"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { NEPTUNE_N_PATH } from "@/components/LogoMark";
import { BetaBadge } from "@/components/neptune-ai/BetaBadge";
import { NeptuneChatPanel } from "@/components/neptune-ai/NeptuneChatPanel";
import { NEPTUNE_AI_HREF } from "@/components/neptune-ai/neptune-ai-routes";
import {
  closeNeptuneChat,
  toggleNeptuneChat,
  useNeptuneChatOpen,
} from "@/components/neptune-ai/neptune-chat-store";

/** How close to the viewport edge the launcher may be parked. */
const DRAG_MARGIN = 8;

/**
 * Vertical movement below this is a click, not a drag. Fingers and trackpads always wobble a
 * pixel or two on the way down, and without a threshold every press would register as a drag
 * and swallow its own click. Measured on the Y axis alone, since that is the only axis that
 * moves anything — a purely sideways swipe stays a click rather than becoming a drag that
 * visibly does nothing.
 */
const DRAG_THRESHOLD = 4;

/** Offset from the docked corner, in px. Negative moves the launcher up. */
const DOCKED_Y = 0;

/**
 * Everything the drag needs, captured once on pointerdown. The bounds are pre-computed from
 * the launcher's rect at that moment so each move is a clamp and not another layout read.
 */
type DragState = {
  pointerId: number;
  startY: number;
  originY: number;
  minY: number;
  maxY: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The launcher's circled N, drawn at the Figma mark's own proportions rather than reusing
 * LogoMark: there the ring spans 62% of the box, which at 32px leaves a small faint mark with
 * a hairline ring. The design's ring runs nearly edge to edge with the N large inside it.
 */
function LauncherMark() {
  const scale = 1.6;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-8 shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="24"
        r="21.5"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      {/* Centres the glyph: its natural centre is (43.411, 12.913), so translate by
          (24 − 43.411·s, 24 − 12.913·s). */}
      <g
        transform={`translate(${String(24 - 43.411 * scale)} ${String(24 - 12.913 * scale)}) scale(${String(scale)})`}
      >
        <path d={NEPTUNE_N_PATH} fill="currentColor" />
      </g>
    </svg>
  );
}

/**
 * The floating assistant launcher, docked bottom-right on every dashboard screen.
 *
 * Hidden on the Neptune AI page itself: a button that opens a smaller copy of the thing already
 * filling the screen is just clutter.
 *
 * It sits above the page but below the mobile sidebar drawer (z-40) and its backdrop, so opening
 * the menu on a phone does not leave a pill floating over it.
 *
 * <b>Draggable up and down while closed.</b> Parked in the corner it covers whatever the page
 * put there — a table's Next button, a form's submit — and there is no way to reach through it.
 * Sliding it along the right edge moves it out of the way.
 *
 * <b>The X axis is deliberately fixed.</b> The launcher and its panel are both right-anchored,
 * and the panel is the wider of the two, so horizontal travel would either pull the pair away
 * from the edge they align to or walk the launcher inward over the page content it is meant to
 * stop covering. One axis is all the overlap needs.
 *
 * The position is deliberately <b>not persisted</b>: it lives in component state and resets to
 * the corner on reload, because this is a workaround for the overlap rather than a placement
 * feature, and a launcher that stayed where a user once flicked it would be harder to find than
 * one that is always in the same place.
 */
export function AskNeptuneAiButton() {
  const pathname = usePathname();
  // Shared store, not local state: the sidebar's "Chat" entry opens the same panel.
  const open = useNeptuneChatOpen();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  // Refs, not state: the click handler reads this in the same tick the pointer sequence ends,
  // before any re-render could deliver a new value.
  const movedRef = useRef(false);
  const [offsetY, setOffsetY] = useState(DOCKED_Y);
  const [isDragging, setIsDragging] = useState(false);

  if (pathname.startsWith(NEPTUNE_AI_HREF)) {
    return null;
  }

  // Opening docks it back to the corner. The panel is laid out directly above the launcher, so
  // one parked mid-screen would hang its 330px panel off the top or the side. Derived from
  // `open` rather than written back into state, so closing returns the launcher to wherever it
  // was parked instead of silently discarding the user's placement.
  const appliedY = open ? DOCKED_Y : offsetY;

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    // Left button / touch / pen only, and never while the panel is open — the launcher is
    // anchored to its panel then, and dragging the pair would take the panel off-screen.
    if (event.button !== 0 || open) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Bounds are expressed in the same units as the offset: how far the launcher may still
    // travel up and down before its own edge reaches the viewport's.
    const rect = container.getBoundingClientRect();
    movedRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      originY: offsetY,
      minY: offsetY + (DRAG_MARGIN - rect.top),
      maxY: offsetY + (window.innerHeight - DRAG_MARGIN - rect.bottom),
    };

    // Capture so the drag survives the pointer leaving the button, which it does immediately
    // on any quick movement.
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const dy = event.clientY - drag.startY;

    if (!movedRef.current) {
      if (Math.abs(dy) < DRAG_THRESHOLD) {
        return;
      }
      movedRef.current = true;
      setIsDragging(true);
    }

    setOffsetY(clamp(drag.originY + dy, drag.minY, drag.maxY));
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    // `movedRef` stays set until the click below consumes it.
  }

  function handleClick() {
    // The drag that just ended fires a click of its own. Swallow it — otherwise parking the
    // launcher would open the panel every single time. A keyboard Enter/Space arrives here
    // with no pointer sequence behind it, so `movedRef` is false and it toggles normally.
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }

    toggleNeptuneChat();
  }

  const motionClass = isDragging
    ? "transition-none"
    : "transition-transform duration-200 ease-out";
  const cursorClass = isDragging ? "cursor-grabbing" : "cursor-pointer";

  return (
    <div
      ref={containerRef}
      style={{ transform: `translateY(${String(appliedY)}px)` }}
      className={[
        "pointer-events-none fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6",
        motionClass,
      ].join(" ")}
    >
      <div className="pointer-events-auto">
        <NeptuneChatPanel
          open={open}
          onClose={closeNeptuneChat}
          returnFocusRef={buttonRef}
        />
      </div>

      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        aria-expanded={open}
        aria-label={open ? "Close Neptune AI" : "Ask Neptune AI"}
        className={[
          "bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-hover pointer-events-auto inline-flex touch-none items-center gap-2.5 rounded-[30px] px-4 py-3 shadow-[0px_8px_8px_color-mix(in_oklab,var(--ehs-normal-blue)_24%,transparent)] transition-colors select-none",
          cursorClass,
        ].join(" ")}
      >
        <LauncherMark />
        <span className="text-[13px] font-medium whitespace-nowrap">
          Ask Neptune AI
        </span>
        <BetaBadge tone="on-accent" />
      </button>
    </div>
  );
}
