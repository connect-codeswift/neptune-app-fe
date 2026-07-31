"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_CHEMICALS,
  HazcomModuleTabs,
  HazcomPageHeader,
} from "@/components/hazcom/shared";
import { ChemicalListTable } from "@/components/hazcom/chemicals/ChemicalListTable";
import {
  chemicalMatchesSearch,
  exportChemicalsToCsv,
} from "@/components/hazcom/chemicals/chemical-utils";

export type ChemicalListViewProps = Readonly<{
  className?: string;
}>;

const searchInputClass =
  "border-ehs-border text-ehs-darker placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 h-10 w-full rounded-lg border bg-white py-2 pr-3.5 pl-9 text-[13px] shadow-sm outline-none transition focus:ring-2";

export function ChemicalListView(props: Readonly<ChemicalListViewProps>) {
  const { className = "" } = props;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChemicals = useMemo(
    () =>
      HAZCOM_CHEMICALS.filter((chemical) =>
        chemicalMatchesSearch(chemical, searchQuery),
      ),
    [searchQuery],
  );

  return (
    <div
      className={["flex min-w-0 flex-col gap-5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Chemical Inventory"]}
        title="Chemical Inventory"
        subtitle="All hazardous chemicals on-site — quantities, locations, and SDS links"
        actions={
          <>
            <Button
              type="button"
              variant="tertiary"
              onClick={() => exportChemicalsToCsv(HAZCOM_CHEMICALS)}
              className="rounded-lg px-4 py-2 text-[13px]"
            >
              <Icon icon="mdi:download" className="text-base" aria-hidden="true" />
              Export
            </Button>
            <Link href="/dashboard/hazcom/chemicals/new">
              <Button
                type="button"
                variant="primary"
                className="rounded-lg px-4 py-2 text-[13px]"
              >
                <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
                Add Chemical
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-0 flex-1">
          <Icon
            icon="mdi:magnify"
            className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, CAS#, location..."
            aria-label="Search chemicals"
            className={searchInputClass}
          />
        </div>
        <Text as="p" className="text-ehs-muted-text shrink-0 text-[13px]">
          {`${String(filteredChemicals.length)} ${
            filteredChemicals.length === 1 ? "chemical" : "chemicals"
          }`}
        </Text>
      </div>

      <ChemicalListTable chemicals={filteredChemicals} />
    </div>
  );
}
