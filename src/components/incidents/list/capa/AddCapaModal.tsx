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
  const [controlLevel, setControlLevel] = useState<ControlLevel | null>(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>(TYPE_OPTIONS[0]);
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>(PRIORITY_OPTIONS[1]);

  const canSubmit = controlLevel != null && description.trim().length > 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1320]/45 p-3.5 backdrop-blur-[3px] sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-[928px] flex-col overflow-hidden rounded-2xl bg-[#e5e9ec] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all"
      >
        {/* Header Section */}
        <header className="relative shrink-0 border-b border-[#cfd6d9] px-4 py-4 sm:px-8 sm:pt-7 sm:pb-[17px]">
          <Text
            as="h2"
            id={titleId}
            className="pr-10 text-[18px] leading-7 font-normal text-[#1e293b] sm:text-[20px]"
          >
            Add CAPA
          </Text>
          <Text
            as="p"
            className="mt-0.5 truncate text-[12px] leading-5 font-normal text-[#64748b] sm:mt-1 sm:text-[14px]"
          >
            {`${incidentId} · ${incidentTitle} · new ${capaId}`}
          </Text>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg bg-white/40 transition-colors hover:bg-white/70 sm:top-7 sm:right-7"
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

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:pt-8 sm:pb-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-8 lg:gap-12">
            {/* Step 1: Select Control Level */}
            <section className="w-full shrink-0 md:w-[320px] lg:w-[380px]">
              <div className="mb-4 flex flex-col gap-[5px] sm:mb-6">
                <div className="flex items-center gap-2.5">
                  <StepBadge step="1" />
                  <Text
                    as="h3"
                    className="text-[15px] leading-6 font-normal text-[#1e293b] sm:text-[16px]"
                  >
                    Select control level
                  </Text>
                </div>
                <Text
                  as="p"
                  className="text-[12px] leading-[19.5px] font-normal text-[#64748b] sm:text-[13px]"
                >
                  Most → least effective. Prefer higher-order controls.
                </Text>
              </div>

              <CapaHierarchySelector
                value={controlLevel}
                onChange={setControlLevel}
              />
            </section>

            {/* Step 2: What CAPA is needed */}
            <section className="min-w-0 flex-1">
              <div className="mb-4 flex items-center gap-2.5 sm:mb-6">
                <StepBadge step="2" />
                <Text
                  as="h3"
                  className="text-[15px] leading-6 font-normal text-[#1e293b] sm:text-[16px]"
                >
                  What CAPA is needed?
                </Text>
              </div>

              <div className="flex flex-col gap-[18px]">
                {/* Action description */}
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
                    className="h-[100px] w-full resize-none rounded-xl bg-white px-3.5 py-3 text-[13.5px] leading-5 text-[#1e293b] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#06939b]/25 sm:h-[108px] sm:text-[14px]"
                  />
                </div>

                {/* Type Toggle */}
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Type</FieldLabel>
                  <CapaSegmentedToggle
                    ariaLabel="CAPA type"
                    options={TYPE_OPTIONS}
                    value={type}
                    onChange={setType}
                  />
                </div>

                {/* Owner & Due Date Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor={ownerFieldId}>Owner</FieldLabel>
                    <input
                      id={ownerFieldId}
                      type="text"
                      value={owner}
                      onChange={(event) => setOwner(event.target.value)}
                      placeholder="e.g. M. Torres"
                      className="h-10 w-full rounded-[10px] bg-white px-3.5 text-[13.5px] text-[#1e293b] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#06939b]/25 sm:text-[14px]"
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
                        className="h-10 w-full rounded-[10px] bg-white px-3.5 pr-10 text-[13.5px] text-[#1e293b] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#06939b]/25 sm:text-[14px]"
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

                {/* Priority Toggle */}
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

        {/* Footer Actions */}
        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#cfd6d9] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <Text
            as="p"
            className="text-center text-[12px] leading-[19.5px] text-[#94a3b8] sm:text-left sm:text-[13px]"
          >
            {controlLevel
              ? `${controlLevel} selected`
              : "Select a control level to continue"}
          </Text>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#cbd5e1] px-[20px] py-[9.5px] text-[13px] leading-[19.5px] text-[#334155] transition-colors hover:bg-white/60 sm:flex-initial sm:px-[25px] sm:py-[11px]"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={[
                "inline-flex h-[39.5px] min-w-[134px] flex-1 items-center justify-center gap-2 rounded-xl px-5 text-[13px] leading-[19.5px] font-medium text-white transition-colors sm:flex-initial",
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
