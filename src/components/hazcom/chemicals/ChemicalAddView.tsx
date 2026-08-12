import { HazcomFormLayout, HazcomPageHeader } from "@/components/hazcom/shared";
import { ChemicalForm } from "@/components/hazcom/chemicals/ChemicalForm";

export type ChemicalAddViewProps = Readonly<{
  className?: string;
}>;

export function ChemicalAddView(props: Readonly<ChemicalAddViewProps>) {
  const { className = "" } = props;

  return (
    <HazcomFormLayout className={className}>
      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Chemical Inventory", "Add"]}
        title="Add Chemical"
        subtitle="Register a new hazardous chemical to the site inventory"
      />

      <ChemicalForm mode="add" />
    </HazcomFormLayout>
  );
}
