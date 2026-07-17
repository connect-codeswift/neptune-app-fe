export const incidents = [
  {
    title: "Chemical spill — Storage B",
    location: "Birmingham Plant",
    time: "12 min ago",
  },
  {
    title: "Machine stoppage — Line 4",
    location: "Leeds Plant",
    time: "1 hr ago",
  },
  {
    title: "Near miss — Loading bay",
    location: "Manchester Depot",
    time: "3 hrs ago",
  },
] as const;

export const capas = [
  {
    title: "Install secondary containment",
    assignee: "J. Harris",
    due: "Jun 4",
  },
  {
    title: "Retrain Line 4 operators",
    assignee: "M. Price",
    due: "Jun 3",
  },
] as const;

export const features = [
  {
    title: "Incident Management",
    description: "Report and close incidents faster",
  },
  {
    title: "Compliance Audits",
    description: "300+ templates, audit-ready instantly",
  },
  {
    title: "Sustainability & ESG",
    description: "Track emissions, generate GRI reports",
  },
  {
    title: "SOC 2 Type II",
    description: "Enterprise-grade security, always on",
  },
] as const;
