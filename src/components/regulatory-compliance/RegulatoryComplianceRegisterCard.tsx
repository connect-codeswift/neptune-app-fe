"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  ComplianceObligationItem,
  ComplianceStatusType,
  JurisdictionType,
} from "./regulatory-compliance-types";

export type RegulatoryComplianceRegisterCardProps = Readonly<{
  items: readonly ComplianceObligationItem[];
  searchQuery?: string;
  className?: string;
}>;

const JURISDICTION_OPTIONS: readonly JurisdictionType[] = [
  "All",
  "Federal",
  "State",
  "Local",
];

const STATUS_OPTIONS: readonly ComplianceStatusType[] = [
  "All",
  "Compliant",
  "Due soon",
  "Action",
];

export function RegulatoryComplianceRegisterCard(
  props: RegulatoryComplianceRegisterCardProps,
) {
  const { items, searchQuery = "", className = "" } = props;

  const [selectedJurisdiction, setSelectedJurisdiction] =
    useState<JurisdictionType>("All");
  const [selectedStatus, setSelectedStatus] =
    useState<ComplianceStatusType>("All");

  const filteredItems = items.filter((item) => {
    // Jurisdiction filter
    if (
      selectedJurisdiction !== "All" &&
      item.jurisdiction !== selectedJurisdiction
    ) {
      return false;
    }
    // Status filter
    if (selectedStatus !== "All") {
      if (selectedStatus === "Action" && item.status !== "Action required") {
        return false;
      }
      if (selectedStatus === "Compliant" && item.status !== "Compliant") {
        return false;
      }
      if (selectedStatus === "Due soon" && item.status !== "Due soon") {
        return false;
      }
    }
    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchCode = item.code.toLowerCase().includes(q);
      const matchObligation = item.obligation.toLowerCase().includes(q);
      if (!matchCode && !matchObligation) {
        return false;
      }
    }
    return true;
  });

  return (
    <div
      className={[
        "flex flex-col overflow-hidden rounded-[20px] border border-white/90 bg-white/70 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.05)] backdrop-blur-md",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Card Header: Title + Filter Pills */}
      <div className="flex flex-col gap-3 border-b border-[rgba(15,23,42,0.06)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[17px] leading-tight font-bold text-[#0f172a]">
          Register
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Jurisdiction Filters */}
          <div className="flex items-center gap-0.5 rounded-lg bg-[rgba(15,23,42,0.04)] p-1">
            {JURISDICTION_OPTIONS.map((opt) => {
              const isActive = selectedJurisdiction === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedJurisdiction(opt)}
                  className={[
                    "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all",
                    isActive
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]",
                  ].join(" ")}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-0.5 rounded-lg bg-[rgba(15,23,42,0.04)] p-1">
            {STATUS_OPTIONS.map((opt) => {
              const isActive = selectedStatus === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedStatus(opt)}
                  className={[
                    "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all",
                    isActive
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]",
                  ].join(" ")}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[rgba(15,23,42,0.06)] bg-[rgba(15,23,42,0.01)] text-[11px] font-bold tracking-[0.06em] text-[#94a3b8] uppercase">
              <th className="px-5 py-3">CODE</th>
              <th className="px-4 py-3">OBLIGATION</th>
              <th className="px-4 py-3 text-center">JURISDICTION</th>
              <th className="px-4 py-3 text-center">STATUS</th>
              <th className="px-4 py-3 text-center">NEXT DUE</th>
              <th className="px-5 py-3 text-right">EVIDENCE</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[rgba(15,23,42,0.05)] text-[13px]">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#64748b]">
                  No compliance obligations match the selected filters.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isHighlight = item.isHighlighted;
                return (
                  <tr
                    key={item.id}
                    className={[
                      "transition-colors hover:bg-white/90",
                      isHighlight
                        ? "bg-[#e6f7f9] hover:bg-[#d9f2f5]"
                        : "bg-transparent",
                    ].join(" ")}
                  >
                    {/* CODE */}
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap text-[#64748b]">
                      <Link
                        href={`/dashboard/regulatory-compliance/${item.id}`}
                        className="hover:text-[#0f172a] hover:underline"
                      >
                        {item.code}
                      </Link>
                    </td>

                    {/* OBLIGATION */}
                    <td className="px-4 py-3.5 font-bold text-[#0f172a]">
                      <Link
                        href={`/dashboard/regulatory-compliance/${item.id}`}
                        className="hover:text-[#0891a6] hover:underline"
                      >
                        {item.obligation}
                      </Link>
                    </td>

                    {/* JURISDICTION */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex rounded-md bg-[#e2e8f0]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#475569]">
                        {item.jurisdiction}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={[
                          "inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-bold",
                          item.status === "Action required"
                            ? "bg-[#cbd5e1] text-[#0f172a]"
                            : item.status === "Due soon"
                              ? "bg-[#e2e8f0]/90 text-[#334155]"
                              : "bg-[#e2e8f0]/60 text-[#475569]",
                        ].join(" ")}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* NEXT DUE */}
                    <td className="px-4 py-3.5 text-center font-medium whitespace-nowrap text-[#64748b]">
                      {item.nextDue}
                    </td>

                    {/* EVIDENCE */}
                    <td className="px-5 py-3.5 text-right font-medium whitespace-nowrap">
                      <button
                        type="button"
                        className="text-[13px] font-semibold text-[#0891a6] hover:text-[#005f70] hover:underline"
                      >
                        {item.evidenceText}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
