import {
  TIER_PRESETS,
  CORE_TOKENS,
  RANDOM_SHAPES,
  RANDOM_COLORS,
} from "../utils/graphStyleTokens";
import { STYLES_DEFAULTS } from "./graphStyles2D";

export function resolveNode2D(node, scale) {
  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];
  const radius = Math.sqrt(node.val || 1) * tier.multiplier;

  const hash = Array.from(node.id).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  const color = RANDOM_COLORS[hash % RANDOM_COLORS.length];
  const shape = RANDOM_SHAPES[hash % RANDOM_SHAPES.length];

  return {
    radius,
    shape,
    color,
    label: node.label || "",
    glowRadius: radius * STYLES_DEFAULTS.glowScale,
    glowInner: `${color}${STYLES_DEFAULTS.glowInnerAlpha}`,
    ringColor: `${color}${STYLES_DEFAULTS.ringAlpha}`,
    textColor: CORE_TOKENS.textStyle,
    font: `500 ${(8 / scale) * tier.multiplier}px ${CORE_TOKENS.fontFamily}`,
    visibilityThreshold: tier.visibilityThreshold,
  };
}
