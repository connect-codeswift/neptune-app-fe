import { BreadCrumbTab } from "@/components/BreadCrumbTab";

export default function ReportIncidentPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-4 px-4 pb-8 pt-4">
      <BreadCrumbTab
        breadcrumbs={[
          { label: "Incidents", href: "/incidents/list" },
          { label: "Report" },
        ]}
        title="Report an incident"
        actions={[{ label: "Save & exit", variant: "tertiary" }]}
      />
    </div>
  );
}
