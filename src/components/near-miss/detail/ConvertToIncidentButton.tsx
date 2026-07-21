"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";

export type ConvertToIncidentButtonProps = Readonly<{
  nearMissId: string;
}>;

export function ConvertToIncidentButton(
  props: Readonly<ConvertToIncidentButtonProps>,
) {
  const { nearMissId } = props;
  const router = useRouter();

  const handleConvert = () => {
    router.push(
      `/dashboard/incidents?fromNearMiss=${encodeURIComponent(nearMissId)}`,
    );
  };

  return (
    <Button
      type="button"
      variant="primary"
      onClick={handleConvert}
      className="gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold whitespace-nowrap"
    >
      <Icon
        icon="mdi:swap-horizontal"
        className="shrink-0 text-base"
        aria-hidden="true"
      />
      Convert to Incident
    </Button>
  );
}
