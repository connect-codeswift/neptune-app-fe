"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CapaDashboardFilters } from "@/components/capa/CapaDashboardFilters";
import { CapaDashboardFooterCards } from "@/components/capa/CapaDashboardFooterCards";
import { CapaDashboardMetrics } from "@/components/capa/CapaDashboardMetrics";
import { CapaDetailPanel } from "@/components/capa/CapaDetailPanel";
import { CapaLifecycleCard } from "@/components/capa/CapaLifecycleCard";
import { CapaOpenedClosedCard } from "@/components/capa/CapaOpenedClosedCard";
import { CapaRegisterTable } from "@/components/capa/CapaRegisterTable";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_CAPAS_PAGE_NUMBER,
  DEFAULT_CAPAS_PAGE_SIZE,
  useCapasListQuery,
} from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { isApiError } from "@/lib/axios";
import { toCapaListFilterParam } from "@/lib/capa-filters";

const CREATE_CAPA_ROUTE = "/dashboard/capa/new";
const MY_CAPAS_ROUTE = "/dashboard/capa/mine";

/** CAPA Dashboard main content — Figma 7123:41912. */
export function CapaDashboardView() {
  const router = useRouter();
  const hasToken = useHasAccessToken();
  const isClientReady = hasToken !== null;

  /** Empty string = All (matches ModuleFilterBar / GET /api/CAPA omit). */
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_CAPAS_PAGE_NUMBER);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const capasQuery = useCapasListQuery({
    pageNumber,
    pageSize: DEFAULT_CAPAS_PAGE_SIZE,
    search: "",
    status: toCapaListFilterParam(status),
    capaType: toCapaListFilterParam(type),
    priority: toCapaListFilterParam(priority),
    enabled: isClientReady && hasToken === true,
  });

  const items = useMemo(
    () => capasQuery.data?.items ?? [],
    [capasQuery.data?.items],
  );
  const totalCount = capasQuery.data?.totalCount ?? items.length;
  const pageSize = capasQuery.data?.pageSize ?? DEFAULT_CAPAS_PAGE_SIZE;
  const currentPage =
    capasQuery.data?.pageNumber ?? pageNumber;

  const selected =
    (selectedId != null
      ? items.find((item) => item.id === selectedId)
      : null) ??
    items[0] ??
    null;

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady &&
    hasToken === true &&
    (capasQuery.isLoading || (capasQuery.isFetching && !capasQuery.data));
  const errorMessage =
    capasQuery.error == null
      ? null
      : isApiError(capasQuery.error) && capasQuery.error.status === 403
        ? getMutationErrorMessage(
            capasQuery.error,
            "You don’t have permission to view CAPAs. Select a site and confirm your role includes CAPA access.",
          )
        : getMutationErrorMessage(capasQuery.error, "Could not load CAPAs.");

  function resetToFirstPage() {
    setPageNumber(DEFAULT_CAPAS_PAGE_NUMBER);
    setSelectedId(null);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <CapaDashboardMetrics />

      <div className="grid grid-cols-1 items-stretch gap-3.5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <CapaLifecycleCard />
        <CapaOpenedClosedCard />
      </div>
      <CapaDashboardFooterCards />

      <CapaDashboardFilters
        status={status}
        type={type}
        priority={priority}
        shownCount={items.length}
        totalCount={totalCount}
        onStatusChange={(value) => {
          setStatus(value);
          resetToFirstPage();
        }}
        onTypeChange={(value) => {
          setType(value);
          resetToFirstPage();
        }}
        onPriorityChange={(value) => {
          setPriority(value);
          resetToFirstPage();
        }}
        onMyCapas={() => router.push(MY_CAPAS_ROUTE)}
        onNewCapa={() => router.push(CREATE_CAPA_ROUTE)}
      />

      {errorMessage ? (
        <Text as="p" className="text-sm text-[#ef4444]">
          {errorMessage}
        </Text>
      ) : null}

      {showBootLoading || showQueryLoading ? (
        <Text as="p" className="text-ehs-muted-text text-sm">
          Loading CAPAs…
        </Text>
      ) : null}

      {!showBootLoading &&
      !showQueryLoading &&
      !errorMessage &&
      items.length === 0 ? (
        <Text as="p" className="text-ehs-muted-text text-sm">
          No CAPAs found.
        </Text>
      ) : null}

      {!showBootLoading && !showQueryLoading && items.length > 0 ? (
        <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <CapaRegisterTable
            items={items}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            pageNumber={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(nextPage) => {
              setPageNumber(nextPage);
              setSelectedId(null);
            }}
            isPaginationLoading={capasQuery.isFetching}
          />
          {selected ? (
            <CapaDetailPanel
              item={selected}
              onOpenDetail={() =>
                router.push(
                  `/dashboard/capa/${encodeURIComponent(selected.id)}`,
                )
              }
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
