import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  AuditDetailDto,
  AuditRecordedResponseDto,
  AuditSnapshotItemDto,
  AuditSnapshotSectionDto,
} from "@/dtos/res/audit-response.dto";

/**
 * The recorded answer for one item, or "—" when it was left unanswered.
 *
 * `severity` first, `valueText` second. The two carry the same grade word today
 * because the perform screen writes it to both, but answers recorded before
 * that only have `severity` — reading `valueText` alone rendered every one of
 * them as "—" on this tab while the perform screen showed them correctly
 * graded. `hydrateAnswers` in audit-perform-state.ts falls back the same way.
 */
function answerTextFor(
  item: AuditSnapshotItemDto,
  responses: readonly AuditRecordedResponseDto[],
): string {
  const response = responses.find((entry) => entry.templateItemId === item.id);
  if (!response) return "—";
  if (response.isNA) return "N/A";
  return response.severity?.trim() || response.valueText.trim() || "—";
}

function SectionCard(
  props: Readonly<{
    section: AuditSnapshotSectionDto;
    responses: readonly AuditRecordedResponseDto[];
  }>,
) {
  const { section, responses } = props;
  const items = [...section.items].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className="min-w-0"
    >
      <header className="border-ehs-hairline/90 bg-ehs-form-classes-bg/70 border-b px-5 py-3">
        <Text as="h3" className="text3 text-ehs-darker">
          {section.sectionTitle}
        </Text>
      </header>

      <ul className="flex flex-col">
        {items.map((item) => (
          <li
            key={item.id}
            className="border-ehs-border-ink/10 flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 last:border-b-0"
          >
            <Text as="span" className="text4 text-ehs-darker min-w-0 flex-1">
              {item.question}
            </Text>
            <Text
              as="span"
              className="text4 text-ehs-gray max-w-72 shrink-0 text-right"
            >
              {answerTextFor(item, responses)}
            </Text>
          </li>
        ))}
      </ul>
    </IncidentGlassCard>
  );
}

export type AuditChecklistViewProps = Readonly<{ audit: AuditDetailDto }>;

/** Read-only view of an already-scheduled audit's questions and answers. */
export function AuditChecklistView(props: AuditChecklistViewProps) {
  const { audit } = props;
  const sections = [...(audit.snapshot?.sections ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );
  const responses = audit.responses ?? [];

  if (sections.length === 0) {
    return (
      <EmptyState
        icon="mdi:format-list-checks"
        title="No checklist items"
        message="This audit's template has no sections to show."
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-200 min-w-0 flex-col gap-3.5">
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} responses={responses} />
      ))}
    </div>
  );
}
