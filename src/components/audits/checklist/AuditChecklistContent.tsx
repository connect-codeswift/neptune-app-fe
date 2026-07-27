"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentGlassCard } from "@/components/incidents";
import { useSubmitAuditMutation } from "@/hooks/use-audit-mutations";
import { useAuditForTemplate } from "@/hooks/use-audit-queries";
import { useAuditTemplateDetailQuery } from "@/hooks/use-audit-template-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { getCurrentUser } from "@/lib/current-user";
import { mapDetailToChecklist } from "@/lib/map-audit-template";
import { toast } from "@/lib/toast";
import { useAppSelector } from "@/store/hooks";
import { AuditChecklistHeader } from "./AuditChecklistHeader";
import {
  CHECKLIST_ANSWERS,
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

  // Basic info may have been stashed in the store when the template was chosen,
  // but only trust it when it's this template — it can be left over from an
  // earlier Use/Edit. Sections and items always come from the query.
  const storedSummary = useAppSelector((state) => state.auditTemplate.selected);
  const summary =
    storedSummary && String(storedSummary.id) === templateId
      ? storedSummary
      : null;
  const detailQuery = useAuditTemplateDetailQuery(templateId, summary);
  const checklist = useMemo(
    () =>
      detailQuery.data
        ? mapDetailToChecklist(detailQuery.data, templateId)
        : null,
    [detailQuery.data, templateId],
  );
  const items = useMemo(
    () => checklist?.sections.flatMap((section) => section.items) ?? [],
    [checklist],
  );
  console.log(checklist);

  // Which audit run this checklist belongs to, for the header and submission.
  const { audit } = useAuditForTemplate(templateId);
  const submitAudit = useSubmitAuditMutation();
  // A fresh audit run starts with nothing answered.
  const [answers, setAnswers] = useState<AnswerMap>({});

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

    if (!audit) {
      toast.error("No audit found for this template.");
      return;
    }

    const { userId, subCompanyId } = getCurrentUser();
    // Every item is answered by this point, so send them all as responses.
    const responses = items.map((item) => ({
      itemId: Number(item.id),
      answer: answers[item.id] ?? "",
    }));

    console.log(responses);

    submitAudit.mutate(
      {
        auditId: String(audit.id),
        payload: { userId, subCompanyId, responses },
      },
      {
        onSuccess: () => {
          toast.success("Audit submitted");
          router.push(AUDIT_LIST_ROUTE);
        },
        onError: (error) => {
          toast.error(
            getMutationErrorMessage(
              error,
              "Could not submit the audit. Please try again.",
            ),
          );
        },
      },
    );
  };

  if (detailQuery.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <p className="text-ehs-muted-text text-sm">Loading checklist...</p>
      </div>
    );
  }

  if (detailQuery.isError || !checklist) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <p className="text-ehs-red text-sm">Could not load this checklist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <AuditChecklistHeader
        auditId={audit ? `A-${String(audit.id)}` : checklist.auditId}
        subtitle={audit?.auditTitle || checklist.subtitle}
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
          disabled={submitAudit.isPending}
          className="bg-ehs-green hover:bg-ehs-green/90 cursor-pointer rounded-[10px] px-5 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitAudit.isPending ? "Submitting…" : "Submit Audit"}
        </button>
      </div>
    </div>
  );
}
