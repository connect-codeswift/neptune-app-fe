"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";
import type { AiTextMode } from "@/dtos/req/ai-text-request.dto";
import { useRewriteTextMutation } from "@/hooks/use-ai-text-mutations";
import { isApiError } from "@/lib/axios";
import { toast } from "@/lib/toast";

/**
 * The magic button that sits inside a long-text field: paraphrase or proofread
 * what the reporter wrote, via ChatGPT 5.6 Luna behind our own backend.
 *
 * Rendered as two absolutely-positioned layers, so it expects a positioned
 * ancestor — `ReportTextareaField` provides one when given an `assistant`.
 * The controls sit bottom-right, so Undo is laid out in reverse to keep it
 * inboard of the button rather than pushed into the corner.
 */
export type AiTextAssistantProps = Readonly<{
  value: string;
  onApply: (next: string) => void;
  /** Describes the field to the model, e.g. "a workplace incident report". */
  context?: string;
  disabled?: boolean;
  className?: string;
}>;

/** Below this there isn't enough for the model to work with. */
const MIN_CHARS = 20;

const MODES: readonly {
  mode: AiTextMode;
  label: string;
  hint: string;
  icon: string;
}[] = [
  {
    mode: "paraphrase",
    label: "Paraphrase",
    hint: "Reword it clearly, same facts",
    icon: "mdi:text-box-edit-outline",
  },
  {
    mode: "proofread",
    label: "Proofread",
    hint: "Fix spelling and grammar only",
    icon: "mdi:spellcheck",
  },
];

export function AiTextAssistant(props: Readonly<AiTextAssistantProps>) {
  const { value, onApply, context, disabled = false, className = "" } = props;

  const [open, setOpen] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [appliedText, setAppliedText] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const controlsRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const rewrite = useRewriteTextMutation();
  const isBusy = rewrite.isPending;

  // Undo is only honest while the field still holds exactly what we wrote —
  // once the reporter edits on top of it, restoring would discard their work.
  const canUndo =
    originalText !== null && appliedText !== null && value === appliedText;

  // Close the menu on outside click and on Escape while it's open.
  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!controlsRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!justApplied) {
      return;
    }

    const timer = globalThis.setTimeout(() => setJustApplied(false), 700);
    return () => globalThis.clearTimeout(timer);
  }, [justApplied]);

  async function run(mode: AiTextMode) {
    setOpen(false);

    const text = value.trim();

    if (text.length < MIN_CHARS) {
      toast.info(
        "Write a little more first",
        `The assistant needs at least ${MIN_CHARS} characters to work with.`,
      );
      return;
    }

    const isParaphrase = mode === "paraphrase";

    try {
      const rewritten = await rewrite.mutateAsync({ text, mode, context });

      if (rewritten.trim() === text) {
        toast.info(
          isParaphrase ? "Nothing to reword" : "Nothing to correct",
          "The assistant left your wording as it was.",
        );
        return;
      }

      setOriginalText(value);
      setAppliedText(rewritten);
      onApply(rewritten);
      setJustApplied(true);
      setStatus(
        isParaphrase
          ? "Description paraphrased."
          : "Description proofread and corrected.",
      );
      toast.success(
        isParaphrase ? "Paraphrased" : "Proofread",
        "Not what you wanted? Use Undo next to the button.",
      );
    } catch (error) {
      const description = isApiError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : undefined;

      toast.error("The assistant couldn't rewrite that", description);
    }
  }

  function undo() {
    if (originalText === null) {
      return;
    }

    onApply(originalText);
    setOriginalText(null);
    setAppliedText(null);
    setStatus("Original wording restored.");
  }

  return (
    <>
      {isBusy ? (
        // pointer-events-auto so clicks land here rather than in the field
        // being rewritten underneath.
        <div
          className="pointer-events-auto absolute inset-0 z-10 overflow-hidden rounded-[10px] bg-white/35 backdrop-blur-[1px]"
          aria-hidden="true"
        >
          <div className="animate-ai-blade-sweep absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.9)_42%,rgba(8,145,166,0.4)_58%,transparent_100%)] motion-reduce:animate-none" />
          <div className="animate-ai-halo-pulse ring-ehs-normal-blue/45 absolute inset-0 rounded-[10px] ring-1 ring-inset motion-reduce:animate-none" />
        </div>
      ) : null}

      {justApplied ? (
        <div
          className="animate-ai-result-flash ring-ehs-normal-blue/50 pointer-events-none absolute inset-0 z-10 rounded-[10px] ring-2 ring-inset"
          aria-hidden="true"
        />
      ) : null}

      <div
        ref={controlsRef}
        className={[
          "absolute right-2.5 bottom-2.5 z-20 flex flex-row-reverse items-center gap-2",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="group relative inline-flex">
          {/* Soft glow behind the button, brightest while the model is working */}
          <span
            className={[
              "bg-ehs-normal-blue/35 pointer-events-none absolute -inset-1 rounded-full blur-[6px] transition-opacity duration-200",
              isBusy
                ? "animate-ai-halo-pulse opacity-100 motion-reduce:animate-none"
                : "opacity-0 group-hover:opacity-100",
            ].join(" ")}
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            disabled={disabled || isBusy}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            aria-label={isBusy ? "Rewriting with AI" : "Rewrite with AI"}
            className={[
              "btn-sweep relative inline-flex size-7 cursor-pointer items-center justify-center rounded-full",
              "from-ehs-normal-blue to-ehs-dark-blue bg-linear-to-br text-white",
              "shadow-[0px_3px_10px_-2px_rgba(8,145,166,0.65)]",
              "transition-[transform,box-shadow] duration-150 ease-out",
              "hover:-translate-y-px hover:shadow-[0px_6px_16px_-3px_rgba(8,145,166,0.8)]",
              "active:translate-y-0 active:scale-95",
              "focus-visible:ring-ehs-normal-blue/30 focus-visible:ring-[3px] focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:hover:translate-y-0",
              open ? "ring-ehs-normal-blue/30 ring-[3px]" : "",
              disabled && !isBusy ? "opacity-60" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon
              icon={isBusy ? "mdi:loading" : "mdi:creation"}
              className={[
                "size-[15px] shrink-0 transition-transform duration-200",
                isBusy
                  ? "animate-spin motion-reduce:animate-none"
                  : "group-hover:scale-110 group-hover:-rotate-12",
              ].join(" ")}
              aria-hidden="true"
            />
          </button>

          {!open && !isBusy ? (
            <span
              role="tooltip"
              className="bg-ehs-dark-bg pointer-events-none absolute right-0 bottom-full mb-2 hidden translate-y-1 rounded-md px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-white opacity-0 shadow-[0px_8px_20px_-8px_rgba(15,23,42,0.5)] transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 sm:block"
            >
              Paraphrase or proofread
            </span>
          ) : null}
        </span>

        {canUndo && !isBusy ? (
          <button
            type="button"
            onClick={undo}
            className="text-ehs-gray hover:text-ehs-darker inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-900/10 bg-white/85 px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-[4px] transition-colors hover:bg-white"
          >
            <Icon
              icon="mdi:undo-variant"
              className="size-[13px] shrink-0"
              aria-hidden="true"
            />
            Undo
          </button>
        ) : null}

        {open ? (
          <div
            id={menuId}
            role="menu"
            aria-label="AI rewrite options"
            className="animate-popover-in absolute right-0 bottom-full z-30 mb-2 w-60 origin-bottom-right overflow-hidden rounded-xl border border-slate-900/10 bg-white py-1 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
          >
            <p className="text-ehs-dark-blue border-ehs-border flex items-center gap-1.5 border-b px-3 pt-1.5 pb-2 text-[10px] font-bold tracking-[1px] uppercase">
              <Icon
                icon="mdi:creation-outline"
                className="size-[13px] shrink-0"
                aria-hidden="true"
              />
              AI assist
            </p>

            {MODES.map((option) => (
              <button
                key={option.mode}
                type="button"
                role="menuitem"
                onClick={() => void run(option.mode)}
                className="hover:bg-ehs-light-bg group/item flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-colors"
              >
                <span
                  className="bg-ehs-light-blue text-ehs-normal-blue group-hover/item:bg-ehs-light-blue-hover flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors"
                  aria-hidden="true"
                >
                  <Icon icon={option.icon} className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="text-ehs-darker block text-[13px] font-semibold">
                    {option.label}
                  </span>
                  <span className="text-ehs-muted-text block text-[11px]">
                    {option.hint}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {isBusy ? "Rewriting your description…" : status}
      </span>
    </>
  );
}
