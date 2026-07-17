"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Text } from "@/components/Text";
import {
  CapaHierarchySelector,
  type ControlLevel,
} from "@/components/incidents/list/capa/CapaHierarchySelector";
import { CapaSegmentedToggle } from "@/components/incidents/list/capa/CapaSegmentedToggle";

export type AddCapaModalProps = Readonly<{
  incidentId: string;
  incidentTitle: string;
  capaId?: string;
  onClose: () => void;
  onSubmit?: (payload: {
    controlLevel: ControlLevel;
    description: string;
    type: string;
    owner: string;
    dueDate: string;
    priority: string;
  }) => void;
}>;

const TYPE_OPTIONS = ["Corrective", "Preventive"] as const;
const PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;

function StepBadge(props: Readonly<{ step: string }>) {
  const { step } = props;

  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#06939b] pt-[1.5px] pb-[2.5px] text-[14px] leading-5 text-white">
      {step}
    </span>
  );
}

function FieldLabel(
  props: Readonly<{ children: string; required?: boolean; htmlFor?: string }>,
) {
  const { children, required = false, htmlFor } = props;

  return (
    <label
      htmlFor={htmlFor}
      className="block text-[13px] leading-[19.5px] text-[#475569]"
    >
      {children}
      {required ? <span className="text-ehs-red"> *</span> : null}
    </label>
  );
}

export function AddCapaModal(props: Readonly<AddCapaModalProps>) {
  const {
    incidentId,
    incidentTitle,
    capaId = "CAPA-0423",
    onClose,
    onSubmit,
  } = props;

  const titleId = useId();
  const descriptionFieldId = useId();
  const ownerFieldId = useId();
  const dueDateFieldId = useId();

  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [controlLevel, setControlLevel] = useState<ControlLevel | null>(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>(TYPE_OPTIONS[0]);
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>(PRIORITY_OPTIONS[1]);

  const canSubmit = controlLevel != null && description.trim().length > 0;

  useEffect(() => {
    setMounted(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const fitToViewport = () => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const availableHeight = window.innerHeight - 32;
      const availableWidth = window.innerWidth - 32;
      const nextScale = Math.min(
        1,
        availableHeight / dialog.offsetHeight,
        availableWidth / dialog.offsetWidth,
      );

      setScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", fitToViewport);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(fitToViewport);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", fitToViewport);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleSubmit = () => {
    if (!controlLevel || !canSubmit) {
      return;
    }

    onSubmit?.({
      controlLevel,
      description: description.trim(),
      type,
      owner: owner.trim(),
      dueDate,
      priority,
    });
    onClose();
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1320]/35 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        style={{ transform: `scale(${scale})` }}
        className="flex w-full max-w-[928px] origin-center flex-col overflow-hidden rounded-2xl bg-[#e5e9ec] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
      >
        <header className="relative shrink-0 border-b border-[#cfd6d9] px-8 pt-7 pb-[17px]">
          <Text
            as="h2"
            id={titleId}
            className="pr-12 text-[20px] leading-7 font-normal text-[#1e293b]"
          >
            Add CAPA
          </Text>
          <Text
            as="p"
            className="mt-1 text-[14px] leading-5 font-normal text-[#64748b]"
          >
            {`${incidentId} · ${incidentTitle} · new ${capaId}`}
          </Text>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="absolute top-7 right-7 flex size-8 items-center justify-center rounded-lg bg-white/40 transition-colors hover:bg-white/70"
          >
            <img
              src="/icons/capa/close.svg"
              alt=""
              width={16}
              height={16}
              className="size-4"
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="overflow-hidden px-8 pt-8 pb-10">
          <div className="flex items-start gap-12">
            <section className="w-[392px] shrink-0">
              <div className="mb-6 flex flex-col gap-[5px]">
                <div className="flex items-center gap-2.5">
                  <StepBadge step="1" />
                  <Text
                    as="h3"
                    className="text-[16px] leading-6 font-normal text-[#1e293b]"
                  >
                    Select control level
                  </Text>
                </div>
                <Text
                  as="p"
                  className="text-[13px] leading-[19.5px] font-normal text-[#64748b]"
                >
                  Most → least effective. Prefer higher-order controls.
                </Text>
              </div>

              <CapaHierarchySelector
                value={controlLevel}
                onChange={setControlLevel}
              />
            </section>

            <section className="min-w-0 flex-1">
              <div className="mb-6 flex items-center gap-2.5">
                <StepBadge step="2" />
                <Text
                  as="h3"
                  className="text-[16px] leading-6 font-normal text-[#1e293b]"
                >
                  What CAPA is needed?
                </Text>
              </div>

              <div className="flex flex-col gap-[19px]">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={descriptionFieldId} required>
                    Action description
                  </FieldLabel>
                  <textarea
                    id={descriptionFieldId}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the corrective / preventive action..."
                    rows={3}
                    className="h-[108px] w-full resize-none rounded-xl bg-white px-3.5 py-3.5 text-[14px] leading-5 text-[#1e293b] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#06939b]/25"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Type</FieldLabel>
                  <CapaSegmentedToggle
                    ariaLabel="CAPA type"
                    options={TYPE_OPTIONS}
                    value={type}
                    onChange={setType}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor={ownerFieldId}>Owner</FieldLabel>
                    <input
                      id={ownerFieldId}
                      type="text"
                      value={owner}
                      onChange={(event) => setOwner(event.target.value)}
                      placeholder="e.g. M. Torres"
                      className="h-10 w-full rounded-[10px] bg-white px-3.5 text-[14px] text-[#1e293b] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#06939b]/25"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor={dueDateFieldId}>Due date</FieldLabel>
                    <div className="relative">
                      <input
                        id={dueDateFieldId}
                        type="text"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="h-10 w-full rounded-[10px] bg-white px-3.5 pr-10 text-[14px] text-[#1e293b] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#06939b]/25"
                      />
                      <img
                        src="/icons/capa/calendar.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Priority</FieldLabel>
                  <CapaSegmentedToggle
                    ariaLabel="CAPA priority"
                    options={PRIORITY_OPTIONS}
                    value={priority}
                    onChange={setPriority}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#cfd6d9] px-8 pt-[21px] pb-5">
          <Text as="p" className="text-[13px] leading-[19.5px] text-[#94a3b8]">
            {controlLevel
              ? `${controlLevel} selected`
              : "Select a control level to continue"}
          </Text>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#cbd5e1] px-[25px] py-[11px] text-[13px] leading-[19.5px] text-[#334155] transition-colors hover:bg-white/60"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={[
                "inline-flex h-[39.5px] min-w-[134px] items-center justify-center gap-2 rounded-xl px-5 text-[13px] leading-[19.5px] text-white transition-colors",
                canSubmit
                  ? "bg-[#06939b] hover:bg-[#058189]"
                  : "cursor-not-allowed bg-[#7bc1c5]",
              ].join(" ")}
            >
              <img
                src="/icons/capa/plus.svg"
                alt=""
                width={16}
                height={16}
                className="size-4"
                aria-hidden="true"
              />
              Add CAPA
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
