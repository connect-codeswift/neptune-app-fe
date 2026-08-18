import { HazcomFormLayout, HazcomPageHeader } from "@/components/hazcom/shared";
import { ChemicalForm } from "@/components/hazcom/chemicals/ChemicalForm";

export default function HazcomChemicalNewPage() {
  return (
    <HazcomFormLayout>
      <HazcomPageHeader
        breadcrumb={[
          { label: "Safety" },
          { label: "HazCom", href: "/dashboard/hazcom/overview" },
          { label: "Chemical Inventory", href: "/dashboard/hazcom/chemicals" },
          { label: "Add" },
        ]}
        title="Add Chemical"
        subtitle="Register a new hazardous chemical to the site inventory"
      />

      <ChemicalForm mode="add" />
    </HazcomFormLayout>
  );
}
