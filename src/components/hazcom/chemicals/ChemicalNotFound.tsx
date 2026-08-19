import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type ChemicalNotFoundProps = Readonly<{
  chemicalId: string;
  className?: string;
}>;

export function ChemicalNotFound(props: Readonly<ChemicalNotFoundProps>) {
  const { chemicalId, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["min-h-70 min-w-0", className].filter(Boolean).join(" ")}
      incidentGlassCardClassName="items-center justify-center gap-3 text-center"
    >
      <Icon
        icon="mdi:flask-off-outline"
        className="text-ehs-muted-text size-10"
        aria-hidden="true"
      />
      <Text as="p" className="text3 text-ehs-darker">
        Chemical not found
      </Text>
      <Text as="p" className="text4 text-ehs-muted-text max-w-sm">
        {`No chemical record matches "${chemicalId}". It may have been removed from the inventory.`}
      </Text>
      <Link href="/dashboard/hazcom/chemicals">
        <Button
          type="button"
          variant="secondary"
          className="text4 mt-1 rounded-lg px-4 py-2"
        >
          <Icon icon="mdi:arrow-left" className="size-4" aria-hidden="true" />
          Back to Chemical Inventory
        </Button>
      </Link>
    </IncidentGlassCard>
  );
}
