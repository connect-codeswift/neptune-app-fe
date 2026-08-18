import { createColumnHelper } from "@tanstack/react-table";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { TableColumns } from "@/components/ui/table-columns";
import type {
  LotoHistoryRecord,
  LotoHistoryResult,
} from "@/app/dashboard/lockout-tagout/loto-data";

const columnHelper = createColumnHelper<LotoHistoryRecord>();

function columnHeader(label: string) {
  return (
    <Text as="span" className="text6 text-ehs-muted-text">
      {label}
    </Text>
  );
}

export function buildLotoHistoryColumns(): TableColumns<LotoHistoryRecord> {
  return [
    columnHelper.accessor("logId", {
      header: () => columnHeader("Log ID"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-normal-blue font-mono">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("equipment", {
      header: () => columnHeader("Equipment"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-darker line-clamp-1">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("operator", {
      header: () => columnHeader("Operator"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-gray">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("lockNumber", {
      header: () => columnHeader("Lock"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-gray font-mono">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("startAt", {
      header: () => columnHeader("Start"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-gray whitespace-nowrap">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("endAt", {
      header: () => columnHeader("End"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-muted-text whitespace-nowrap">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("purpose", {
      header: () => columnHeader("Purpose"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-gray line-clamp-1 max-w-40">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("duration", {
      header: () => columnHeader("Duration"),
      size: 90,
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-muted-text font-mono">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("result", {
      header: () => columnHeader("Result"),
      size: 110,
      cell: (info) => {
        const result = info.getValue() as LotoHistoryResult;
        return (
          <IncidentBadge
            label={result}
            tone={result === "Completed" ? "teal" : "danger"}
            showDot
          />
        );
      },
      meta: { align: "left" as const },
    }),
  ];
}
