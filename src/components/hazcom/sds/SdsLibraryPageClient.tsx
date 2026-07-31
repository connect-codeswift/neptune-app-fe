"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_SDS_RECORDS,
  HazcomGlassCard,
  HazcomModuleTabs,
  HazcomPageHeader,
} from "@/components/hazcom/shared";
import { SdsLibraryTable } from "@/components/hazcom/sds/SdsLibraryTable";

export function SdsLibraryPageClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return HAZCOM_SDS_RECORDS;
    }

    return HAZCOM_SDS_RECORDS.filter((record) =>
      [record.chemicalName, record.manufacturer, record.casNumber]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col gap-4 px-3 pb-8 sm:px-4">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "SDS Library"]}
        title="SDS Library"
        subtitle="Central repository for all Safety Data Sheets — 16-section GHS format"
        actions={
          <Link href="/dashboard/hazcom/sds/upload">
            <Button type="button" variant="primary">
              <Icon
                icon="mdi:tray-arrow-up"
                className="text-base"
                aria-hidden="true"
              />
              Upload SDS
            </Button>
          </Link>
        }
      />

      <HazcomGlassCard paddingClassName="px-4 py-3">
        <div className="flex items-center gap-3">
          <Icon
            icon="mdi:magnify"
            className="text-ehs-muted-text shrink-0 text-base"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, manufacturer, CAS#…"
            aria-label="Search SDS records"
            className="text-ehs-darker placeholder:text-ehs-muted-text min-w-0 flex-1 border-none bg-transparent text-[13px] outline-none"
          />
          <Text
            as="span"
            className="text-ehs-muted-text shrink-0 text-[12px] whitespace-nowrap"
          >
            {`${filteredRecords.length} SDS record${filteredRecords.length === 1 ? "" : "s"}`}
          </Text>
        </div>
      </HazcomGlassCard>

      <SdsLibraryTable records={filteredRecords} />
    </div>
  );
}
