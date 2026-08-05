"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useProofreadMutation } from "@/hooks/use-ai-text-mutations";
import { toast } from "@/lib/toast";
import { logAiAssistFailure } from "@/services/ai-text.service";

/**
 * The magic button that sits inside a long-text field: proofreads what the
 * reporter wrote, via the model behind our own backend.
 *
 * One action, not a menu. `POST /Incident/proofread` is the only rewrite the
 * backend performs — it fixes grammar, spelling and structure while preserving
 * every fact, including any uncertainty the reporter expressed. There was
 * previously a "Paraphrase" option here too, but nothing on the backend ever
 * distinguished the two, so it would have silently done the same thing under a
 * different name.
 *
 * Rendered as absolutely-positioned layers, so it expects a positioned
 * ancestor — `ReportTextareaField` provides one when given an `assistant`.
 * The controls sit bottom-right, laid out in reverse so Undo stays inboard of
 * the button rather than being pushed into the corner.
 */
export type AiTextAssistantProps = Readonly<{
  value: string;
  onApply: (next: string) => void;
  /** Called when a rewrite is accepted, so the caller can record provenance. */
  onAssisted?: () => void;
  disabled?: boolean;
  className?: string;
}>;

/** Below this there isn't enough for the model to work with. */
const MIN_CHARS = 20;

export function AiTextAssistant(props: Readonly<AiTextAssistantProps>) {
  const {
    value,
    onApply,
    onAssisted,
    disabled = false,
    className = "",
  } = props;

  const [justApplied, setJustApplied] = useState(false);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [appliedText, setAppliedText] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const proofread = useProofreadMutation();
  const isBusy = proofread.isPending;

  // Undo is only honest while the field still holds exactly what we wrote —
  // once the reporter edits on top of it, restoring would discard their work.
  const canUndo =
    originalText !== null && appliedText !== null && value === appliedText;

  useEffect(() => {
    if (!justApplied) {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      setJustApplied(false);
    }, 700);
    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [justApplied]);

  async function run() {
    const text = value.trim();

    if (text.length < MIN_CHARS) {
      toast.info(
        "Write a little more first",
        `The assistant needs at least ${String(MIN_CHARS)} characters to work with.`,
      );
      return;
    }

    try {
      const rewritten = await proofread.mutateAsync(text);

      if (rewritten.trim() === text) {
        toast.info(
          "Nothing to correct",
          "The assistant left your wording as it was.",
        );
        return;
      }

      setOriginalText(value);
      setAppliedText(rewritten);
      onApply(rewritten);
      onAssisted?.();
      setJustApplied(true);
      setStatus("Description proofread and corrected.");
      toast.success(
        "Proofread",
        "Not what you wanted? Use Undo next to the button.",
      );
    } catch (error) {
      // Never surfaces the backend's own text. A timeout is not thrown as an
      // AppException, so its message is a raw .NET string. The cause goes to
      // the console instead, so this toast is not the end of the trail.
      logAiAssistFailure("proofread", error);
      toast.error(
        "Couldn't generate a suggestion",
        "Your text is unchanged. Try again in a moment.",
      );
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
            onClick={() => void run()}
            disabled={disabled || isBusy}
            aria-label={isBusy ? "Proofreading with AI" : "Proofread with AI"}
            className={[
              "btn-sweep relative inline-flex size-7 cursor-pointer items-center justify-center rounded-full",
              "from-ehs-normal-blue to-ehs-dark-blue bg-linear-to-br text-white",
              "shadow-[0px_3px_10px_-2px_rgba(8,145,166,0.65)]",
              "transition-[transform,box-shadow] duration-150 ease-out",
              "hover:-translate-y-px hover:shadow-[0px_6px_16px_-3px_rgba(8,145,166,0.8)]",
              "active:translate-y-0 active:scale-95",
              "focus-visible:ring-ehs-normal-blue/30 focus-visible:ring-[3px] focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:hover:translate-y-0",
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

          {!isBusy ? (
            <span
              role="tooltip"
              className="bg-ehs-dark-bg pointer-events-none absolute right-0 bottom-full mb-2 hidden translate-y-1 rounded-md px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-white opacity-0 shadow-[0px_8px_20px_-8px_rgba(15,23,42,0.5)] transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 sm:block"
            >
              Proofread with AI
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
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {isBusy ? "Proofreading your description…" : status}
      </span>
    </>
  );
}
