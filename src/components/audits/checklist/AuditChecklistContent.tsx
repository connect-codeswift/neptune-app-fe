"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { useSaveAuditResponsesMutation } from "@/hooks/use-audit-mutations";
import { useAuditForTemplate } from "@/hooks/use-audit-queries";
import { useAuditTemplateDetailQuery } from "@/hooks/use-audit-template-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { getCurrentUser } from "@/lib/current-user";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import { mapDetailToChecklist } from "@/lib/map-audit-template";
import { toast } from "@/lib/toast";
import { setAuditAnswers, setAuditResult } from "@/store/audit-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AuditChecklistHeader } from "./AuditChecklistHeader";
import { AuditChecklistSkeleton } from "./AuditChecklistSkeleton";
import {
  CHECKLIST_ANSWERS,
  type ChecklistAnswer,
  type ChecklistSection,
} from "@/app/dashboard/audits/checklist/audit-checklist-data";

const AUDIT_REPORT_ROUTE = "/dashboard/audits/report";

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
              "text8 rounded-2.5 w-16 cursor-pointer px-2 py-1 transition-colors",
              isSelected
                ? "bg-ehs-green text-ehs-on-accent"
                : "text-ehs-gray bg-ehs-surface hover:bg-ehs-surface-inverse/5 border-ehs-border-ink/10 border",
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
      <header className="border-ehs-hairline/90 bg-ehs-form-classes-bg/70 border-b px-5 py-3">
        <Text as="h3" className="text3 text-ehs-darker">
          {section.title}
        </Text>
      </header>

      <ul className="flex flex-col">
        {section.items.map((item) => (
          <li
            key={item.id}
            className="border-ehs-border-ink/10 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 last:border-b-0"
          >
            <Text as="span" className="text4 text-ehs-darker min-w-0 flex-1">
              {item.question}
            </Text>

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
  const dispatch = useAppDispatch();

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

  // Which audit run this checklist belongs to, for the header and submission.
  const { audit } = useAuditForTemplate(templateId);
  const saveResponses = useSaveAuditResponsesMutation();
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

    const { userId, siteId } = getCurrentUser();
    // Every item is answered by this point, so send them all as responses.
    const responses = items.map((item) => {
      const answer = answers[item.id];

      return {
        templateItemId: Number(item.id),
        // The checklist has no response sets or per-item notes yet.
        responseOptionId: 0,
        valueText: answer === "N/A" ? "" : (answer ?? ""),
        note: "",
        isNA: answer === "N/A",
      };
    });

    saveResponses.mutate(
      {
        auditId: String(audit.id),
        payload: { userId, siteId, score, responses },
      },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Audit submitted");

          // Stash the result and the answers behind it so the report page can
          // render the summary and per-section scores, then open it.
          const result = response.dataModel;
          if (result) dispatch(setAuditResult(result));
          dispatch(setAuditAnswers(responses));
          // The report is keyed by audit — it reads everything from GET
          // /api/v1/audits/{id}, including the snapshot and recorded answers.
          router.push(
            `${AUDIT_REPORT_ROUTE}?auditid=${encodeURIComponent(String(audit.id))}`,
          );
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
    return <AuditChecklistSkeleton />;
  }

  if (detailQuery.isError || !checklist) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <Text as="p" className="text4 text-ehs-red">
          Could not load this checklist.
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <AuditChecklistHeader
        auditId={
          audit ? formatRecordDisplayId("A", audit.id) : checklist.auditId
        }
        subtitle={audit?.auditTitle || checklist.subtitle}
        // Findings aren't wired up yet — re-enable once that flow is ready.
        // onViewFindings={() =>
        //   router.push(
        //     `/dashboard/audits/findings/${encodeURIComponent(templateId)}`,
        //   )
        // }
      />

      {/* Score summary */}
      <IncidentGlassCard paddingClassName="px-5 py-4" className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text4 text-ehs-gray">
            Score:{" "}
            <span className="text5 text-ehs-darker tabular-nums">
              {`${String(score)}%`}
            </span>
          </p>

          <p className="text4 text-ehs-gray">
            Items:{" "}
            <span className="text5 text-ehs-darker tabular-nums">
              {`${String(answered.length)}/${String(items.length)} answered`}
            </span>
          </p>

          <span
            className="bg-ehs-form-classes-bg h-1.5 w-48 shrink-0 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <span
              className="bg-ehs-surface-inverse block h-full rounded-full transition-[width]"
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
          disabled={saveResponses.isPending}
          className="text4 bg-ehs-green hover:bg-ehs-green/90 rounded-2.5 cursor-pointer px-5 py-2.5 text-ehs-on-accent transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveResponses.isPending ? "Submitting…" : "Submit Audit"}
        </button>
      </div>
    </div>
  );
}
