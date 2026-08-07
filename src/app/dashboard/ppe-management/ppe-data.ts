export type PpeSiteId = "plant-a" | "plant-b" | "whse-1" | "whse-2";

export type PpeSiteFilter = "all" | PpeSiteId;

export type PpeInventoryItem = Readonly<{
  id: string;
  /** Primary row label — maps from API `itemName`. */
  category: string;
  /** Protection type — maps from API `category`. */
  protectionType?: string;
  /** Available units — maps from API `inStock`. */
  onHand: number;
  /** Fill percent 0–100 (on hand vs on hand + issued). */
  stockLevel: number;
  /** Denominator used for stock-level display (on hand + issued). */
  stockCapacity: number;
  /** Maps from API `isUsed`. */
  currentlyIssued: number;
  reorderDate: string;
  supplier: string;
  /** Soft-alert row (e.g. critical kit / due soon). */
  attention?: boolean;
  sites: readonly PpeSiteId[];
}>;

export type PpeMetric = Readonly<{
  title: string;
  value: string;
  trendValue: string;
  trendTone: "positive" | "negative";
}>;

export const PPE_SITE_FILTERS = [
  { id: "all" as const, label: "All sites" },
  { id: "plant-a" as const, label: "Plant A" },
  { id: "plant-b" as const, label: "Plant B" },
  { id: "whse-1" as const, label: "Whse 1" },
  { id: "whse-2" as const, label: "Whse 2" },
] as const;

export const PPE_METRICS: readonly PpeMetric[] = [
  {
    title: "Active assignments",
    value: "1,842",
    trendValue: "+34",
    trendTone: "positive",
  },
  {
    title: "Items low stock",
    value: "14",
    trendValue: "+3",
    trendTone: "negative",
  },
];

export const PPE_INVENTORY: readonly PpeInventoryItem[] = [
  {
    id: "hard-hats",
    category: "Hard hats",
    onHand: 412,
    stockLevel: 100,
    stockCapacity: 413,
    currentlyIssued: 1,
    reorderDate: "Apr 26",
    supplier: "MSA",
    sites: ["plant-a", "plant-b", "whse-1"],
  },
  {
    id: "safety-glasses",
    category: "Safety glasses",
    onHand: 1840,
    stockLevel: 99,
    stockCapacity: 1852,
    currentlyIssued: 12,
    reorderDate: "May 02",
    supplier: "Uvex",
    sites: ["plant-a", "plant-b", "whse-1", "whse-2"],
  },
  {
    id: "hearing-protection",
    category: "Hearing protection",
    onHand: 980,
    stockLevel: 100,
    stockCapacity: 984,
    currentlyIssued: 4,
    reorderDate: "May 15",
    supplier: "3M",
    sites: ["plant-a", "whse-1"],
  },
  {
    id: "cut-resistant-gloves",
    category: "Cut-resistant gloves",
    onHand: 320,
    stockLevel: 95,
    stockCapacity: 338,
    currentlyIssued: 18,
    reorderDate: "Apr 28",
    supplier: "HexArmor",
    sites: ["plant-a", "plant-b", "whse-2"],
  },
  {
    id: "steel-toe-boots",
    category: "Steel-toe boots",
    onHand: 184,
    stockLevel: 97,
    stockCapacity: 190,
    currentlyIssued: 6,
    reorderDate: "May 09",
    supplier: "Red Wing",
    sites: ["plant-b", "whse-1", "whse-2"],
  },
  {
    id: "respirators-n95",
    category: "Respirators (N95)",
    onHand: 1200,
    stockLevel: 98,
    stockCapacity: 1224,
    currentlyIssued: 24,
    reorderDate: "May 20",
    supplier: "3M",
    sites: ["plant-a", "plant-b", "whse-1", "whse-2"],
  },
  {
    id: "arc-flash-suits",
    category: "Arc-flash suits",
    onHand: 28,
    stockLevel: 93,
    stockCapacity: 30,
    currentlyIssued: 2,
    reorderDate: "Apr 27",
    supplier: "Salisbury",
    attention: true,
    sites: ["plant-a", "whse-2"],
  },
];

export type PpeCatalogStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type PpeIssuanceRecord = Readonly<{
  id: string;
  employeeId: string;
  employee: string;
  quantity: number;
  size: string;
  issueDate: string;
  status: string;
}>;

export type PpeCatalogDetail = Readonly<{
  id: string;
  name: string;
  protectionType: string;
  standard: string;
  supplier: string;
  status: PpeCatalogStatus;
  description: string;
  category: string;
  unitCost: string;
  replaceAfter: string;
  inspectionInterval: string;
  availableSizes: string;
  inStock: number;
  minLevel: number;
  currentlyIssued: number;
  onOrder: number;
  issuances: readonly PpeIssuanceRecord[];
}>;

export const PPE_CATALOG_DETAILS: readonly PpeCatalogDetail[] = [
  {
    id: "hard-hats",
    name: "Hard Hat (Type I Class E)",
    protectionType: "Head Protection",
    standard: "ANSI/ISEA Z89.1-2014",
    supplier: "MSA Safety",
    status: "In Stock",
    description:
      "Electrical class E hard hat for general construction and electrical work environments.",
    category: "Head Protection",
    unitCost: "$28.50",
    replaceAfter: "365 days",
    inspectionInterval: "90 days",
    availableSizes: "Universal",
    inStock: 142,
    minLevel: 30,
    currentlyIssued: 1,
    onOrder: 0,
    issuances: [
      {
        id: "iss-1",
        employeeId: "emp-001",
        employee: "Marcus Rivera",
        quantity: 1,
        size: "Universal",
        issueDate: "2026-04-01",
        status: "Issued",
      },
    ],
  },
  {
    id: "safety-glasses",
    name: "Safety Glasses (Clear Lens)",
    protectionType: "Eye Protection",
    standard: "ANSI Z87.1",
    supplier: "Uvex",
    status: "In Stock",
    description:
      "Impact-rated clear lens safety glasses for general shop and production use.",
    category: "Eye Protection",
    unitCost: "$8.25",
    replaceAfter: "180 days",
    inspectionInterval: "30 days",
    availableSizes: "One size",
    inStock: 1840,
    minLevel: 200,
    currentlyIssued: 12,
    onOrder: 0,
    issuances: [
      {
        id: "iss-sg-1",
        employeeId: "emp-002",
        employee: "Priya Mehra",
        quantity: 1,
        size: "One size",
        issueDate: "2026-03-18",
        status: "Issued",
      },
    ],
  },
  {
    id: "hearing-protection",
    name: "Hearing Protection (Nrr 27)",
    protectionType: "Hearing Protection",
    standard: "ANSI S3.19",
    supplier: "3M",
    status: "In Stock",
    description:
      "Reusable ear muffs for high-noise manufacturing and warehouse zones.",
    category: "Hearing Protection",
    unitCost: "$22.00",
    replaceAfter: "730 days",
    inspectionInterval: "90 days",
    availableSizes: "Universal",
    inStock: 980,
    minLevel: 100,
    currentlyIssued: 4,
    onOrder: 0,
    issuances: [],
  },
  {
    id: "cut-resistant-gloves",
    name: "Cut-Resistant Gloves (A4)",
    protectionType: "Hand Protection",
    standard: "ANSI/ISEA 105",
    supplier: "HexArmor",
    status: "Low Stock",
    description:
      "Level A4 cut-resistant gloves for metal fabrication and blade handling.",
    category: "Hand Protection",
    unitCost: "$18.75",
    replaceAfter: "90 days",
    inspectionInterval: "14 days",
    availableSizes: "S / M / L / XL",
    inStock: 320,
    minLevel: 250,
    currentlyIssued: 18,
    onOrder: 200,
    issuances: [
      {
        id: "iss-gl-1",
        employeeId: "emp-003",
        employee: "Mike Reyes",
        quantity: 2,
        size: "L",
        issueDate: "2026-04-05",
        status: "Issued",
      },
    ],
  },
  {
    id: "steel-toe-boots",
    name: "Steel-Toe Boots",
    protectionType: "Foot Protection",
    standard: "ASTM F2413",
    supplier: "Red Wing",
    status: "In Stock",
    description:
      "Composite steel-toe work boots for plant floor and loading dock use.",
    category: "Foot Protection",
    unitCost: "$145.00",
    replaceAfter: "540 days",
    inspectionInterval: "180 days",
    availableSizes: "7–13",
    inStock: 184,
    minLevel: 40,
    currentlyIssued: 6,
    onOrder: 0,
    issuances: [],
  },
  {
    id: "respirators-n95",
    name: "Respirators (N95)",
    protectionType: "Respiratory Protection",
    standard: "NIOSH N95",
    supplier: "3M",
    status: "In Stock",
    description:
      "Disposable N95 respirators for particulate and dust exposure control.",
    category: "Respiratory Protection",
    unitCost: "$1.85",
    replaceAfter: "Single use",
    inspectionInterval: "N/A",
    availableSizes: "S / M / L",
    inStock: 1200,
    minLevel: 400,
    currentlyIssued: 24,
    onOrder: 500,
    issuances: [],
  },
  {
    id: "arc-flash-suits",
    name: "Arc-Flash Suits (40 cal)",
    protectionType: "Body Protection",
    standard: "NFPA 70E",
    supplier: "Salisbury",
    status: "In Stock",
    description:
      "40 cal/cm² arc-flash kit for qualified electrical maintenance tasks.",
    category: "Body Protection",
    unitCost: "$1,280.00",
    replaceAfter: "1,825 days",
    inspectionInterval: "180 days",
    availableSizes: "M / L / XL",
    inStock: 28,
    minLevel: 8,
    currentlyIssued: 2,
    onOrder: 0,
    issuances: [
      {
        id: "iss-af-1",
        employeeId: "emp-004",
        employee: "Jordan Lee",
        quantity: 1,
        size: "L",
        issueDate: "2026-02-12",
        status: "Issued",
      },
    ],
  },
];

export function getPpeCatalogDetail(
  id: string,
): PpeCatalogDetail | undefined {
  return PPE_CATALOG_DETAILS.find((item) => item.id === id);
}

export type PpeActiveItem = Readonly<{
  id: string;
  catalogId: string;
  name: string;
  summary: string;
  status: "Issued" | "Returned" | "Overdue";
  /** Show Inspect action when true. */
  canInspect?: boolean;
}>;

export type PpeHistoryRecord = Readonly<{
  id: string;
  item: string;
  quantity: number;
  issueDate: string;
  returnDate: string;
  condition: string;
  status: "Issued" | "Returned" | "Overdue";
}>;

export type PpeEmployeeProfile = Readonly<{
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  employeeCode: string;
  activeItems: readonly PpeActiveItem[];
  history: readonly PpeHistoryRecord[];
}>;

export const PPE_EMPLOYEE_PROFILES: readonly PpeEmployeeProfile[] = [
  {
    id: "emp-001",
    name: "Marcus Rivera",
    initials: "MR",
    role: "Operator",
    department: "Assembly",
    employeeCode: "EMP-001",
    activeItems: [
      {
        id: "active-1",
        catalogId: "hard-hats",
        name: "Hard Hat (Type I Class E)",
        summary:
          "Qty 1 × Universal · Issued 2026-04-01 · Replacement — damaged unit returned",
        status: "Issued",
        canInspect: true,
      },
      {
        id: "active-2",
        catalogId: "respirators-n95",
        name: "N95 Respirator (NIOSH)",
        summary: "Qty 5 × M · Issued 2026-04-28 · Spray painting task",
        status: "Issued",
      },
    ],
    history: [
      {
        id: "hist-1",
        item: "Hard Hat (Type I Class E)",
        quantity: 1,
        issueDate: "2026-04-01",
        returnDate: "—",
        condition: "Good",
        status: "Issued",
      },
      {
        id: "hist-2",
        item: "N95 Respirator (NIOSH)",
        quantity: 5,
        issueDate: "2026-04-28",
        returnDate: "—",
        condition: "Good",
        status: "Issued",
      },
    ],
  },
  {
    id: "emp-002",
    name: "Priya Mehra",
    initials: "PM",
    role: "Technician",
    department: "Quality",
    employeeCode: "EMP-002",
    activeItems: [
      {
        id: "active-pm-1",
        catalogId: "safety-glasses",
        name: "Safety Glasses (Clear Lens)",
        summary: "Qty 1 × One size · Issued 2026-03-18 · Line inspection",
        status: "Issued",
        canInspect: true,
      },
    ],
    history: [
      {
        id: "hist-pm-1",
        item: "Safety Glasses (Clear Lens)",
        quantity: 1,
        issueDate: "2026-03-18",
        returnDate: "—",
        condition: "Good",
        status: "Issued",
      },
    ],
  },
  {
    id: "emp-003",
    name: "Mike Reyes",
    initials: "MR",
    role: "Fabricator",
    department: "Metal Shop",
    employeeCode: "EMP-003",
    activeItems: [
      {
        id: "active-mr-1",
        catalogId: "cut-resistant-gloves",
        name: "Cut-Resistant Gloves (A4)",
        summary: "Qty 2 × L · Issued 2026-04-05 · Sheet metal handling",
        status: "Issued",
        canInspect: true,
      },
    ],
    history: [
      {
        id: "hist-mr-1",
        item: "Cut-Resistant Gloves (A4)",
        quantity: 2,
        issueDate: "2026-04-05",
        returnDate: "—",
        condition: "Good",
        status: "Issued",
      },
    ],
  },
  {
    id: "emp-004",
    name: "Jordan Lee",
    initials: "JL",
    role: "Electrician",
    department: "Maintenance",
    employeeCode: "EMP-004",
    activeItems: [
      {
        id: "active-jl-1",
        catalogId: "arc-flash-suits",
        name: "Arc-Flash Suits (40 cal)",
        summary: "Qty 1 × L · Issued 2026-02-12 · Panel maintenance",
        status: "Issued",
        canInspect: true,
      },
    ],
    history: [
      {
        id: "hist-jl-1",
        item: "Arc-Flash Suits (40 cal)",
        quantity: 1,
        issueDate: "2026-02-12",
        returnDate: "—",
        condition: "Good",
        status: "Issued",
      },
    ],
  },
];

export function getPpeEmployeeProfile(
  id: string,
): PpeEmployeeProfile | undefined {
  return PPE_EMPLOYEE_PROFILES.find((profile) => profile.id === id);
}

export type PpeLogStatus =
  | "Issued"
  | "Due Inspection"
  | "Overdue"
  | "Returned";

export type PpeIssuanceLogEntry = Readonly<{
  id: string;
  issueId: string;
  employee: string;
  ppeItem: string;
  qtySize: string;
  issueDate: string;
  returnDate: string;
  condition: string;
  status: PpeLogStatus;
  canReturn: boolean;
}>;

/** One row on My PPE Acknowledgements (Figma 5124:42603). */
export type PpeAcknowledgementEntry = Readonly<{
  id: string;
  issueNumericId: number;
  assignToName: string;
  initials: string;
  item: string;
  quantity: string;
  size: string;
  note: string;
  acknowledged: boolean;
  siteId: number | null;
}>;

/** Full issuance log rows matching Figma 1005:5204. */
export const PPE_ISSUANCE_LOG: readonly PpeIssuanceLogEntry[] = [
  {
    id: "log-1",
    issueId: "ISS-001",
    employee: "Marcus Rivera",
    ppeItem: "Hard Hat (Type I Class E)",
    qtySize: "1 × Universal",
    issueDate: "2026-04-01",
    returnDate: "—",
    condition: "Good",
    status: "Issued",
    canReturn: true,
  },
  {
    id: "log-2",
    issueId: "ISS-002",
    employee: "Aisha Kamara",
    ppeItem: "Cut-Resistant Gloves (A4)",
    qtySize: "2 × M",
    issueDate: "2026-04-10",
    returnDate: "—",
    condition: "Good",
    status: "Issued",
    canReturn: true,
  },
  {
    id: "log-3",
    issueId: "ISS-003",
    employee: "James O'Connor",
    ppeItem: "Arc Flash Face Shield (12 cal)",
    qtySize: "1 × Universal",
    issueDate: "2026-03-15",
    returnDate: "—",
    condition: "Good",
    status: "Issued",
    canReturn: true,
  },
  {
    id: "log-4",
    issueId: "ISS-004",
    employee: "Priya Shah",
    ppeItem: "Safety Glasses (Clear Lens)",
    qtySize: "1 × Universal",
    issueDate: "2026-01-20",
    returnDate: "—",
    condition: "Worn",
    status: "Due Inspection",
    canReturn: true,
  },
  {
    id: "log-5",
    issueId: "ISS-005",
    employee: "Lin Zhang",
    ppeItem: "Half-Face Respirator (Reusable)",
    qtySize: "1 × L",
    issueDate: "2025-11-01",
    returnDate: "—",
    condition: "Unknown",
    status: "Overdue",
    canReturn: true,
  },
  {
    id: "log-6",
    issueId: "ISS-006",
    employee: "Kwame Boateng",
    ppeItem: "Ear Plugs (NRR 33)",
    qtySize: "20 × Universal",
    issueDate: "2026-05-01",
    returnDate: "—",
    condition: "N/A",
    status: "Issued",
    canReturn: true,
  },
  {
    id: "log-7",
    issueId: "ISS-007",
    employee: "Marcus Rivera",
    ppeItem: "N95 Respirator (NIOSH)",
    qtySize: "5 × M",
    issueDate: "2026-04-28",
    returnDate: "—",
    condition: "Good",
    status: "Issued",
    canReturn: true,
  },
  {
    id: "log-8",
    issueId: "ISS-008",
    employee: "Aisha Kamara",
    ppeItem: "Full-Body Harness",
    qtySize: "1 × S/M",
    issueDate: "2026-02-14",
    returnDate: "2026-02-28",
    condition: "Returned Good",
    status: "Returned",
    canReturn: false,
  },
];
