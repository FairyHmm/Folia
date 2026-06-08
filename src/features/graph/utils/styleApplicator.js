import {
  Proficiency,
  Relevance,
  NodeShape,
} from "../../../shared/utils/cvConstants";
import {
  PROFICIENCY_COLOR,
  RELEVANCE_SIZE,
  SHAPE_CONFIG,
  RING,
  DEFAULT_SIZE,
} from "../utils/graphStyleTokens";

const PROFICIENCY_KEY = Object.fromEntries(
  Object.entries(Proficiency).map(([k, v]) => [k, v]),
);

const RELEVANCE_KEY = Object.fromEntries(
  Object.entries(Relevance).map(([k, v]) => [k, v]),
);

function normalizeProficiency(value) {
  if (value == null) return Proficiency.UNKNOWN;
  if (typeof value === "number") return value;
  return PROFICIENCY_KEY[value] ?? Proficiency.UNKNOWN;
}

function normalizeRelevance(value) {
  if (value == null) return null;
  if (typeof value === "number") return value;
  return RELEVANCE_KEY[value] ?? null;
}

function bestRelevanceSize(relevance) {
  if (!relevance || Object.keys(relevance).length === 0) return DEFAULT_SIZE;
  const values = Object.values(relevance)
    .map(normalizeRelevance)
    .filter((v) => v != null);
  if (values.length === 0) return DEFAULT_SIZE;
  return RELEVANCE_SIZE[Math.max(...values)] ?? DEFAULT_SIZE;
}

export function applyNodeStyles(node) {
  const shape = NodeShape.CIRCLE;
  return {
    shape,
    color: PROFICIENCY_COLOR[normalizeProficiency(node.proficiency)],
    sizeMultiplier: bestRelevanceSize(node.relevance),
    ringColor:
      node.artifacts?.length > 0 ? RING.artifactColor : RING.defaultColor,
    ringMultiplier: RING.multiplier,
    ...SHAPE_CONFIG[shape],
  };
}
