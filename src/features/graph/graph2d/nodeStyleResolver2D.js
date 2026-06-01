import { TIER_PRESETS, CORE_TOKENS } from "../utils/graphStyleTokens";

export function resolveNode2D(node, scale) {
  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];
  const radius = 2 * tier.multiplier * (node.sizeMultiplier || 1);

  const color = node.color || "#ffffff";
  const ringColor = node.ringColor || color;
  const labelPosition = node.labelPosition || "below";

  let textBaseline = "top";
  let textAlign = "center";
  let textYOffset = radius + (8 / scale) * radius * 0.4;

  if (labelPosition === "inside") {
    textBaseline = "middle";
    textAlign = "center";
    textYOffset = 0;
  }

  return {
    radius,
    shape: node.shape || "circle",
    color,
    label: node.label || "",
    labelPosition,
    labelType: node.labelType || "sprite",

    glowRadius: radius * (node.glowMultiplier || 1),
    glowInner: `${color}${CORE_TOKENS.glowInnerAlpha}`,

    ringRadius: radius * (node.ringMultiplier || 1.4),
    ringColor: `${ringColor}${CORE_TOKENS.ringAlpha}`,

    textColor: CORE_TOKENS.textStyle,
    font: `500 ${(8 / scale) * tier.multiplier}px ${CORE_TOKENS.fontFamily}`,
    visibilityThreshold: tier.visibilityThreshold,

    textBaseline,
    textAlign,
    textYOffset,
  };
}
