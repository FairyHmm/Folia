import {
  TIER_PRESETS,
  CORE_TOKENS,
  RANDOM_SHAPES,
  RANDOM_COLORS,
} from "../utils/graphStyleTokens";

import { STYLES_DEFAULTS } from "./graphStyles3D";

export function resolveNode3D(node) {
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

    tier: node.tier,
    label: node.label || "",

    textColor: CORE_TOKENS.textStyle,
    textHeight: 8 * tier.fontScale,
    textOffset: 1.5 + radius * 0.1,

    ringRadius: radius * STYLES_DEFAULTS.ringScale,
    ringOpacity: STYLES_DEFAULTS.ringOpacity,

    glowRadius: radius * STYLES_DEFAULTS.glowScale,
    glowOpacity: STYLES_DEFAULTS.glowOpacity,
    glowDepthWrite: STYLES_DEFAULTS.glowDepthWrite,
    glowDepthTest: STYLES_DEFAULTS.glowDepthTest,
  };
}
