export type NearMissStatus = "Open" | "Investigating" | "Closed";
export type NearMissSeverity = "High" | "Medium" | "Low";

export type NearMissRelatedCapa = Readonly<{
  /** Display code, e.g. "CAPA-96". */
  id: string;
  /** Numeric id behind {@link id}; the detail route keys on this, not the code. */
  numericId: number;
  title: string;
}>;

export type NearMissRecord = Readonly<{
  id: string;
  title: string;
  /** Display label for the hazard type, e.g. "Mechanical". */
  hazardType: string;
  /** Display label for where the event happened, e.g. "Plant A · Line 2". */
  location: string;
  reporter: string;
  /** Raw user id behind {@link reporter}; resolved to a name via /User/dropdown. */
  reporterId?: number;
  site: string;
  status: NearMissStatus;
  age: string;
  description: string;
  /** ISO date of the event, shown as "Date" on the detail view. */
  dateOfEvent: string;
  contributingFactors: readonly string[];
  /** Every attached photo; empty when none were uploaded. */
  attachments: readonly string[];
  /** Raw user id of whoever closed it; resolved to a name via /User/dropdown. */
  closedById?: number;
  /** Resolved display name behind {@link closedById}. */
  closedBy?: string;
  /** ISO date it was closed, when it has been. */
  closedAt?: string;
  relatedCapas: readonly NearMissRelatedCapa[];
}>;
