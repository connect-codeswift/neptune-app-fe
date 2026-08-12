"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Icon } from "@iconify/react";
import { CapaRcaHeader } from "@/components/capa/detail/CapaRcaHeader";
import {
  CAPA_RCA_WORKSHEET,
  countRcaActions,
  countRcaWhySteps,
  type CapaRcaAction,
  type CapaRcaLane,
  type CapaRcaWhyStep,
  type CapaRcaWorksheet,
} from "@/components/capa/detail/capa-rca-data";
import type { CapaDetailRecord } from "@/components/capa/detail/capa-detail-data";
import { Text } from "@/components/Text";
import { toast } from "@/lib/toast";

export type CapaRcaContentProps = Readonly<{
  record: CapaDetailRecord;
}>;

const WHY_SLOTS = 5;

const glassCardClass =
  "relative overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']";

const cellTextareaClass =
  "min-h-16 w-full resize-none bg-transparent text-sm leading-4.5 text-[#2a3446] outline-none placeholder:text-[#8892a3]";

type EditableLane = {
  id: string;
  category: string;
  categoryClassName: string;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  contributingFactor: string;
  whys: CapaRcaWhyStep[];
  actions: CapaRcaAction[];
};

type EditTarget =
  | { kind: "factor"; laneId: string }
  | { kind: "why"; laneId: string; whyId: string };

function cloneLanes(lanes: readonly CapaRcaLane[]): EditableLane[] {
  return lanes.map((lane) => ({
    id: lane.id,
    category: lane.category,
    categoryClassName: lane.categoryClassName,
    accent: lane.accent,
    accentSoft: lane.accentSoft,
    accentGlow: lane.accentGlow,
    contributingFactor: lane.contributingFactor,
    whys: lane.whys.map((why) => ({ ...why })),
    actions: lane.actions.map((action) => ({ ...action })),
  }));
}

function markRootCauses(whys: CapaRcaWhyStep[]): CapaRcaWhyStep[] {
  return whys.map((why, index) => ({
    ...why,
    isRootCause: whys.length > 0 && index === whys.length - 1,
  }));
}

function newWhyId(): string {
  return `why-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Horizontal RCA worksheet — Figma 5472:19820. */
export function CapaRcaContent(props: CapaRcaContentProps) {
  const { record } = props;
  const [lanes, setLanes] = useState(() =>
    cloneLanes(CAPA_RCA_WORKSHEET.lanes),
  );
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const worksheet: CapaRcaWorksheet = {
    ...CAPA_RCA_WORKSHEET,
    lanes,
  };
  const whySteps = countRcaWhySteps(lanes);
  const actions = countRcaActions(lanes);

  function updateFactor(laneId: string, value: string) {
    setLanes((prev) =>
      prev.map((lane) =>
        lane.id === laneId ? { ...lane, contributingFactor: value } : lane,
      ),
    );
  }

  function updateWhy(laneId: string, whyId: string, value: string) {
    setLanes((prev) =>
      prev.map((lane) => {
        if (lane.id !== laneId) return lane;
        return {
          ...lane,
          whys: markRootCauses(
            lane.whys.map((why) =>
              why.id === whyId ? { ...why, text: value } : why,
            ),
          ),
        };
      }),
    );
  }

  function addWhy(laneId: string) {
    const id = newWhyId();
    setLanes((prev) =>
      prev.map((lane) => {
        if (lane.id !== laneId) return lane;
        if (lane.whys.length >= WHY_SLOTS) return lane;
        return {
          ...lane,
          whys: markRootCauses([...lane.whys, { id, text: "" }]),
        };
      }),
    );
    setEditTarget({ kind: "why", laneId, whyId: id });
  }

  function removeWhy(laneId: string, whyId: string) {
    setLanes((prev) =>
      prev.map((lane) => {
        if (lane.id !== laneId) return lane;
        return {
          ...lane,
          whys: markRootCauses(lane.whys.filter((why) => why.id !== whyId)),
        };
      }),
    );
    setEditTarget((current) =>
      current?.kind === "why" &&
      current.laneId === laneId &&
      current.whyId === whyId
        ? null
        : current,
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 px-4 pb-8">
      <CapaRcaHeader
        record={record}
        worksheet={worksheet}
        categories={lanes.length}
        whySteps={whySteps}
        actions={actions}
      />

      <p className="flex items-start gap-2 text-sm leading-3.75 text-[#8892a3]">
        <Icon
          icon="mdi:information-outline"
          className="mt-px size-4 shrink-0"
          aria-hidden
        />
        This is an interactive worksheet — click any cell to edit, add or remove
        Why steps, and edit corrective actions. The last step in each lane is
        the root cause.
      </p>

      <div className={`${glassCardClass} overflow-x-auto`}>
        <div className="relative z-1 min-w-275 p-4">
          <WorksheetHeader />
          <div className="mt-3 flex flex-col gap-3">
            {lanes.map((lane) => (
              <WorksheetLane
                key={lane.id}
                lane={lane}
                editTarget={editTarget}
                onEdit={setEditTarget}
                onFactorChange={(value) => updateFactor(lane.id, value)}
                onWhyChange={(whyId, value) => updateWhy(lane.id, whyId, value)}
                onAddWhy={() => addWhy(lane.id)}
                onRemoveWhy={(whyId) => removeWhy(lane.id, whyId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorksheetHeader() {
  return (
    <div className="grid grid-cols-[136px_minmax(180px,1.15fr)_repeat(5,minmax(180px,1fr))_minmax(200px,1.25fr)] items-center gap-2.5">
      <Text
        as="p"
        className="px-1 text-xs font-bold tracking-[0.84px] text-[#8892a3] uppercase"
      >
        Category
      </Text>
      <div className="rounded-2.25 border border-[rgba(15,23,42,0.08)] bg-[rgba(8,145,166,0.13)] px-3 py-2 text-center text-sm font-bold tracking-[0.23px] text-[#056e7e]">
        Contributing factor
      </div>
      {Array.from({ length: WHY_SLOTS }, (_, index) => (
        <div
          key={`why-h-${String(index + 1)}`}
          className="flex items-center justify-center gap-1.5 rounded-2.25 border border-[rgba(15,23,42,0.08)] bg-white/62 px-2 py-2 text-sm font-bold tracking-[0.23px] text-[#566072]"
        >
          <span className="inline-flex size-5 items-center justify-center rounded-[8.5px] bg-[#2a3446] text-xs font-bold tracking-[0.23px] text-[#f3f5f8]">
            {String(index + 1)}
          </span>
          Why?
        </div>
      ))}
      <div className="flex items-center justify-center gap-1.5 rounded-2.25 border border-[rgba(15,23,42,0.08)] bg-[rgba(16,185,129,0.14)] px-3 py-2 text-sm font-bold tracking-[0.23px] text-[#10b981]">
        <Icon
          icon="mdi:clipboard-check-outline"
          className="size-3 text-[#10b981]"
          aria-hidden
        />
        Corrective actions
      </div>
    </div>
  );
}

function WorksheetLane(
  props: Readonly<{
    lane: EditableLane;
    editTarget: EditTarget | null;
    onEdit: (target: EditTarget | null) => void;
    onFactorChange: (value: string) => void;
    onWhyChange: (whyId: string, value: string) => void;
    onAddWhy: () => void;
    onRemoveWhy: (whyId: string) => void;
  }>,
) {
  const {
    lane,
    editTarget,
    onEdit,
    onFactorChange,
    onWhyChange,
    onAddWhy,
    onRemoveWhy,
  } = props;
  const filled = lane.whys.length;
  const isEditingFactor =
    editTarget?.kind === "factor" && editTarget.laneId === lane.id;
  const { accent, accentSoft, accentGlow } = lane;

  return (
    <div className="grid grid-cols-[136px_minmax(180px,1.15fr)_repeat(5,minmax(180px,1fr))_minmax(200px,1.25fr)] gap-2.5">
      <div
        className={[
          "flex min-h-35 items-center justify-center rounded-2.25 border border-[rgba(15,23,42,0.08)] px-3 text-center text-sm font-bold text-[#0b1320]",
          lane.categoryClassName,
        ].join(" ")}
      >
        {lane.category}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!isEditingFactor) onEdit({ kind: "factor", laneId: lane.id });
        }}
        onKeyDown={(event) => {
          if (
            !isEditingFactor &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            onEdit({ kind: "factor", laneId: lane.id });
          }
        }}
        className="flex min-h-35 cursor-text flex-col gap-1.5 rounded-xl border border-[rgba(11,19,32,0.14)] p-3.5 text-left transition-shadow"
        style={
          isEditingFactor
            ? { boxShadow: `0px 0px 0px 3px ${accentGlow}` }
            : undefined
        }
      >
        <Text
          as="p"
          className="text-xs font-bold tracking-[0.72px] uppercase"
          style={{ color: accent }}
        >
          Contributing factor
        </Text>
        {isEditingFactor ? (
          <EditableTextarea
            value={lane.contributingFactor}
            placeholder="Describe the contributing factor…"
            onChange={onFactorChange}
            onDone={() => onEdit(null)}
          />
        ) : (
          <p className="text-sm leading-4.5 font-bold text-[#0b1320]">
            {lane.contributingFactor || (
              <span className="font-normal text-[#8892a3]">Click to edit…</span>
            )}
          </p>
        )}
      </div>

      {Array.from({ length: WHY_SLOTS }, (_, index) => {
        const why = lane.whys[index];
        const isNextEmpty = index === filled;

        if (why) {
          const isEditing =
            editTarget?.kind === "why" &&
            editTarget.laneId === lane.id &&
            editTarget.whyId === why.id;

          return (
            <WhyCell
              key={why.id}
              step={index + 1}
              text={why.text}
              accent={accent}
              accentGlow={accentGlow}
              isRootCause={why.isRootCause === true}
              isEditing={isEditing}
              onStartEdit={() =>
                onEdit({ kind: "why", laneId: lane.id, whyId: why.id })
              }
              onChange={(value) => onWhyChange(why.id, value)}
              onDone={() => onEdit(null)}
              onRemove={() => onRemoveWhy(why.id)}
            />
          );
        }

        if (isNextEmpty) {
          return (
            <AddWhyCell
              key={`add-${lane.id}-${String(index)}`}
              accent={accent}
              accentSoft={accentSoft}
              onAdd={onAddWhy}
            />
          );
        }

        return <EmptyWhyCell key={`empty-${lane.id}-${String(index)}`} />;
      })}

      <ActionsCell laneId={lane.id} actions={lane.actions} />
    </div>
  );
}

function EditableTextarea(
  props: Readonly<{
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    onDone: () => void;
  }>,
) {
  const { value, placeholder, onChange, onDone } = props;
  const ref = useRef<HTMLTextAreaElement>(null);
  const labelId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.select();
    el.style.height = "auto";
    el.style.height = `${String(el.scrollHeight)}px`;
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) {
      event.preventDefault();
      onDone();
    }
  }

  return (
    <textarea
      ref={ref}
      id={labelId}
      value={value}
      placeholder={placeholder}
      rows={3}
      onClick={(event: MouseEvent) => event.stopPropagation()}
      onChange={(event) => {
        onChange(event.target.value);
        const el = event.target;
        el.style.height = "auto";
        el.style.height = `${String(el.scrollHeight)}px`;
      }}
      onBlur={onDone}
      onKeyDown={handleKeyDown}
      className={cellTextareaClass}
    />
  );
}

function WhyCell(
  props: Readonly<{
    step: number;
    text: string;
    accent: string;
    accentGlow: string;
    isRootCause: boolean;
    isEditing: boolean;
    onStartEdit: () => void;
    onChange: (value: string) => void;
    onDone: () => void;
    onRemove: () => void;
  }>,
) {
  const {
    step,
    text,
    accent,
    accentGlow,
    isRootCause,
    isEditing,
    onStartEdit,
    onChange,
    onDone,
    onRemove,
  } = props;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!isEditing) onStartEdit();
      }}
      onKeyDown={(event) => {
        if (!isEditing && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onStartEdit();
        }
      }}
      className="relative flex min-h-35 cursor-text flex-col gap-2 rounded-xl border border-[rgba(11,19,32,0.14)] p-3.5 text-left transition-shadow"
      style={
        isRootCause || isEditing
          ? { boxShadow: `0px 0px 0px 3px ${accentGlow}` }
          : undefined
      }
    >
      <div className="flex items-center gap-1.5">
        <span
          className="inline-flex size-4.75 items-center justify-center rounded-[9.5px] text-[10.5px] font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {String(step)}
        </span>
        {isRootCause ? (
          <span
            className="inline-flex items-center gap-1 text-xs font-bold tracking-[0.54px] uppercase"
            style={{ color: accent }}
          >
            <Icon icon="mdi:target" className="size-2.5" aria-hidden />
            Root cause
          </span>
        ) : (
          <span className="text-xs font-bold tracking-[0.54px] text-[#8892a3] uppercase">
            {`Why ${String(step)}`}
          </span>
        )}
        <button
          type="button"
          aria-label="Remove why step"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="ml-auto inline-flex size-4.5 items-center justify-center rounded text-[#8892a3] hover:bg-[rgba(15,23,42,0.06)] hover:text-[#0b1320]"
        >
          <Icon icon="mdi:close" className="size-4" aria-hidden />
        </button>
      </div>
      {isEditing ? (
        <EditableTextarea
          value={text}
          placeholder="Enter why…"
          onChange={onChange}
          onDone={onDone}
        />
      ) : (
        <p className="text-sm leading-4.5 text-[#2a3446]">
          {text || <span className="text-[#8892a3]">Click to edit…</span>}
        </p>
      )}
    </div>
  );
}

function AddWhyCell(
  props: Readonly<{
    accent: string;
    accentSoft: string;
    onAdd: () => void;
  }>,
) {
  const { accent, accentSoft, onAdd } = props;
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex min-h-35 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[rgba(15,23,42,0.14)] bg-transparent text-[#8892a3] transition-colors"
    >
      <span
        className="inline-flex size-7 items-center justify-center rounded-3.25"
        style={{ backgroundColor: accentSoft, color: accent }}
      >
        <Icon icon="mdi:plus" className="size-4" aria-hidden />
      </span>
      <span className="text-sm font-normal">Add why</span>
    </button>
  );
}

function EmptyWhyCell() {
  return (
    <div className="flex min-h-35 items-center justify-center rounded-xl border border-dashed border-[rgba(15,23,42,0.14)]">
      <span className="text-sm text-[#8892a3]">—</span>
    </div>
  );
}

function ActionsCell(
  props: Readonly<{
    laneId: string;
    actions: readonly CapaRcaAction[];
  }>,
) {
  const { laneId, actions } = props;

  return (
    <div className="flex min-h-35 flex-col gap-2 rounded-xl border border-[rgba(16,185,129,0.5)] p-3.5">
      <Text
        as="p"
        className="text-xs font-bold tracking-[0.72px] text-[#10b981] uppercase"
      >
        Corrective actions
      </Text>
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <div key={action.id} className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex size-4.25 shrink-0 items-center justify-center rounded-1.25 text-[#10b981]">
              <Icon icon="mdi:check" className="size-4" aria-hidden />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-[17.4px] text-[#2a3446]">
              {action.text}
            </p>
            <button
              type="button"
              aria-label="Remove action"
              onClick={() => toast.info("Remove action coming soon")}
              className="inline-flex size-4 shrink-0 items-center justify-center text-[#8892a3] hover:text-[#0b1320]"
            >
              <Icon icon="mdi:close" className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => toast.info(`Add CAPA for ${laneId} coming soon`)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#10b981] hover:text-[#059669]"
        >
          <Icon icon="mdi:plus" className="size-3" aria-hidden />
          Add CAPA
        </button>
      </div>
    </div>
  );
}
