export type IhChipOption = Readonly<{
  id: string;
  label: string;
  icon: string;
}>;

export const IH_CREATE_PLAN_AGENTS: readonly IhChipOption[] = [
  { id: "benzene", label: "Benzene", icon: "mdi:flask-outline" },
  { id: "noise", label: "Noise (A-weighted)", icon: "mdi:volume-high" },
  { id: "silica", label: "Silica Dust (RCS)", icon: "mdi:weather-windy" },
  { id: "lead", label: "Lead", icon: "mdi:flask-outline" },
  { id: "asbestos", label: "Asbestos", icon: "mdi:weather-windy" },
  { id: "radiation", label: "Ionizing Radiation", icon: "mdi:pulse" },
  { id: "heat", label: "Heat Stress (WBGT)", icon: "mdi:thermometer" },
];

export const IH_CREATE_PLAN_AREAS: readonly IhChipOption[] = [
  { id: "lab-1", label: "Lab 1 – Room 110", icon: "mdi:map-marker-outline" },
  { id: "lab-2", label: "Lab 2 – Room 204", icon: "mdi:map-marker-outline" },
  {
    id: "maintenance",
    label: "Maintenance Shop",
    icon: "mdi:map-marker-outline",
  },
  {
    id: "process-a",
    label: "Process Area A",
    icon: "mdi:map-marker-outline",
  },
  {
    id: "process-b",
    label: "Process Area B",
    icon: "mdi:map-marker-outline",
  },
  {
    id: "grinding",
    label: "Grinding Station",
    icon: "mdi:map-marker-outline",
  },
  { id: "battery", label: "Battery Room", icon: "mdi:map-marker-outline" },
  { id: "boiler", label: "Boiler Room", icon: "mdi:map-marker-outline" },
  {
    id: "fabrication",
    label: "Fabrication Hall",
    icon: "mdi:map-marker-outline",
  },
  {
    id: "assembly",
    label: "Assembly Line A",
    icon: "mdi:map-marker-outline",
  },
  { id: "packing", label: "Packing Area", icon: "mdi:map-marker-outline" },
];

export const IH_CREATE_PLAN_PEOPLE = [
  "Sarah Mitchell",
  "James Torres",
  "Lena Park",
  "Carlos Reyes",
  "Amy Chen",
] as const;

export const IH_CREATE_PLAN_FREQUENCIES = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Annually",
] as const;

export const IH_CREATE_PLAN_METHODS = [
  "Personal PBZ",
  "Area Sample",
  "Noise Dosimetry",
  "Grab Sample",
] as const;

export const IH_CREATE_PLAN_STATUSES = [
  "Draft",
  "In Progress",
  "Approved",
] as const;
