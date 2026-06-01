export const TIER_PRESETS = {
  1: {
    multiplier: 2.4,
    visibilityThreshold: 0.2,
    fontScale: 1.6,
    fontWeight: "600",
  },
  2: {
    multiplier: 1.8,
    visibilityThreshold: 0.5,
    fontScale: 1.2,
    fontWeight: "600",
  },
  3: {
    multiplier: 1.3,
    visibilityThreshold: 0.9,
    fontScale: 1.0,
    fontWeight: "400",
  },
  4: {
    multiplier: 1.0,
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
};

export const COLORS = ["#d32f2f", "#388e3c", "#fbc02d"];
export const SIZE_MULTIPLIERS = [0.5, 1, 1.5, 2, 2.5];
export const GLOW_MULTIPLIERS = [2, 3, 4, 5, 6];
export const RING_MULTIPLIERS = [1.2, 1.4, 1.6, 1.8];

export const SHAPES = {
  circle: { labelPosition: "below", labelType: "sprite" },
  square: { labelPosition: "below", labelType: "sprite" },
  triangle: { labelPosition: "below", labelType: "sprite" },
};
