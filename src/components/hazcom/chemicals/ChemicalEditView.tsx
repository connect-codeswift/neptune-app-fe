import {
  HazcomModuleTabs,
  HazcomPageHeader,
  findHazcomChemical,
} from "@/components/hazcom/shared";
import { ChemicalForm } from "@/components/hazcom/chemicals/ChemicalForm";
import { ChemicalNotFound } from "@/components/hazcom/chemicals/ChemicalNotFound";

export type ChemicalEditViewProps = Readonly<{
  chemicalIdParam: string;
  className?: string;
}>;

export function ChemicalEditView(props: Readonly<ChemicalEditViewProps>) {
  const { chemicalIdParam, className = "" } = props;
  const chemical = findHazcomChemical(chemicalIdParam);

  return (
    <div
      className={["flex min-w-0 flex-col gap-5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomModuleTabs />

      {chemical ? (
        <>
          <HazcomPageHeader
            breadcrumb={["Safety", "HazCom", "Chemical Inventory", "Edit"]}
            title={`Edit Chemical — ${chemical.name}`}
            subtitle="Register a new hazardous chemical to the site inventory"
          />
          <ChemicalForm mode="edit" chemical={chemical} />
        </>
      ) : (
        <>
          <HazcomPageHeader
            breadcrumb={["Safety", "HazCom", "Chemical Inventory", "Edit"]}
            title="Chemical Not Found"
          />
          <ChemicalNotFound chemicalId={chemicalIdParam} />
        </>
      )}
    </div>
  );
}
