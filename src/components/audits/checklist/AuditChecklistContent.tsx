"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentGlassCard } from "@/components/incidents";
import { toast } from "@/lib/toast";
import { AuditChecklistHeader } from "./AuditChecklistHeader";
import {
  CHECKLIST_ANSWERS,
  getAuditChecklist,
  type ChecklistAnswer,
  type ChecklistSection,
} from "@/app/dashboard/audits/checklist/audit-checklist-data";

const AUDIT_LIST_ROUTE = "/dashboard/audits";

type AnswerMap = Record<string, ChecklistAnswer | undefined>;

/** Four-way response control; the chosen answer fills green. */
function AnswerToggle(
  props: Readonly<{
    itemId: string;
    question: string;
    value: ChecklistAnswer | undefined;
    onChange: (answer: ChecklistAnswer) => void;
  }>,
) {
  const { itemId, question, value, onChange } = props;

  return (
    <div
      role="radiogroup"
      aria-label={question}
      className="flex shrink-0 items-center gap-2"
    >
      {CHECKLIST_ANSWERS.map((answer) => {
        const isSelected = value === answer;

        return (
          <button
            key={`${itemId}-${answer}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(answer)}
            className={[
              "w-16 cursor-pointer rounded-[10px] px-2 py-1 text-sm font-medium transition-colors",
              isSelected
                ? "bg-ehs-green text-white"
                : "text-ehs-gray border border-[rgba(15,23,42,0.1)] bg-white hover:bg-black/5",
            ].join(" ")}
          >
            {answer}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard(
  props: Readonly<{
    section: ChecklistSection;
    answers: AnswerMap;
    onAnswer: (itemId: string, answer: ChecklistAnswer) => void;
  }>,
) {
  const { section, answers, onAnswer } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className="min-w-0"
    >
      <header className="border-b border-white/90 bg-[rgba(238,241,246,0.7)] px-5 py-3">
        <h3 className="text-ehs-dark-bg text-lg font-semibold">
          {section.title}
        </h3>
      </header>

      <ul className="flex flex-col">
        {section.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 px-5 py-4 last:border-b-0"
          >
            <span className="text-ehs-darker min-w-0 flex-1">
              {item.question}
            </span>

            <AnswerToggle
              itemId={item.id}
              question={item.question}
              value={answers[item.id]}
              onChange={(answer) => onAnswer(item.id, answer)}
            />
          </li>
        ))}
      </ul>
    </IncidentGlassCard>
  );
}

export type AuditChecklistContentProps = Readonly<{ templateId: string }>;

export function AuditChecklistContent(props: AuditChecklistContentProps) {
  const { templateId } = props;
  const router = useRouter();

  const checklist = useMemo(() => getAuditChecklist(templateId), [templateId]);
  const items = useMemo(
    () => checklist.sections.flatMap((section) => section.items),
    [checklist],
  );

  const [answers, setAnswers] = useState<AnswerMap>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.defaultAnswer])),
  );

  // Score counts "Yes" against everything scorable — N/A items don't apply.
  const answered = items.filter((item) => answers[item.id] !== undefined);
  const scorable = answered.filter((item) => answers[item.id] !== "N/A");
  const passed = scorable.filter((item) => answers[item.id] === "Yes");
  const score =
    scorable.length > 0
      ? Math.round((passed.length / scorable.length) * 100)
      : 0;
  const completion =
    items.length > 0 ? (answered.length / items.length) * 100 : 0;

  const handleSubmit = () => {
    if (answered.length < items.length) {
      toast.error(
        `Answer all ${String(items.length)} items before submitting.`,
      );
      return;
    }

    // TODO: wire to an audit-submit mutation once the service exists.
    toast.success("Audit submitted");
    router.push(AUDIT_LIST_ROUTE);
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <AuditChecklistHeader
        auditId={checklist.auditId}
        subtitle={checklist.subtitle}
        onViewFindings={() =>
          router.push(
            `/dashboard/audits/findings/${encodeURIComponent(templateId)}`,
          )
        }
      />

      {/* Score summary */}
      <IncidentGlassCard paddingClassName="px-5 py-4" className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-ehs-gray">
            Score:{" "}
            <span className="text-ehs-dark-bg text-lg font-bold tabular-nums">
              {`${String(score)}%`}
            </span>
          </p>

          <p className="text-ehs-gray">
            Items:{" "}
            <span className="text-ehs-dark-bg tabular-nums">
              {`${String(answered.length)}/${String(items.length)} answered`}
            </span>
          </p>

          <span
            className="h-1.5 w-48 shrink-0 overflow-hidden rounded-full bg-[#eef1f6]"
            aria-hidden="true"
          >
            <span
              className="bg-ehs-dark-bg block h-full rounded-full transition-[width]"
              style={{ width: `${String(completion)}%` }}
            />
          </span>
        </div>
      </IncidentGlassCard>

      {checklist.sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          answers={answers}
          onAnswer={(itemId, answer) => {
            setAnswers((previous) => ({ ...previous, [itemId]: answer }));
          }}
        />
      ))}

      <div className="flex">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-ehs-green hover:bg-ehs-green/90 cursor-pointer rounded-[10px] px-5 py-2.5 font-medium text-white transition-colors"
        >
          Submit Audit
        </button>
      </div>
    </div>
  );
}
