import type { SessionBootstrapDto } from "@/dtos/res/session-response.dto";

export type OrganizationLimitsState = Readonly<{
  maxSeats: number;
  seatsUsed: number;
  seatsAvailable: number;
  atSeatLimit: boolean;
}>;

const APPROACHING_THRESHOLD = 0.9;

export function getOrganizationLimitsState(
  session: Pick<
    SessionBootstrapDto,
    "maxSeats" | "seatsUsed" | "seatsAvailable" | "atSeatLimit"
  > | null | undefined,
): OrganizationLimitsState | null {
  if (!session?.maxSeats) {
    return null;
  }

  return {
    maxSeats: session.maxSeats,
    seatsUsed: session.seatsUsed,
    seatsAvailable: session.seatsAvailable ?? 0,
    atSeatLimit: session.atSeatLimit,
  };
}

export function shouldShowOrganizationLimitsBanner(
  limits: OrganizationLimitsState | null,
): boolean {
  if (!limits) {
    return false;
  }

  if (limits.atSeatLimit) {
    return true;
  }

  if (limits.maxSeats <= 0) {
    return false;
  }

  return limits.seatsUsed / limits.maxSeats >= APPROACHING_THRESHOLD;
}

export function formatOrganizationLimitsBannerMessage(
  limits: OrganizationLimitsState,
): string {
  if (limits.atSeatLimit) {
    return `Your organization has reached its user seat limit (${limits.seatsUsed}/${limits.maxSeats}). Contact CodeSwift to increase your allowance before inviting more users.`;
  }

  return `Your organization is approaching its user seat limit (${limits.seatsUsed}/${limits.maxSeats}). Contact CodeSwift if you need more seats.`;
}
