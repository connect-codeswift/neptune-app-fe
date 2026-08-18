import type {
  IhPlanListItem,
  IhPlanListStatus,
} from "./ih-sampling-plans-data";
import { IH_PLAN_LIST, ihPlanPercent } from "./ih-sampling-plans-data";

export type IhPlanSampleStatus = "Below PEL";

export type IhPlanSampleRow = Readonly<{
  id: string;
  date: string;
  agent: string;
  location: string;
  result: string;
  status: IhPlanSampleStatus;
}>;

export type IhPlanDetail = Readonly<{
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: IhPlanListStatus;
  purpose: string;
  responsiblePerson: string;
  frequency: string;
  method: string;
  startDate: string;
  endDate: string;
  agents: readonly string[];
  workAreas: readonly string[];
  completed: number;
  total: number;
  samples: readonly IhPlanSampleRow[];
  notes: string;
}>;

const PLAN_DETAILS: Record<string, IhPlanDetail> = {
  "plan-1": {
    id: "plan-1",
    code: "SP-001",
    title: "Q2 Benzene & Dust Monitoring",
    subtitle:
      "Routine quarterly monitoring for benzene and respirable crystalline silica in production areas",
    status: "In Progress",
    purpose:
      "Routine quarterly monitoring to assess worker exposure to benzene and respirable crystalline silica dust in production and maintenance areas, per OSHA 29 CFR 1910.1028 and 1926.1153 requirements.",
    responsiblePerson: "Sarah Mitchell",
    frequency: "Quarterly",
    method: "Personal Air Sampling (NIOSH 1501)",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    agents: ["Benzene", "Silica Dust (RCS)"],
    workAreas: [
      "Lab 1 – Room 110",
      "Lab 2 – Room 204",
      "Maintenance Shop",
      "Process Area A",
      "Process Area B",
      "Grinding Station",
    ],
    completed: 5,
    total: 8,
    samples: [
      {
        id: "s1",
        date: "2026-05-12",
        agent: "Benzene",
        location: "Process Area A",
        result: "0.3 ppm",
        status: "Below PEL",
      },
      {
        id: "s2",
        date: "2026-05-12",
        agent: "Silica Dust (RCS)",
        location: "Grinding Station",
        result: "42 µg/m³",
        status: "Below PEL",
      },
      {
        id: "s3",
        date: "2026-04-15",
        agent: "Benzene",
        location: "Lab 1 – Room 110",
        result: "0.8 ppm",
        status: "Below PEL",
      },
      {
        id: "s4",
        date: "2026-04-15",
        agent: "Silica Dust (RCS)",
        location: "Maintenance Shop",
        result: "38 µg/m³",
        status: "Below PEL",
      },
      {
        id: "s5",
        date: "2026-04-15",
        agent: "Benzene",
        location: "Process Area B",
        result: "0.2 ppm",
        status: "Below PEL",
      },
    ],
    notes:
      "Samples to be analyzed by Acme Environmental Lab. Chain-of-custody forms required. Follow NIOSH 1501 method for benzene and NIOSH 7602 for silica.",
  },
  "plan-2": {
    id: "plan-2",
    code: "SP-002",
    title: "Annual Noise Survey – Maintenance",
    subtitle:
      "Annual noise dosimetry survey covering maintenance shop and adjacent work zones",
    status: "Approved",
    purpose:
      "Annual noise survey to evaluate A-weighted exposure for maintenance personnel and confirm hearing conservation program coverage.",
    responsiblePerson: "James Torres",
    frequency: "Annual",
    method: "Noise Dosimetry",
    startDate: "2026-01-15",
    endDate: "2026-12-31",
    agents: ["Noise (A-weighted)"],
    workAreas: ["Maintenance Shop", "Fabrication Hall", "Boiler Room"],
    completed: 3,
    total: 12,
    samples: [
      {
        id: "s1",
        date: "2026-03-10",
        agent: "Noise (A-weighted)",
        location: "Maintenance Shop",
        result: "84 dB(A)",
        status: "Below PEL",
      },
      {
        id: "s2",
        date: "2026-03-10",
        agent: "Noise (A-weighted)",
        location: "Fabrication Hall",
        result: "82 dB(A)",
        status: "Below PEL",
      },
      {
        id: "s3",
        date: "2026-02-20",
        agent: "Noise (A-weighted)",
        location: "Boiler Room",
        result: "79 dB(A)",
        status: "Below PEL",
      },
    ],
    notes:
      "Dosimeters calibrated before each shift. Report results to Hearing Conservation Program coordinator.",
  },
  "plan-3": {
    id: "plan-3",
    code: "SP-003",
    title: "Lead & Heat – Battery Room",
    subtitle:
      "Combined lead exposure and heat stress monitoring for battery room operations",
    status: "In Progress",
    purpose:
      "Monitor lead and heat stress (WBGT) in the battery room to verify controls and medical surveillance triggers.",
    responsiblePerson: "Lena Park",
    frequency: "Quarterly",
    method: "Personal PBZ / Area Sample",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    agents: ["Lead", "Heat Stress (WBGT)"],
    workAreas: ["Battery Room"],
    completed: 4,
    total: 6,
    samples: [
      {
        id: "s1",
        date: "2026-05-01",
        agent: "Lead",
        location: "Battery Room",
        result: "18 µg/m³",
        status: "Below PEL",
      },
      {
        id: "s2",
        date: "2026-05-01",
        agent: "Heat Stress (WBGT)",
        location: "Battery Room",
        result: "26 °C",
        status: "Below PEL",
      },
    ],
    notes:
      "Coordinate with medical surveillance for blood lead levels when action levels are approached.",
  },
  "plan-4": {
    id: "plan-4",
    code: "SP-004",
    title: "Baseline Ergonomic Assessment",
    subtitle:
      "Baseline ergonomic assessment draft for production and packing areas",
    status: "Draft",
    purpose:
      "Establish baseline ergonomic risk scores for high-repetition tasks before implementing workstation improvements.",
    responsiblePerson: "Sarah Mitchell",
    frequency: "Ad-hoc",
    method: "Ergonomic Assessment",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    agents: ["Ergonomic"],
    workAreas: ["Assembly Line A", "Packing Area"],
    completed: 0,
    total: 0,
    samples: [],
    notes: "Draft plan — sampling schedule to be confirmed before kickoff.",
  },
};

function detailFromListItem(plan: IhPlanListItem): IhPlanDetail {
  return {
    id: plan.id,
    code: plan.code,
    title: plan.title,
    subtitle: `${plan.status} sampling plan owned by ${plan.owner}`,
    status: plan.status,
    purpose: "Monitoring campaign details are not yet available for this plan.",
    responsiblePerson: plan.owner,
    frequency: "—",
    method: "—",
    startDate: "—",
    endDate: plan.nextDate,
    agents: plan.agents.split(",").map((part) => part.trim()),
    workAreas: [],
    completed: plan.completed,
    total: plan.total,
    samples: [],
    notes: "",
  };
}

export function getIhPlanDetail(planId: string): IhPlanDetail | null {
  const known = PLAN_DETAILS[planId];
  if (known) return known;

  const listItem = IH_PLAN_LIST.find((plan) => plan.id === planId);
  return listItem ? detailFromListItem(listItem) : null;
}

export function ihPlanDetailPercent(detail: IhPlanDetail): number {
  return ihPlanPercent({
    id: detail.id,
    code: detail.code,
    title: detail.title,
    status: detail.status,
    owner: detail.responsiblePerson,
    nextDate: detail.endDate,
    agents: detail.agents.join(", "),
    completed: detail.completed,
    total: detail.total,
  });
}
