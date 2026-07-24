import {
  Proficiency,
  Relevance,
  ActionType,
  NodeShape,
} from "../../../shared/utils/cvConstants";

export const TIER_PRESETS = {
  1: {
    multiplier: 2,
    glowMultiplier: 5,
    visibilityThreshold: 0.2,
    fontScale: 1.6,
    fontWeight: "600",
  },
  2: {
    multiplier: 1.5,
    glowMultiplier: 3.5,
    visibilityThreshold: 0.5,
    fontScale: 1.2,
    fontWeight: "600",
  },
  3: {
    multiplier: 1,
    glowMultiplier: 2.5,
    visibilityThreshold: 0.9,
    fontScale: 1.0,
    fontWeight: "400",
  },
  4: {
    multiplier: 0.7,
    glowMultiplier: 1.5,
    visibilityThreshold: 1.6,
    fontScale: 0.85,
    fontWeight: "400",
  },
};

export const CORE_TOKENS = {
  textStyle: "#edf2f7",
  fontFamily: "Helvetica Neue, sans-serif",
  glowInnerAlpha: "88",
  ringAlpha: "44",
  ringOpacity3D: 0.5,
  glowOpacity3D: 0.6,
  // Deep indigo-navy void, derived from the theme's darkest oklch step
  // (oklch(8% 0.085 305)) instead of a flat transparent/black background.
  spaceBg: "#0b0a16",
};

// Celestial palette — desaturated + theme-mapped so proficiency reads as
// starlight temperature (ember -> amber -> jade -> aurora-cyan) rather
// than raw cyberpunk-terminal hex.
export const PROFICIENCY_COLOR = {
  [Proficiency.UNKNOWN]: "#7c8296",
  [Proficiency.INTERESTED]: "#e8724f",
  [Proficiency.BASIC]: "#e0b64a",
  [Proficiency.EXPERIENCED]: "#5fd3a0",
  [Proficiency.EXPERT]: "#5fd0f2",
};

export const RELEVANCE_SIZE = {
  [Relevance.NEGLIGIBLE]: 1,
  [Relevance.LOW]: 1.3,
  [Relevance.MODERATE]: 1.8,
  [Relevance.HIGH]: 2.5,
  [Relevance.CRITICAL]: 3.2,
};

export const DEFAULT_SIZE = 1;

export const RING = {
  multiplier: 1.4,
  artifactColor: "#e0b64a",
  defaultColor: null,
};

export const SHAPE_CONFIG = {
  [NodeShape.CIRCLE]: { labelPosition: "below", labelType: "sprite" },
  [NodeShape.PILL]: { labelPosition: "inside", labelType: "sprite" },
  [NodeShape.CARD_ARTIFACT]: { labelPosition: "inside", labelType: "sprite" },
  [NodeShape.CARD_RESOURCE]: { labelPosition: "inside", labelType: "sprite" },
  [NodeShape.NOTE]: { labelPosition: "inside", labelType: "sprite" },
};

export const ACTION_SHAPE = {
  [ActionType.PROFICIENCY]: NodeShape.PILL,
  [ActionType.ARTIFACT]: NodeShape.CARD_ARTIFACT,
  [ActionType.RESOURCE]: NodeShape.CARD_RESOURCE,
  [ActionType.NOTE]: NodeShape.NOTE,
};

export const ACTION_LABELS = {
  [ActionType.PROFICIENCY]: "Proficiency",
  [ActionType.RESOURCE]: "Resources",
  [ActionType.NOTE]: "Notes",
  [ActionType.ARTIFACT]: "Artifacts",
};

export const PROFICIENCY_LABELS = {
  [Proficiency.UNKNOWN]: "Unknown",
  [Proficiency.INTERESTED]: "Interested",
  [Proficiency.BASIC]: "Basic",
  [Proficiency.EXPERIENCED]: "Experienced",
  [Proficiency.EXPERT]: "Expert",
};

export function normalizeProficiency(value) {
  if (value == null) return Proficiency.UNKNOWN;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value in Proficiency)
    return Proficiency[value];
  return Proficiency.UNKNOWN;
}

export function getProficiencyNodeColor(level, currentLevel) {
  if (level === currentLevel) return "#ffffff";
  return PROFICIENCY_COLOR[level] || PROFICIENCY_COLOR[Proficiency.UNKNOWN];
}

export function getActionNodeShape(actionType) {
  return ACTION_SHAPE[actionType] || NodeShape.CIRCLE;
}

export function getArtifactNodeColor() {
  return RING.artifactColor || "#e0b64a";
}

export function getResourceNodeColor() {
  return "#5fa8e0";
}

export function getNoteNodeColor() {
  return "#a891e0";
}
