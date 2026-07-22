"use client";

import { useParams } from "next/navigation";
import { IncidentDetailContent } from "@/components/incidents/detail/IncidentDetailContent";

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentIdParam =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? (params.id[0] ?? "")
        : "";

  return <IncidentDetailContent incidentIdParam={incidentIdParam} />;
}
