import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { HazcomGlassCard } from "@/components/hazcom/shared";

export type ChemicalNotFoundProps = Readonly<{
  chemicalId: string;
  className?: string;
}>;

export function ChemicalNotFound(props: Readonly<ChemicalNotFoundProps>) {
  const { chemicalId, className = "" } = props;

  return (
    <HazcomGlassCard
      className={[
        "min-h-[280px] items-center justify-center gap-3 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon="mdi:flask-off-outline"
        className="text-ehs-muted-text size-10"
        aria-hidden="true"
      />
      <Text as="p" className="text-ehs-darker text-base font-bold">
        Chemical not found
      </Text>
      <Text as="p" className="text-ehs-muted-text max-w-sm text-sm">
        {`No chemical record matches "${chemicalId}". It may have been removed from the inventory.`}
      </Text>
      <Link href="/dashboard/hazcom/chemicals">
        <Button
          type="button"
          variant="secondary"
          className="mt-1 rounded-lg px-4 py-2 text-[13px]"
        >
          <Icon
            icon="mdi:arrow-left"
            className="text-base"
            aria-hidden="true"
          />
          Back to Chemical Inventory
        </Button>
      </Link>
    </HazcomGlassCard>
  );
}
