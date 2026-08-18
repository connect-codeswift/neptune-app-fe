import type { ClosureStepId } from "@/components/incidents/detail/closure/IncidentClosureStepsSidebar";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

function getDerivedRecordable(finalIncidentType: string): boolean {
  switch (finalIncidentType) {
    case "Near Miss":
    case "First Aid":
      return false;
    case "Medical Only":
    case "Restricted Work":
    case "Lost Time":
    case "Fatality":
      return true;
    default:
      return false;
  }
}

/** Step 1 — Classification */
function validateClosureStepOne(data: IncidentClosureData): string | null {
  const incidentType = data.finalIncidentType?.trim() || "Select option";

  if (incidentType === "Select option" || !incidentType) {
    return "Select a final incident type before continuing.";
  }

  if (incidentType === "Lost Time" && data.daysAwayFromWork < 1) {
    return "Lost Time requires at least 1 day away.";
  }

  if (incidentType === "Restricted Work" && data.daysOnRestrictedDuty < 1) {
    return "Restricted Work / Job Transfer requires at least 1 day on restricted duty.";
  }

  const isRecordableDerived = getDerivedRecordable(incidentType);
  const isOverridden = data.isOshaRecordable !== isRecordableDerived;

  if (isOverridden && !data.oshaOverrideReason?.trim()) {
    return "An override reason is required when changing default OSHA recordability.";
  }

  return null;
}

/** Step 2 — Root cause */
function validateClosureStepTwo(data: IncidentClosureData): string | null {
  if ((data.primaryRootCauseCategoryIds ?? []).length === 0) {
    return "Select at least one primary root cause category.";
  }

  if (!data.rootCauseSummary?.trim()) {
    return "Enter a root cause description before continuing.";
  }

  return null;
}

/** Step 3 — Preventive measures */
function validateClosureStepThree(data: IncidentClosureData): string | null {
  if (!data.actionsTaken?.trim()) {
    return "Describe the preventive actions taken before continuing.";
  }

  return null;
}

/** Step 4 — Sign-off */
function validateClosureStepFour(data: IncidentClosureData): string | null {
  if (!data.isEhsConfirmed) {
    return "Confirm EHS verification before closing the incident.";
  }

  return null;
}

export function validateClosureStep(
  step: ClosureStepId,
  data: IncidentClosureData,
): string | null {
  switch (step) {
    case 1:
      return validateClosureStepOne(data);
    case 2:
      return validateClosureStepTwo(data);
    case 3:
      return validateClosureStepThree(data);
    case 4:
      return validateClosureStepFour(data);
    default:
      return null;
  }
}

/** Validates every step before the target when jumping forward in the sidebar. */
export function validateClosureStepsBefore(
  targetStep: ClosureStepId,
  data: IncidentClosureData,
): string | null {
  for (let step = 1; step < targetStep; step += 1) {
    const error = validateClosureStep(step as ClosureStepId, data);
    if (error) {
      return error;
    }
  }
  return null;
}
