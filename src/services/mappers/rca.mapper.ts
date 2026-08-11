import type {
  CreateContributingFactorRequestDto,
  UpdateContributingFactorRequestDto,
} from "@/dtos/req/rca-contributing-factor-request.dto";
import type {
  CreateRcaWhysRequestDto,
  DropRcaWhyRequestDto,
  UpdateRcaWhyRequestDto,
} from "@/dtos/req/rca-whys-request.dto";
import type { CreateRcaCategoryRequestDto } from "@/dtos/req/rca-category-request.dto";
import type {
  CreateRcaCorrectiveActionRequestDto,
  DropRcaCorrectiveActionRequestDto,
  UpdateRcaCorrectiveActionRequestDto,
} from "@/dtos/req/rca-corrective-action-request.dto";
import type { RcaCategoryDto } from "@/dtos/res/rca-category-response.dto";
import type {
  RcaContributingFactorDto,
  RcaCorrectiveActionItemDto,
  RcaWhyItemDto,
} from "@/dtos/res/rca-incident-response.dto";
import type {
  HrcaRow,
} from "@/components/incidents/detail/investigations/hrca/hrca-data";
import type {
  ContributingFactorItem,
  StatusChecklistRow,
  WhyChainItem,
} from "@/components/incidents/detail/incident-detail-types";
import { getAuthContext } from "@/lib/auth-context";

/** Stable ids seeded by migration — one HRCA lane per category. */
const HRCA_SEEDED_CATEGORY_IDS = [1, 2, 3, 4, 5] as const;

export type HrcaSeededCategoryId = (typeof HRCA_SEEDED_CATEGORY_IDS)[number];

const HRCA_LANE_ACCENTS: Record<HrcaSeededCategoryId, string> = {
  1: "#e6932e",
  2: "#e0413b",
  3: "#7c8794",
  4: "#2f7fd1",
  5: "#d4a017",
};

export type RcaCategoryViewModel = Readonly<{
  id: number;
  name: string;
}>;

export type RcaWhyViewModel = Readonly<{
  id: number;
  num: number;
  text: string;
  isRootCause: boolean;
}>;

export type RcaCorrectiveActionViewModel = Readonly<{
  id: number;
  text: string;
}>;

export type RcaContributingFactorViewModel = Readonly<{
  id: number;
  incidentId: number;
  rcaCategoryId: number;
  rcaCategoryName: string;
  siteId: number;
  userId: number;
  description: string;
  whys: readonly RcaWhyViewModel[];
  correctiveActions: readonly RcaCorrectiveActionViewModel[];
}>;

export type RcaHrcaLaneViewModel = Readonly<{
  categoryId: number;
  categoryName: string;
  accent: string;
  contributingFactorId: number | null;
  contributingFactor: string;
  whys: readonly RcaWhyViewModel[];
  correctiveActions: readonly RcaCorrectiveActionViewModel[];
}>;

export type RcaIncidentViewModel = Readonly<{
  factors: readonly RcaContributingFactorViewModel[];
  lanes: readonly RcaHrcaLaneViewModel[];
}>;

export const EMPTY_RCA_INCIDENT_VIEW: RcaIncidentViewModel = {
  factors: [],
  lanes: [],
};

export function mapRcaCategoryDtoToView(
  dto: RcaCategoryDto,
): RcaCategoryViewModel {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export function mapRcaCategoryDtosToView(
  dtos: readonly RcaCategoryDto[],
): RcaCategoryViewModel[] {
  return dtos.map(mapRcaCategoryDtoToView);
}

export function buildCreateRcaCategoryRequest(
  name: string,
): CreateRcaCategoryRequestDto {
  return { name: name.trim() };
}

export type BuildCreateContributingFactorInput = Readonly<{
  incidentId: number;
  rcaCategoryId: number;
  description: string;
}>;

export function buildCreateContributingFactorRequest(
  input: BuildCreateContributingFactorInput,
): CreateContributingFactorRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;

  if (userId <= 0) {
    throw new Error("Sign in required to create a contributing factor.");
  }

  if (input.incidentId <= 0) {
    throw new Error("A valid incident is required.");
  }

  if (input.rcaCategoryId <= 0) {
    throw new Error("A valid RCA category is required.");
  }

  return {
    incidentId: input.incidentId,
    rcaCategoryId: input.rcaCategoryId,
    description: input.description.trim(),
    userId,
  };
}

export type BuildUpdateContributingFactorInput = Readonly<{
  incidentId: number;
  contributingFactorId: number;
  rcaCategoryId: number;
  description: string;
}>;

export function buildUpdateContributingFactorRequest(
  input: BuildUpdateContributingFactorInput,
): UpdateContributingFactorRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;
  const siteId = auth?.siteId ?? 0;

  if (userId <= 0 || siteId <= 0) {
    throw new Error("Sign in required to update a contributing factor.");
  }

  if (input.incidentId <= 0) {
    throw new Error("A valid incident is required.");
  }

  if (input.contributingFactorId <= 0) {
    throw new Error("A valid contributing factor is required.");
  }

  if (input.rcaCategoryId <= 0) {
    throw new Error("A valid RCA category is required.");
  }

  return {
    siteId,
    userId,
    incidentId: input.incidentId,
    contributingFactorId: input.contributingFactorId,
    rcaCategoryId: input.rcaCategoryId,
    description: input.description.trim(),
  };
}

export type BuildCreateRcaWhysInput = Readonly<{
  /** Used to invalidate the incident RCA query after save. */
  incidentId: number;
  contributingFactorId: number;
  whys: readonly Readonly<{
    stepNumber: number;
    description: string;
    isRootCause?: boolean;
  }>[];
}>;

export function buildCreateRcaWhysRequest(
  input: BuildCreateRcaWhysInput,
): CreateRcaWhysRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;

  if (userId <= 0) {
    throw new Error("Sign in required to add why steps.");
  }

  if (input.contributingFactorId <= 0) {
    throw new Error("Create the contributing factor before adding whys.");
  }

  const whys = input.whys
    .map((why, index) => ({
      stepNumber: why.stepNumber > 0 ? why.stepNumber : index + 1,
      description: why.description.trim(),
      isRootCause: why.isRootCause ?? false,
    }))
    .filter((why) => why.description.length > 0);

  if (whys.length === 0) {
    throw new Error("At least one why description is required.");
  }

  return {
    contributingFactorId: input.contributingFactorId,
    userId,
    // The caller decides which why is the root cause — the HRCA board sends one
    // why at a time, so deriving it from this array's own last index marked
    // every single-why save as the root cause.
    whys: whys.map((why) => ({
      stepNumber: why.stepNumber,
      description: why.description,
      isRootCause: why.isRootCause,
    })),
  };
}

export type BuildUpdateRcaWhyInput = Readonly<{
  /** Used to invalidate the incident RCA query after save. */
  incidentId: number;
  whyId: number;
  stepNumber: number;
  description: string;
  isRootCause: boolean;
}>;

export function buildUpdateRcaWhyRequest(
  input: BuildUpdateRcaWhyInput,
): UpdateRcaWhyRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;
  const siteId = auth?.siteId ?? 0;

  if (userId <= 0 || siteId <= 0) {
    throw new Error("Sign in required to update a why step.");
  }

  if (input.whyId <= 0) {
    throw new Error("A valid why step is required.");
  }

  if (input.stepNumber <= 0) {
    throw new Error("Why step number must be at least 1.");
  }

  return {
    siteId,
    userId,
    whyId: input.whyId,
    stepNumber: input.stepNumber,
    description: input.description.trim(),
    isRootCause: input.isRootCause,
  };
}

export function buildDropRcaWhyRequest(): DropRcaWhyRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;
  const siteId = auth?.siteId ?? 0;

  if (userId <= 0 || siteId <= 0) {
    throw new Error("Sign in required to delete a why step.");
  }

  return { siteId, userId };
}

export type BuildCreateRcaCorrectiveActionInput = Readonly<{
  /** Used to invalidate the incident RCA query after save. */
  incidentId: number;
  contributingFactorId: number;
  description: string;
}>;

export function buildCreateRcaCorrectiveActionRequest(
  input: BuildCreateRcaCorrectiveActionInput,
): CreateRcaCorrectiveActionRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;

  if (userId <= 0) {
    throw new Error("Sign in required to add a corrective action.");
  }

  if (input.contributingFactorId <= 0) {
    throw new Error("Create the contributing factor before adding corrective actions.");
  }

  const description = input.description.trim();

  if (description.length === 0) {
    throw new Error("Corrective action description is required.");
  }

  return {
    contributingFactorId: input.contributingFactorId,
    userId,
    description,
  };
}

export type BuildUpdateRcaCorrectiveActionInput = Readonly<{
  /** Used to invalidate the incident RCA query after save. */
  incidentId: number;
  correctiveActionId: number;
  description: string;
}>;

export function buildUpdateRcaCorrectiveActionRequest(
  input: BuildUpdateRcaCorrectiveActionInput,
): UpdateRcaCorrectiveActionRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;
  const siteId = auth?.siteId ?? 0;

  if (userId <= 0 || siteId <= 0) {
    throw new Error("Sign in required to update a corrective action.");
  }

  if (input.correctiveActionId <= 0) {
    throw new Error("A valid corrective action is required.");
  }

  const description = input.description.trim();

  if (description.length === 0) {
    throw new Error("Corrective action description is required.");
  }

  return {
    siteId,
    userId,
    correctiveActionId: input.correctiveActionId,
    description,
  };
}

export function buildDropRcaCorrectiveActionRequest(): DropRcaCorrectiveActionRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;
  const siteId = auth?.siteId ?? 0;

  if (userId <= 0 || siteId <= 0) {
    throw new Error("Sign in required to delete a corrective action.");
  }

  return { siteId, userId };
}

/** Seeded lane categories (ids 1–5), sorted by id. */
export function selectHrcaLaneCategories(
  categories: readonly RcaCategoryViewModel[],
): RcaCategoryViewModel[] {
  const byId = new Map(categories.map((category) => [category.id, category]));

  return HRCA_SEEDED_CATEGORY_IDS.flatMap((id) => {
    const category = byId.get(id);
    return category ? [category] : [];
  });
}

function mapRcaWhyDtoToView(dto: RcaWhyItemDto): RcaWhyViewModel {
  return {
    id: dto.id,
    num: dto.stepNumber,
    text: dto.description,
    isRootCause: dto.isRootCause,
  };
}

export function mapRcaWhyDtosToView(
  dtos: readonly RcaWhyItemDto[],
): RcaWhyViewModel[] {
  return dtos.map(mapRcaWhyDtoToView);
}

export function mapRcaWhyDtoToViewModel(dto: RcaWhyItemDto): RcaWhyViewModel {
  return mapRcaWhyDtoToView(dto);
}

function mapRcaCorrectiveActionDtoToView(
  dto: RcaCorrectiveActionItemDto,
): RcaCorrectiveActionViewModel {
  return {
    id: dto.id,
    text: dto.description,
  };
}

export function mapRcaCorrectiveActionDtoToViewModel(
  dto: RcaCorrectiveActionItemDto,
): RcaCorrectiveActionViewModel {
  return mapRcaCorrectiveActionDtoToView(dto);
}

export function mapRcaContributingFactorDtoToView(
  dto: RcaContributingFactorDto,
): RcaContributingFactorViewModel {
  return {
    id: dto.id,
    incidentId: dto.incidentId,
    rcaCategoryId: dto.rcaCategoryId,
    rcaCategoryName: dto.rcaCategoryName,
    siteId: dto.siteId,
    userId: dto.userId,
    description: dto.description,
    whys: dto.whys.map(mapRcaWhyDtoToView),
    correctiveActions: dto.correctiveActions.map(mapRcaCorrectiveActionDtoToView),
  };
}

function mapRcaContributingFactorDtosToView(
  dtos: readonly RcaContributingFactorDto[],
): RcaContributingFactorViewModel[] {
  return dtos.map(mapRcaContributingFactorDtoToView);
}

function emptyLane(category: RcaCategoryViewModel): RcaHrcaLaneViewModel {
  const accent =
    category.id in HRCA_LANE_ACCENTS
      ? HRCA_LANE_ACCENTS[category.id as HrcaSeededCategoryId]
      : "#7c8794";

  return {
    categoryId: category.id,
    categoryName: category.name,
    accent,
    contributingFactorId: null,
    contributingFactor: "",
    whys: [],
    correctiveActions: [],
  };
}

function mapFactorToLane(
  category: RcaCategoryViewModel,
  factor: RcaContributingFactorViewModel,
): RcaHrcaLaneViewModel {
  const base = emptyLane(category);

  return {
    ...base,
    contributingFactorId: factor.id,
    contributingFactor: factor.description,
    whys: factor.whys,
    correctiveActions: factor.correctiveActions,
  };
}

/**
 * Builds five HRCA lanes from seeded categories and merges contributing factors
 * grouped by `rcaCategoryId`.
 */
function buildRcaHrcaLanes(
  categories: readonly RcaCategoryViewModel[],
  factors: readonly RcaContributingFactorViewModel[],
): RcaHrcaLaneViewModel[] {
  const laneCategories = selectHrcaLaneCategories(categories);
  const factorsByCategoryId = new Map(
    factors.map((factor) => [factor.rcaCategoryId, factor]),
  );

  return laneCategories.map((category) => {
    const factor = factorsByCategoryId.get(category.id);
    return factor ? mapFactorToLane(category, factor) : emptyLane(category);
  });
}

export function mapRcaIncidentToView(
  factors: readonly RcaContributingFactorDto[],
  categories: readonly RcaCategoryDto[],
): RcaIncidentViewModel {
  const categoryViews = mapRcaCategoryDtosToView(categories);
  const factorViews = mapRcaContributingFactorDtosToView(factors);

  return {
    factors: factorViews,
    lanes: buildRcaHrcaLanes(categoryViews, factorViews),
  };
}

/** Maps API HRCA lanes into board row models. */
export function mapRcaHrcaLanesToHrcaRows(
  lanes: readonly RcaHrcaLaneViewModel[],
): HrcaRow[] {
  return lanes.map((lane) => ({
    id: String(lane.categoryId),
    categoryId: lane.categoryId,
    category: lane.categoryName,
    accent: lane.accent,
    contributingFactorId: lane.contributingFactorId,
    contributingFactor: lane.contributingFactor,
    whys: lane.whys.map((why) => ({
      id: why.id,
      num: why.num,
      text: why.text,
      isRootCause: why.isRootCause,
    })),
    correctiveActions: lane.correctiveActions.map((action) => ({
      id: action.id,
      text: action.text,
    })),
  }));
}

export type RcaInvestigationPreview = Readonly<{
  whyChain: readonly WhyChainItem[];
  contributingFactors: readonly ContributingFactorItem[];
  statusSteps: readonly StatusChecklistRow[];
  statusLabel: "Not started" | "In progress" | "Complete";
  methodLine: string;
}>;

export type BuildRcaInvestigationPreviewInput = Readonly<{
  ledBy: string;
  isClosed: boolean;
  attachmentCount: number;
  witnessCount: number;
  capaCount: number;
}>;

function buildRcaWhyChainPreview(
  lanes: readonly RcaHrcaLaneViewModel[],
): WhyChainItem[] {
  const rootCauseItems = lanes.flatMap((lane) =>
    lane.whys
      .filter((why) => why.isRootCause)
      .map((why) => ({ lane, why })),
  );

  if (rootCauseItems.length > 0) {
    return rootCauseItems.map(({ lane, why }, index) => ({
      step: index + 1,
      label:
        rootCauseItems.length > 1
          ? `ROOT CAUSE · ${lane.categoryName}`
          : "ROOT CAUSE",
      text: why.text,
      isRootCause: true,
    }));
  }

  const laneWithWhys = [...lanes]
    .filter((lane) => lane.whys.length > 0)
    .sort((left, right) => right.whys.length - left.whys.length)[0];

  if (!laneWithWhys) {
    return [];
  }

  return laneWithWhys.whys.map((why) => ({
    step: why.num,
    label: why.isRootCause
      ? `ROOT CAUSE · ${laneWithWhys.categoryName}`
      : `WHY ${String(why.num)}`,
    text: why.text,
    isRootCause: why.isRootCause,
  }));
}

/** Builds Investigation tab preview cards from GET /Rca/Incident data. */
export function buildRcaInvestigationPreview(
  lanes: readonly RcaHrcaLaneViewModel[],
  input: BuildRcaInvestigationPreviewInput,
): RcaInvestigationPreview {
  const contributingFactors = lanes
    .filter((lane) => lane.contributingFactor.trim().length > 0)
    .map((lane) => ({
      category: lane.categoryName,
      text: lane.contributingFactor,
      accent: lane.accent,
    }));

  const documentedLaneCount = lanes.filter(
    (lane) => lane.contributingFactorId != null,
  ).length;
  const hasWhys = lanes.some((lane) => lane.whys.length > 0);
  const hasRootCause = lanes.some((lane) =>
    lane.whys.some((why) => why.isRootCause),
  );
  const hasCorrectiveActions = lanes.some(
    (lane) => lane.correctiveActions.length > 0,
  );
  const hasCapa = hasCorrectiveActions || input.capaCount > 0;

  const statusSteps: StatusChecklistRow[] = [
    {
      label: "Evidence collected",
      completed: input.attachmentCount > 0,
    },
    {
      label: "Witnesses interviewed",
      completed: input.witnessCount > 0,
    },
    {
      label: "Contributing factors documented",
      completed: documentedLaneCount > 0,
    },
    {
      label: "Root cause identified",
      completed: hasRootCause,
    },
    {
      label: "Corrective actions defined",
      completed: hasCapa,
    },
    {
      label: "Closed-out",
      completed: input.isClosed,
    },
  ];

  const completedSteps = statusSteps.filter((step) => step.completed).length;
  let statusLabel: RcaInvestigationPreview["statusLabel"] = "Not started";

  if (input.isClosed && hasRootCause && hasCapa) {
    statusLabel = "Complete";
  } else if (documentedLaneCount > 0 || hasWhys || hasCapa) {
    statusLabel = "In progress";
  } else if (completedSteps > 0) {
    statusLabel = "In progress";
  }

  const ledBy = input.ledBy !== "Unassigned" ? input.ledBy : "Unassigned";

  return {
    whyChain: buildRcaWhyChainPreview(lanes),
    contributingFactors,
    statusSteps,
    statusLabel,
    methodLine: `Method: 5 Whys · Led by ${ledBy} · ${String(documentedLaneCount)}/5 HRCA lanes documented`,
  };
}
