export type IncidentLocationOption = Readonly<{
  value: string;
  label: string;
}>;

/** Common areas within a plant — sites can extend the list with custom entries. */
export const INCIDENT_LOCATION_OPTIONS: readonly IncidentLocationOption[] = [
  { value: "Line 1", label: "Line 1" },
  { value: "Line 2", label: "Line 2" },
  { value: "Line 3", label: "Line 3" },
  { value: "Press #4", label: "Press #4" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Maintenance Bay", label: "Maintenance Bay" },
  { value: "Loading Dock", label: "Loading Dock" },
  { value: "Office Area", label: "Office Area" },
  { value: "Parking Lot", label: "Parking Lot" },
];
