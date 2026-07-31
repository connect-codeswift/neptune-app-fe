import {
  hazcomRiskLevel,
  hazcomRiskScore,
  type HazcomChemical,
  type HazcomPictogram,
  type HazcomRiskAssessment,
  type HazcomSdsRecord,
  type HazcomSdsSection,
  type HazcomTrainingSession,
} from "@/components/hazcom/shared/hazcom-types";

export const HAZCOM_CHEMICALS: readonly HazcomChemical[] = [
  {
    id: "C001",
    name: "Hydrochloric Acid",
    casNumber: "7647-01-0",
    location: "Lab 1 - Room 131",
    quantity: "15 Liters",
    hazardClass: "Corrosive",
    pictograms: ["Corrosive", "Irritant"],
    signalWord: "Danger",
    status: "Active",
    sdsRecordId: "SDS-001",
    sdsFileName: "SDS_Hydrochloric_Acid_Rev2026.pdf",
    storageNotes: "Store in vented acid cabinet, away from oxidizers.",
    hazardStatements: [
      { code: "H314", text: "Causes severe skin burns and eye damage." },
      { code: "H335", text: "May cause respiratory irritation." },
    ],
    precautionaryStatements: [
      {
        code: "P260",
        text: "Do not breathe dust/fume/gas/mist/vapors/spray.",
      },
      { code: "P264", text: "Wash hands thoroughly after handling." },
      {
        code: "P280",
        text: "Wear protective gloves/protective clothing/eye protection/face protection.",
      },
    ],
    addedOn: "2026-03-14",
  },
  {
    id: "C002",
    name: "Acetone",
    casNumber: "67-64-1",
    location: "Lab 2 - Room 118",
    quantity: "8 Liters",
    hazardClass: "Flammable Liquid",
    pictograms: ["Flammable", "Irritant"],
    signalWord: "Danger",
    status: "Active",
    sdsRecordId: "SDS-002",
    sdsFileName: "SDS_Acetone_Rev2025.pdf",
    storageNotes: "Keep in flammables cabinet away from ignition sources.",
    hazardStatements: [
      { code: "H225", text: "Highly flammable liquid and vapor." },
      { code: "H319", text: "Causes serious eye irritation." },
    ],
    precautionaryStatements: [
      {
        code: "P210",
        text: "Keep away from heat/sparks/open flames/hot surfaces. No smoking.",
      },
      { code: "P233", text: "Keep container tightly closed." },
      {
        code: "P305+P351+P338",
        text: "IF IN EYES: Rinse cautiously with water for several minutes.",
      },
    ],
    addedOn: "2025-11-02",
  },
  {
    id: "C003",
    name: "Benzene",
    casNumber: "71-43-2",
    location: "Lab 3 - Room 204",
    quantity: "4 Liters",
    hazardClass: "Carcinogen / Flammable Liquid",
    pictograms: ["Flammable", "Health Hazard", "Toxic"],
    signalWord: "Danger",
    status: "Active",
    sdsRecordId: "SDS-003",
    sdsFileName: "SDS_Benzene_Rev2023.pdf",
    storageNotes:
      "Restricted access cabinet; fume hood use required for all handling.",
    hazardStatements: [
      { code: "H225", text: "Highly flammable liquid and vapor." },
      { code: "H350", text: "May cause cancer." },
      {
        code: "H372",
        text: "Causes damage to organs through prolonged or repeated exposure.",
      },
    ],
    precautionaryStatements: [
      { code: "P201", text: "Obtain special instructions before use." },
      {
        code: "P210",
        text: "Keep away from heat/sparks/open flames/hot surfaces. No smoking.",
      },
      {
        code: "P308+P313",
        text: "IF exposed or concerned: Get medical advice/attention.",
      },
    ],
    addedOn: "2025-06-19",
  },
  {
    id: "C004",
    name: "Sodium Hydroxide",
    casNumber: "1310-73-2",
    location: "Lab 1 - Room 131",
    quantity: "25 Kilograms",
    hazardClass: "Corrosive",
    pictograms: ["Corrosive"],
    signalWord: "Danger",
    status: "Active",
    sdsRecordId: "SDS-004",
    sdsFileName: "SDS_Sodium_Hydroxide_Rev2026.pdf",
    storageNotes: "Store dry, sealed container, away from acids and metals.",
    hazardStatements: [
      { code: "H290", text: "May be corrosive to metals." },
      { code: "H314", text: "Causes severe skin burns and eye damage." },
    ],
    precautionaryStatements: [
      { code: "P234", text: "Keep only in original container." },
      {
        code: "P280",
        text: "Wear protective gloves/protective clothing/eye protection/face protection.",
      },
      { code: "P310", text: "Immediately call a POISON CENTER/doctor." },
    ],
    addedOn: "2026-01-08",
  },
  {
    id: "C005",
    name: "Isopropyl Alcohol",
    casNumber: "67-63-0",
    location: "Lab 2 - Room 118",
    quantity: "12 Liters",
    hazardClass: "Flammable Liquid",
    pictograms: ["Flammable", "Irritant"],
    signalWord: "Warning",
    status: "Active",
    sdsRecordId: "SDS-005",
    sdsFileName: "SDS_Isopropyl_Alcohol_Rev2026.pdf",
    storageNotes: "Store in flammables cabinet, keep container tightly closed.",
    hazardStatements: [
      { code: "H225", text: "Highly flammable liquid and vapor." },
      { code: "H319", text: "Causes serious eye irritation." },
      { code: "H336", text: "May cause drowsiness or dizziness." },
    ],
    precautionaryStatements: [
      {
        code: "P210",
        text: "Keep away from heat/sparks/open flames/hot surfaces. No smoking.",
      },
      { code: "P233", text: "Keep container tightly closed." },
      {
        code: "P305+P351+P338",
        text: "IF IN EYES: Rinse cautiously with water for several minutes.",
      },
    ],
    addedOn: "2026-05-27",
  },
  {
    id: "C006",
    name: "Toluene",
    casNumber: "108-88-3",
    location: "Lab 3 - Room 204",
    quantity: "6 Liters",
    hazardClass: "Flammable Liquid / Reproductive Toxicant",
    pictograms: ["Flammable", "Health Hazard", "Irritant"],
    signalWord: "Danger",
    status: "Inactive",
    sdsRecordId: null,
    sdsFileName: null,
    storageNotes:
      "Decommissioned - remaining stock pending disposal; SDS resubmission in progress.",
    hazardStatements: [
      { code: "H225", text: "Highly flammable liquid and vapor." },
      {
        code: "H304",
        text: "May be fatal if swallowed and enters airways.",
      },
      {
        code: "H361",
        text: "Suspected of damaging fertility or the unborn child.",
      },
    ],
    precautionaryStatements: [
      {
        code: "P210",
        text: "Keep away from heat/sparks/open flames/hot surfaces. No smoking.",
      },
      {
        code: "P301+P310",
        text: "IF SWALLOWED: Immediately call a POISON CENTER/doctor.",
      },
      { code: "P405", text: "Store locked up." },
    ],
    addedOn: "2024-09-11",
  },
];

export const HAZCOM_SDS_RECORDS: readonly HazcomSdsRecord[] = [
  {
    id: "SDS-001",
    chemicalName: "Hydrochloric Acid",
    manufacturer: "Sigma-Aldrich",
    casNumber: "7647-01-0",
    hazardClass: "Corrosive",
    signalWord: "Danger",
    pictograms: ["Corrosive", "Irritant"],
    revisedOn: "2025-08-01",
    version: "v4.1",
    status: "Compliant",
  },
  {
    id: "SDS-002",
    chemicalName: "Acetone",
    manufacturer: "Fisher Scientific",
    casNumber: "67-64-1",
    hazardClass: "Flammable Liquid",
    signalWord: "Danger",
    pictograms: ["Flammable", "Irritant"],
    revisedOn: "2024-11-15",
    version: "v3.0",
    status: "Due Soon",
  },
  {
    id: "SDS-003",
    chemicalName: "Benzene",
    manufacturer: "Honeywell",
    casNumber: "71-43-2",
    hazardClass: "Carcinogen / Flammable Liquid",
    signalWord: "Danger",
    pictograms: ["Flammable", "Health Hazard", "Toxic"],
    revisedOn: "2023-05-02",
    version: "v2.2",
    status: "Overdue",
  },
  {
    id: "SDS-004",
    chemicalName: "Sodium Hydroxide",
    manufacturer: "VWR",
    casNumber: "1310-73-2",
    hazardClass: "Corrosive",
    signalWord: "Danger",
    pictograms: ["Corrosive"],
    revisedOn: "2025-01-20",
    version: "v5.0",
    status: "Compliant",
  },
  {
    id: "SDS-005",
    chemicalName: "Isopropyl Alcohol",
    manufacturer: "Avantor",
    casNumber: "67-63-0",
    hazardClass: "Flammable Liquid",
    signalWord: "Warning",
    pictograms: ["Flammable", "Irritant"],
    revisedOn: "2025-06-10",
    version: "v3.4",
    status: "Compliant",
  },
  {
    id: "SDS-006",
    chemicalName: "Toluene",
    manufacturer: "Merck",
    casNumber: "108-88-3",
    hazardClass: "Flammable Liquid / Reproductive Toxicant",
    signalWord: "Danger",
    pictograms: ["Flammable", "Health Hazard", "Irritant"],
    revisedOn: "2022-09-30",
    version: "v1.9",
    status: "Overdue",
  },
];

export const HAZCOM_SDS_SECTIONS: readonly HazcomSdsSection[] = [
  {
    number: 1,
    title: "Identification",
    body: [
      "Product identifier, recommended use, restrictions on use, and supplier/manufacturer contact details, including an emergency telephone number.",
    ],
  },
  {
    number: 2,
    title: "Hazard(s) Identification",
    body: [
      "GHS classification: this product is classified per OSHA HazCom 2012 (29 CFR 1910.1200) and GHS Revision 7 criteria. The applicable hazard class(es), category, signal word, hazard statement(s), and precautionary statement(s) are printed on the shipped container label and mirrored on the chemical's inventory record.",
      "Pictograms shown on the label correspond to the classified hazard categories above; no hazards not otherwise classified have been identified for this product under normal conditions of use.",
    ],
  },
  {
    number: 3,
    title: "Composition/Information on Ingredients",
    body: [
      "Chemical name, CAS number, and concentration (or concentration range) of the substance, or of each hazardous ingredient in a mixture, including any impurities and stabilizing additives that are themselves classified as hazardous.",
    ],
  },
  {
    number: 4,
    title: "First-Aid Measures",
    body: [
      "Necessary first-aid measures by route of exposure (inhalation, skin, eye, ingestion), most important symptoms and effects (acute and delayed), and indication of any immediate medical attention and special treatment needed.",
    ],
  },
  {
    number: 5,
    title: "Fire-Fighting Measures",
    body: [
      "Suitable (and unsuitable) extinguishing media, specific hazards arising from the chemical (e.g. hazardous combustion products), and special protective equipment and precautions for firefighters.",
    ],
  },
  {
    number: 6,
    title: "Accidental Release Measures",
    body: [
      "Personal precautions, protective equipment, and emergency procedures; environmental precautions; and methods and materials for containment and cleaning up.",
    ],
  },
  {
    number: 7,
    title: "Handling and Storage",
    body: [
      "Precautions for safe handling, including hygiene measures, and conditions for safe storage, including any incompatibilities with other chemicals.",
    ],
  },
  {
    number: 8,
    title: "Exposure Controls/Personal Protection",
    body: [
      "OSHA permissible exposure limits (PELs), ACGIH threshold limit values (TLVs), or any other exposure limit used or recommended, appropriate engineering controls, and individual protection measures such as personal protective equipment (PPE).",
    ],
  },
  {
    number: 9,
    title: "Physical and Chemical Properties",
    body: [
      "Minimum: appearance, odor, odor threshold, pH, melting/freezing point, boiling point, flash point, evaporation rate, flammability, upper/lower flammability or explosive limits, vapor pressure, vapor density, relative density, solubility, partition coefficient, autoignition temperature, decomposition temperature, and viscosity.",
    ],
  },
  {
    number: 10,
    title: "Stability and Reactivity",
    body: [
      "Reactivity, chemical stability, possibility of hazardous reactions, conditions to avoid, incompatible materials, and hazardous decomposition products.",
    ],
  },
  {
    number: 11,
    title: "Toxicological Information",
    body: [
      "Concise but complete description of the various toxicological (health) effects and the available data used to identify those effects, including acute toxicity, skin/eye irritation or corrosion, sensitization, and carcinogenicity where applicable.",
    ],
  },
  {
    number: 12,
    title: "Ecological Information",
    body: [
      "Ecotoxicity, persistence and degradability, bioaccumulative potential, mobility in soil, and other adverse effects. Not required by OSHA but included for completeness.",
    ],
  },
  {
    number: 13,
    title: "Disposal Considerations",
    body: [
      "Description of waste residues and information on safe handling and methods of disposal, including the disposal of contaminated packaging, consistent with applicable federal, state, and local regulations.",
    ],
  },
  {
    number: 14,
    title: "Transport Information",
    body: [
      "UN number, UN proper shipping name, transport hazard class(es), packing group, environmental hazards, and any special precautions for transport, per DOT/IATA/IMDG requirements.",
    ],
  },
  {
    number: 15,
    title: "Regulatory Information",
    body: [
      "Safety, health, and environmental regulations specific to the product, such as TSCA inventory status, SARA 311/312 hazard categories, and applicable state right-to-know listings.",
    ],
  },
  {
    number: 16,
    title: "Other Information",
    body: [
      "Date of preparation or last revision of the SDS, and other relevant information such as key literature references, abbreviations, and a disclaimer that the information is believed accurate but provided without warranty.",
    ],
  },
];

export const HAZCOM_TRAINING_SESSIONS: readonly HazcomTrainingSession[] = [
  {
    id: "TR-001",
    date: "2026-02-10",
    trainer: "R. Alvarez",
    topic: "GHS Labeling & Pictogram Recognition",
    chemicals: ["Hydrochloric Acid", "Sodium Hydroxide"],
    attendees: 18,
    status: "Completed",
    materialsLink: "/files/training/tr-001-slides.pdf",
    notes:
      "Covered pictogram identification and label elements for corrosive chemicals.",
  },
  {
    id: "TR-002",
    date: "2026-04-22",
    trainer: "S. Mitchell",
    topic: "Safe Handling of Flammable Solvents",
    chemicals: ["Acetone", "Isopropyl Alcohol", "Toluene"],
    attendees: 22,
    status: "Completed",
    materialsLink: "/files/training/tr-002-slides.pdf",
    notes:
      "Included fire extinguisher demonstration and spill containment drill.",
  },
  {
    id: "TR-003",
    date: "2026-06-05",
    trainer: "J. Torres",
    topic: "SDS Interpretation for Lab Technicians",
    chemicals: ["Benzene"],
    attendees: 12,
    status: "Completed",
    materialsLink: null,
    notes:
      "Focused on Section 8 exposure controls and Section 11 toxicological data.",
  },
  {
    id: "TR-004",
    date: "2026-09-14",
    trainer: "TBD",
    topic: "Annual HazCom Refresher",
    chemicals: [
      "Hydrochloric Acid",
      "Acetone",
      "Benzene",
      "Sodium Hydroxide",
      "Isopropyl Alcohol",
      "Toluene",
    ],
    attendees: 0,
    status: "Scheduled",
    materialsLink: null,
    notes:
      "Session pending trainer assignment; calendar hold sent to all lab staff.",
  },
];

const RA_001_RATINGS = {
  health: 3,
  flammability: 1,
  reactivity: 2,
  ppeIndex: 3,
} as const;
const RA_002_RATINGS = {
  health: 3,
  flammability: 1,
  reactivity: 1,
  ppeIndex: 0,
} as const;
const RA_003_RATINGS = {
  health: 4,
  flammability: 3,
  reactivity: 2,
  ppeIndex: 4,
} as const;
const RA_004_RATINGS = {
  health: 2,
  flammability: 0,
  reactivity: 2,
  ppeIndex: 2,
} as const;

export const HAZCOM_RISK_ASSESSMENTS: readonly HazcomRiskAssessment[] = [
  {
    id: "RA-001",
    chemical: "Hydrochloric Acid",
    exposureScenario: "Tank filling - 60 min",
    exposureMinutes: 60,
    frequency: "Daily",
    ratings: RA_001_RATINGS,
    riskLevel: hazcomRiskLevel(hazcomRiskScore(RA_001_RATINGS)),
    status: "Approved",
    reviewer: "J. Torres",
    date: "2026-03-02",
    ppe: ["Nitrile gloves", "Face shield", "Chemical-resistant apron"],
    controls:
      "Local exhaust ventilation at tank inlet; secondary containment tray; eyewash station within 10m.",
  },
  {
    id: "RA-002",
    chemical: "Acetone",
    exposureScenario: "Parts cleaning - 30 min",
    exposureMinutes: 30,
    frequency: "Weekly",
    ratings: RA_002_RATINGS,
    riskLevel: hazcomRiskLevel(hazcomRiskScore(RA_002_RATINGS)),
    status: "Approved",
    reviewer: "S. Mitchell",
    date: "2026-04-01",
    ppe: ["Nitrile gloves", "Safety glasses"],
    controls:
      "General ventilation; solvent-rated waste container kept within reach.",
  },
  {
    id: "RA-003",
    chemical: "Benzene",
    exposureScenario: "Lab analysis - 20 min",
    exposureMinutes: 20,
    frequency: "Monthly",
    ratings: RA_003_RATINGS,
    riskLevel: hazcomRiskLevel(hazcomRiskScore(RA_003_RATINGS)),
    status: "Pending",
    reviewer: "M. Chen",
    date: "2026-06-18",
    ppe: [
      "Nitrile gloves",
      "Respirator (organic vapor cartridge)",
      "Safety glasses",
      "Lab coat",
    ],
    controls:
      "Fume hood mandatory; benzene exposure monitoring badge required; restricted access area.",
  },
  {
    id: "RA-004",
    chemical: "Sodium Hydroxide",
    exposureScenario: "Drain cleaning - 15 min",
    exposureMinutes: 15,
    frequency: "As needed",
    ratings: RA_004_RATINGS,
    riskLevel: hazcomRiskLevel(hazcomRiskScore(RA_004_RATINGS)),
    status: "Draft",
    reviewer: "L. Park",
    date: "2026-07-11",
    ppe: ["Nitrile gloves", "Face shield"],
    controls:
      "Add caustic to water, never water to caustic; keep neutralizing agent on hand.",
  },
];

export const HAZCOM_PICTOGRAMS: readonly HazcomPictogram[] = [
  "Flammable",
  "Toxic",
  "Irritant",
  "Environmental",
  "Corrosive",
  "Oxidizer",
  "Explosive",
  "Compressed Gas",
  "Health Hazard",
];

export const HAZCOM_PPE_OPTIONS: readonly string[] = [
  "Nitrile gloves",
  "Safety glasses",
  "Face shield",
  "Chemical-resistant apron",
  "Respirator (organic vapor cartridge)",
  "Lab coat",
  "Steel-toe boots",
];

export type HazcomOverviewStat = Readonly<{
  id: string;
  label: string;
  value: number;
  icon: string;
}>;

export const HAZCOM_OVERVIEW_STATS: readonly HazcomOverviewStat[] = [
  {
    id: "total-chemicals",
    label: "Total Chemicals",
    value: 142,
    icon: "mdi:flask-outline",
  },
  {
    id: "missing-sds",
    label: "Missing SDS",
    value: 7,
    icon: "mdi:file-alert-outline",
  },
  {
    id: "training-overdue",
    label: "Training Overdue",
    value: 14,
    icon: "mdi:account-alert-outline",
  },
  {
    id: "sds-expiring-soon",
    label: "SDS Expiring Soon",
    value: 5,
    icon: "mdi:clock-alert-outline",
  },
];

export function findHazcomChemical(id: string): HazcomChemical | undefined {
  return HAZCOM_CHEMICALS.find((chemical) => chemical.id === id);
}

export function findHazcomSdsRecord(id: string): HazcomSdsRecord | undefined {
  return HAZCOM_SDS_RECORDS.find((record) => record.id === id);
}
