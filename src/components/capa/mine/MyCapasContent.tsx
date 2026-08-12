"use client";

import { IncidentGlassCard } from "@/components/incidents";
import { MyCapasHeader } from "@/components/capa/mine/MyCapasHeader";
import {
  MY_CAPAS_ASSIGNED,
  MY_CAPAS_OVERDUE,
  MY_CAPAS_PENDING_VERIFICATION,
  type MyCapaCardItem,
} from "@/components/capa/mine/my-capas-data";
import { Text } from "@/components/Text";

function MyCapasSectionCard(
  props: Readonly<{
    title: string;
    items: readonly MyCapaCardItem[];
    emptyLabel?: string;
    tone?: "default" | "overdue";
  }>,
) {
  const { title, items, emptyLabel, tone = "default" } = props;
  const isEmpty = items.length === 0;

  return (
    <IncidentGlassCard
      paddingClassName="p-4.25"
      className="min-h-37.25 min-w-0 rounded-2xl"
    >
      <Text as="h3" className="mb-3 text-base font-medium text-[#566072]">
        {title}
      </Text>

      {isEmpty ? (
        emptyLabel ? (
          <div className="flex flex-1 items-center justify-center py-4">
            <Text
              as="p"
              className="text-center text-sm leading-4 text-[#8892a3]"
            >
              {emptyLabel}
            </Text>
          </div>
        ) : (
          <div className="flex-1" />
        )
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => (
            <li key={item.id}>
              {tone === "overdue" ? (
                <OverdueItem item={item} />
              ) : (
                <DefaultItem item={item} />
              )}
            </li>
          ))}
        </ul>
      )}
    </IncidentGlassCard>
  );
}

function DefaultItem(props: Readonly<{ item: MyCapaCardItem }>) {
  const { item } = props;

  return (
    <div className="rounded-2.5 border border-[rgba(15,23,42,0.08)] bg-white/70 px-3 py-3">
      <Text as="p" className="text-xs leading-4 text-[#566072]">
        {item.code}
      </Text>
      <Text as="p" className="mt-1 text-sm leading-5 text-[#0b1320]">
        {item.title}
      </Text>
    </div>
  );
}

function OverdueItem(props: Readonly<{ item: MyCapaCardItem }>) {
  const { item } = props;

  return (
    <div className="rounded-2.5 border border-[rgba(251,44,54,0.2)] bg-[rgba(239,68,68,0.1)] px-3 py-3">
      <Text as="p" className="text-sm leading-4 text-[#ef4444]">
        {item.code}
      </Text>
      <Text
        as="p"
        className="mt-1 overflow-hidden text-base leading-5 text-ellipsis whitespace-nowrap text-[#0b1320]"
      >
        {item.title}
      </Text>
    </div>
  );
}

/** My CAPAs page content — Figma 838:3105. */
export function MyCapasContent() {
  return (
    <div className="flex min-w-0 flex-col gap-6 px-4 pb-8">
      <MyCapasHeader />

      <div className="grid grid-cols-1 items-stretch gap-3.5 lg:grid-cols-3">
        <MyCapasSectionCard title="Assigned to Me" items={MY_CAPAS_ASSIGNED} />
        <MyCapasSectionCard
          title="Pending My Verification"
          items={MY_CAPAS_PENDING_VERIFICATION}
          emptyLabel="No pending verifications"
        />
        <MyCapasSectionCard
          title="Overdue"
          items={MY_CAPAS_OVERDUE}
          tone="overdue"
        />
      </div>
    </div>
  );
}
