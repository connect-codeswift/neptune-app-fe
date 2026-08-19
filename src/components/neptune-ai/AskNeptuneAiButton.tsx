"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { NEPTUNE_N_PATH } from "@/components/LogoMark";
import { NeptuneChatPanel } from "@/components/neptune-ai/NeptuneChatPanel";
import { NEPTUNE_AI_HREF } from "@/components/neptune-ai/neptune-ai-routes";
import {
  closeNeptuneChat,
  toggleNeptuneChat,
  useNeptuneChatOpen,
} from "@/components/neptune-ai/neptune-chat-store";

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
 */
export function AskNeptuneAiButton() {
  const pathname = usePathname();
  // Shared store, not local state: the sidebar's "Chat" entry opens the same panel.
  const open = useNeptuneChatOpen();
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (pathname.startsWith(NEPTUNE_AI_HREF)) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
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
        onClick={toggleNeptuneChat}
        aria-expanded={open}
        aria-label={open ? "Close Neptune AI" : "Ask Neptune AI"}
        className="bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-hover pointer-events-auto inline-flex cursor-pointer items-center gap-2.5 rounded-[30px] px-4 py-3 shadow-[0px_8px_8px_color-mix(in_oklab,var(--ehs-normal-blue)_24%,transparent)] transition-colors"
      >
        <LauncherMark />
        <span className="text-[13px] font-medium whitespace-nowrap">
          Ask Neptune AI
        </span>
      </button>
    </div>
  );
}
