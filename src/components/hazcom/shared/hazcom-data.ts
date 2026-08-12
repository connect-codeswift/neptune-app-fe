/**
 * Reference data for the HazCom module.
 *
 * The GHS pictogram set, the PPE checklist, and the 16 SDS section headings are
 * fixed by the standard, not by any site's records, so they are defined here
 * rather than fetched.
 *
 * The sample inventory, SDS, training, risk-assessment and KPI fixtures that
 * used to live alongside them are gone. They rendered on the overview dashboard
 * as if they were the signed-in site's own figures — 142 chemicals, 7 missing
 * SDS, named chemicals in named storage rooms — while the real endpoints
 * returned nothing. The overview reads those endpoints now; see
 * use-hazcom-overview.
 */

import type {
  HazcomPictogram,
  HazcomSdsSection,
} from "@/components/hazcom/shared/hazcom-types";

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
