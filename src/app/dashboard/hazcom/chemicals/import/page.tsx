import { HazcomFormLayout, HazcomPageHeader } from "@/components/hazcom/shared";
import { ImportChemicalsContent } from "@/components/hazcom/chemicals/ImportChemicalsContent";

export default function HazcomChemicalImportPage() {
  return (
    <HazcomFormLayout>
      <HazcomPageHeader
        breadcrumb={[
          { label: "Safety" },
          { label: "HazCom", href: "/dashboard/hazcom/overview" },
          { label: "Chemical Inventory", href: "/dashboard/hazcom/chemicals" },
          { label: "Import" },
        ]}
        title="Import Chemicals"
        subtitle="Add many chemicals at once from a spreadsheet"
      />

      <ImportChemicalsContent />
    </HazcomFormLayout>
  );
}
