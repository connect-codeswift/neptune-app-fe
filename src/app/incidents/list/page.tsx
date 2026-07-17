import {
  IncidentListHeader,
  IncidentListView,
} from "@/components/incidents/list";
import { IncidentViewTabs } from "@/components/incidents/shared";

export default function IncidentsListPage() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <IncidentListHeader />
      <div className="flex min-w-0 flex-1 flex-col gap-5 px-3 pb-8 sm:px-4">
        <IncidentViewTabs />
        <IncidentListView />
      </div>
    </div>
  );
}
