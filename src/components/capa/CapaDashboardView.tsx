"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { CapaDashboardFilters } from "@/components/capa/CapaDashboardFilters";
import { CapaDashboardFooterCards } from "@/components/capa/CapaDashboardFooterCards";
import { CapaDashboardMetrics } from "@/components/capa/CapaDashboardMetrics";
import { CapaDetailPanel } from "@/components/capa/CapaDetailPanel";
import { CapaLifecycleCard } from "@/components/capa/CapaLifecycleCard";
import { CapaOpenedClosedCard } from "@/components/capa/CapaOpenedClosedCard";
import { CapaDashboardSkeleton } from "@/components/capa/CapaPageSkeleton";
import { CapaRegisterTable } from "@/components/capa/CapaRegisterTable";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
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

/** CAPA Dashboard main content — Figma 7123:41912. */
export function CapaDashboardView() {
  const router = useRouter();
  const hasToken = useHasAccessToken();
  const isClientReady = hasToken !== null;

  /** Empty string = All (matches ModuleFilterBar / GET /api/CAPA omit). */
  const [scope, setScope] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_CAPAS_PAGE_NUMBER);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const capasQuery = useCapasListQuery({
    pageNumber,
    pageSize: DEFAULT_CAPAS_PAGE_SIZE,
    search: toCapaListFilterParam(searchQuery),
    scope: toCapaListFilterParam(scope),
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
  const currentPage = capasQuery.data?.pageNumber ?? pageNumber;

  const selected =
    selectedId != null
      ? (items.find((item) => item.id === selectedId) ?? null)
      : null;

  const isPanelOpen = selected != null;

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

  const handleToggleDetail = (id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  };

  if (showBootLoading || showQueryLoading) {
    return <CapaDashboardSkeleton />;
  }

  const resultLabel = `${String(totalCount)} ${
    totalCount === 1 ? "CAPA" : "CAPAs"
  }`;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <CapaDashboardMetrics />

      <div className="grid grid-cols-1 items-stretch gap-3.5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <CapaLifecycleCard />
        <CapaOpenedClosedCard />
      </div>
      <CapaDashboardFooterCards />

      <CapaDashboardFilters
        scope={scope}
        status={status}
        type={type}
        priority={priority}
        onScopeChange={(value) => {
          setScope(value);
          resetToFirstPage();
        }}
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
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={(value) => {
          setSearchQuery(value);
          resetToFirstPage();
        }}
        placeholder="Search by title..."
        aria-label="Search CAPAs"
        resultLabel={resultLabel}
      />

      {errorMessage ? (
        <IncidentGlassCard
          className="min-h-45 text-center"
          incidentGlassCardClassName="items-center justify-center gap-2"
        >
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-red size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text4 text-ehs-darker">
            Could not load CAPAs
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            {errorMessage}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void capasQuery.refetch()}
            className="mt-1"
          >
            Retry
          </Button>
        </IncidentGlassCard>
      ) : (
        <div
          className={[
            "grid min-w-0 items-start gap-x-3.5 gap-y-5",
            isPanelOpen
              ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
              : "xl:grid-cols-1",
          ].join(" ")}
        >
          <CapaRegisterTable
            items={items}
            selectedId={selected?.id ?? null}
            onToggleDetail={handleToggleDetail}
            pageNumber={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(nextPage) => {
              setPageNumber(nextPage);
              setSelectedId(null);
            }}
            isPaginationLoading={capasQuery.isFetching}
            expanded={!isPanelOpen}
            onNewCapa={() => router.push(CREATE_CAPA_ROUTE)}
          />
          {selected ? (
            <CapaDetailPanel
              item={selected}
              onOpenDetail={() =>
                router.push(
                  `/dashboard/capa/${encodeURIComponent(selected.id)}`,
                )
              }
              className="min-w-0 xl:sticky xl:top-4"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
