"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useRewriteMutation } from "@/hooks/use-ai-text-mutations";
import { toast } from "@/lib/toast";
import {
  isRejectedByAssistant,
  logAiAssistFailure,
  type AiModule,
  type RewriteOperation,
} from "@/services/ai-text.service";

/**
 * The AI buttons that sit inside a long-text field, all backed by the model
 * behind our own API.
 *
 * Draft with AI writes the field from the answers already given, and is the
 * only one that works on an empty field. It replaces what is there, so it is
 * also the redraft button.
 *
 * Proofread is the conservative one: spelling, grammar and punctuation, no
 * restructuring, and the text comes back unchanged when nothing is wrong.
 * Paraphrase rewrites — run-ons merged, events put in order, casual phrasing
 * lifted into report register, blame language ("wasn't paying attention")
 * removed — while keeping every fact and every hedge the reporter expressed.
 *
 * Buttons rather than a menu, because on a phone at a plant a menu is a second
 * tap and a decision; and one mutation between the rewrites, so a field can
 * never have two of them racing an answer into it.
 *
 * Rendered as absolutely-positioned layers, so it expects a positioned
 * ancestor — `ReportTextareaField` provides one when given an `assistant`.
 * The controls sit bottom-right, laid out in reverse so Undo stays inboard of
 * the button rather than being pushed into the corner.
 */
export type AiTextAssistantProps = Readonly<{
  /**
   * Which module's endpoints to call. Not cosmetic: each trio is gated on its
   * own `.Create` permission, and the rewrites are tense-matched to the record
   * — a near miss is over, a hazard still exists.
   */
  module: AiModule;
  value: string;
  onApply: (next: string) => void;
  /** Called when a rewrite is accepted, so the caller can record provenance. */
  onAssisted?: () => void;
  /**
   * Drafts the field from the answers already given, replacing whatever is in
   * it. Rendered as the first of the three buttons whenever it is passed.
   *
   * The rewrite buttons need words to work on, so without this an empty field's
   * controls do nothing at all — this is the one that gets the first sentence
   * onto the page, and the one to press again to start over.
   */
  onRegenerateDraft?: () => void;
  /** True while that draft call is in flight. */
  draftPending?: boolean;
  disabled?: boolean;
  className?: string;
}>;

/**
 * Below this there isn't enough for the model to work with.
 *
 * The backend enforces the same floor (`AiAssistLimits.MinRewriteChars`) and
 * answers 400 below it. This copy is the affordance — it stops the button doing
 * something useless and explains why; the server-side check is what actually
 * keeps a two-word field out of the 20-per-minute budget. **Keep the two
 * numbers in step.**
 */
const MIN_CHARS = 20;

const REWRITE_COPY: Record<
  RewriteOperation,
  Readonly<{
    label: string;
    icon: string;
    status: string;
    unchangedTitle: string;
    unchangedBody: string;
  }>
> = {
  proofread: {
    label: "Proofread",
    icon: "mdi:spellcheck",
    status: "Spelling and grammar corrected.",
    unchangedTitle: "Nothing to correct",
    unchangedBody: "The assistant left your wording as it was.",
  },
  paraphrase: {
    label: "Paraphrase",
    icon: "mdi:creation",
    status: "Rewritten in report style.",
    unchangedTitle: "Nothing to rewrite",
    unchangedBody: "The assistant left your wording as it was.",
  },
};

const REWRITE_ORDER: readonly RewriteOperation[] = ["proofread", "paraphrase"];

type AssistantButtonProps = Readonly<{
  label: string;
  icon: string;
  running: boolean;
  disabled: boolean;
  dimmed: boolean;
  onClick: () => void;
}>;

/** One of the round in-field AI controls. */
function AssistantButton(props: Readonly<AssistantButtonProps>) {
  const { label, icon, running, disabled, dimmed, onClick } = props;

  return (
    <span className="group relative inline-flex">
      {/* Soft glow, brightest while this button's call is working */}
      <span
        className={[
          "bg-ehs-normal-blue/35 pointer-events-none absolute -inset-1 rounded-full blur-[6px] transition-opacity duration-200",
          running
            ? "animate-ai-halo-pulse opacity-100 motion-reduce:animate-none"
            : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={running ? `${label} in progress` : `${label} with AI`}
        className={[
          "btn-sweep relative inline-flex size-7 cursor-pointer items-center justify-center rounded-full",
          "from-ehs-normal-blue to-ehs-dark-blue text-ehs-on-accent bg-linear-to-br",
          "shadow-[0px_3px_10px_-2px_color-mix(in_oklab,var(--ehs-normal-blue)_65%,transparent)]",
          "transition-[transform,box-shadow] duration-150 ease-out",
          "hover:-translate-y-px hover:shadow-[0px_6px_16px_-3px_color-mix(in_oklab,var(--ehs-normal-blue)_80%,transparent)]",
          "active:translate-y-0 active:scale-95",
          "focus-visible:ring-ehs-normal-blue/30 focus-visible:ring-0.75 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:hover:translate-y-0",
          dimmed ? "opacity-60" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Icon
          icon={running ? "mdi:loading" : icon}
          className={[
            "size-3.75 shrink-0 transition-transform duration-200",
            running
              ? "animate-spin motion-reduce:animate-none"
              : "group-hover:scale-110 group-hover:-rotate-12",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {!running ? (
        <span
          role="tooltip"
          className="bg-ehs-surface-inverse text-ehs-surface-inverse-text text-2.5 pointer-events-none absolute right-0 bottom-full mb-2 hidden translate-y-1 rounded-md px-2 py-1 font-semibold whitespace-nowrap opacity-0 shadow-[0px_8px_20px_-8px_rgba(15,23,42,0.5)] transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 sm:block"
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}

export function AiTextAssistant(props: Readonly<AiTextAssistantProps>) {
  const {
    module,
    value,
    onApply,
    onAssisted,
    onRegenerateDraft,
    draftPending = false,
    disabled = false,
    className = "",
  } = props;

  const [justApplied, setJustApplied] = useState(false);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [appliedText, setAppliedText] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState<RewriteOperation | null>(null);

  const rewrite = useRewriteMutation(module);
  const isBusy = rewrite.isPending;

  // Same button either way — the verb just tells the reporter whether pressing
  // it starts the field or replaces what they are looking at.
  const draftLabel = value.trim() === "" ? "Draft" : "Redraft";

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

  async function run(operation: RewriteOperation) {
    const text = value.trim();

    if (text.length < MIN_CHARS) {
      toast.info(
        "Write a little more first",
        `The assistant needs at least ${String(MIN_CHARS)} characters to work with.`,
      );
      return;
    }

    const copy = REWRITE_COPY[operation];
    setRunning(operation);

    try {
      const rewritten = await rewrite.mutateAsync({ operation, text });

      // Proofread legitimately returns the text untouched when there is
      // nothing wrong with it. That is an answer, not a failure.
      if (rewritten.trim() === text) {
        toast.info(copy.unchangedTitle, copy.unchangedBody);
        return;
      }

      setOriginalText(value);
      setAppliedText(rewritten);
      onApply(rewritten);
      onAssisted?.();
      setJustApplied(true);
      setStatus(copy.status);
      toast.success(
        copy.label,
        "Not what you wanted? Use Undo next to the buttons.",
      );
    } catch (error) {
      // Never surfaces the backend's own text. A timeout is not thrown as an
      // AppException, so its message is a raw .NET string. The cause goes to
      // the console instead, so this toast is not the end of the trail.
      logAiAssistFailure(operation, error);

      // A refusal is not a failure, and "try again in a moment" would be a lie
      // — an instruction typed into the field is refused the same way every
      // time.
      if (isRejectedByAssistant(error)) {
        toast.info(
          "That isn't report text",
          "The assistant only rewrites what happened. Your text is unchanged.",
        );
        return;
      }

      toast.error(
        "Couldn't generate a suggestion",
        "Your text is unchanged. Try again in a moment.",
      );
    } finally {
      setRunning(null);
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
      {isBusy || draftPending ? (
        // pointer-events-auto so clicks land here rather than in the field
        // being rewritten underneath.
        // Hidden, not frozen, when the viewer has asked for reduced motion. Both children
        // are decorative and carry their whole appearance in the animation: the sweep's
        // motion is entirely a transform, so stopping it leaves a bright gradient stripe
        // parked over the left third of the field, and the halo's is entirely opacity, so
        // stopping it leaves a solid ring. `animate-none` froze exactly that, for the whole
        // length of the request. The spinner on the buttons still says it is working.
        <div
          className="rounded-2.5 backdrop-blur-0.25 bg-ehs-surface/35 pointer-events-auto absolute inset-0 z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="animate-ai-blade-sweep absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(105deg,transparent_0%,color-mix(in_oklab,var(--ehs-surface)_90%,transparent)_42%,color-mix(in_oklab,var(--ehs-normal-blue)_40%,transparent)_58%,transparent_100%)] motion-reduce:hidden" />
          <div className="animate-ai-halo-pulse ring-ehs-normal-blue/45 rounded-2.5 absolute inset-0 ring-1 ring-inset motion-reduce:hidden" />
        </div>
      ) : null}

      {justApplied ? (
        <div
          // The confirmation ring is kept — it is the only in-field signal that the rewrite
          // landed — but hidden under reduced motion. It had no guard at all, so with
          // animations off the flash never ran and the ring simply sat there at full
          // strength for the whole 700ms: the stray "light" left behind after paraphrasing.
          className="animate-ai-result-flash ring-ehs-normal-blue/50 rounded-2.5 pointer-events-none absolute inset-0 z-10 ring-2 ring-inset motion-reduce:hidden"
          aria-hidden="true"
        />
      ) : null}

      <div
        className={[
          "absolute right-3 bottom-3.5 z-20 flex flex-row-reverse items-center gap-2",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Reverse order in the flex row above puts proofread nearest the
            corner, so the pair reads left-to-right as listed here. */}
        {REWRITE_ORDER.map((operation) => {
          const copy = REWRITE_COPY[operation];
          const isRunning = running === operation;

          return (
            <AssistantButton
              key={operation}
              label={copy.label}
              icon={copy.icon}
              running={isRunning}
              // Both disable while either runs: one field, one rewrite.
              disabled={disabled || isBusy || draftPending}
              dimmed={disabled || ((isBusy || draftPending) && !isRunning)}
              onClick={() => void run(operation)}
            />
          );
        })}

        {/* Last in source order, so the reversed row puts it leftmost —
            read left-to-right the field offers Draft, Proofread, Paraphrase. */}
        {onRegenerateDraft ? (
          <AssistantButton
            label={draftLabel}
            icon="mdi:auto-fix"
            running={draftPending}
            disabled={disabled || isBusy}
            dimmed={disabled || ((isBusy || draftPending) && !draftPending)}
            onClick={onRegenerateDraft}
          />
        ) : null}

        {canUndo && !isBusy && !draftPending ? (
          <button
            type="button"
            onClick={undo}
            className="text-ehs-gray hover:text-ehs-darker text-2.75 border-ehs-border-ink/10 bg-ehs-surface/85 hover:bg-ehs-surface inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 font-semibold shadow-sm backdrop-blur-sm transition-colors"
          >
            <Icon
              icon="mdi:undo-variant"
              className="size-3.25 shrink-0"
              aria-hidden="true"
            />
            Undo
          </button>
        ) : null}
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {draftPending ? `${draftLabel} in progress…` : null}
        {running ? `${REWRITE_COPY[running].label} in progress…` : status}
      </span>
    </>
  );
}
