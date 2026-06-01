import { TIER_PRESETS, CORE_TOKENS } from "../utils/graphStyleTokens";

export function resolveNode3D(node) {
  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];
  const radius = 2 * tier.multiplier * (node.sizeMultiplier || 1);

  const color = node.color || "#ffffff";
  const ringColor = node.ringColor || color;
  const labelPosition = node.labelPosition || "below";

  let textOffset = 1.5 + radius * 0.1;
  if (labelPosition === "inside") textOffset = 0;

  return {
    radius,
    shape: node.shape || "circle",
    color,
    ringColor,
    tier: node.tier,
    label: node.label || "",
    id: node.id,
    labelPosition,
    labelType: node.labelType || "sprite",

    textColor: CORE_TOKENS.textStyle,
    textHeight: 8 * tier.fontScale,
    textOffset,

    ringRadius: radius * (node.ringMultiplier || 1.4),
    ringOpacity: CORE_TOKENS.ringOpacity3D,

    glowRadius: radius * (node.glowMultiplier || 1),
    glowOpacity: CORE_TOKENS.glowOpacity3D,
    glowDepthWrite: false,
    glowDepthTest: true,
  };
}
