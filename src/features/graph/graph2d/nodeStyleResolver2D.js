import { TIER_PRESETS, CORE_TOKENS } from "../utils/graphStyleTokens";

const styleCache = new Map();

export function resolveNode2D(node, scale, display = {}) {
  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];
  const radius =
    2 * tier.multiplier * (node.sizeMultiplier || 1) * (display.nodeSize ?? 1);
  const color = node.color || "#ffffff";
  const ringColor = node.ringColor || color;
  const labelPosition = node.labelPosition || "below";
  const textYOffset =
    labelPosition === "inside"
      ? 0
      : radius + (8 / scale) * tier.multiplier * 0.4;

  let s = styleCache.get(node.id);
  if (!s) {
    s = {};
    styleCache.set(node.id, s);
  }

  s.radius = radius;
  s.shape = node.shape || "circle";
  s.color = color;
  s.label = node.label || "";
  s.labelType = node.labelType || "sprite";
  s.glowRadius = radius * (node.glowMultiplier || 1) * (display.glowSize ?? 1);
  s.glowInner = color;
  s.glowOpacity = display.glowOpacity ?? 0.6;
  s.ringRadius =
    radius * (node.ringMultiplier || 1.4) * (display.ringSize ?? 1);
  s.ringColor = ringColor;
  s.ringOpacity = display.ringOpacity ?? 0.5;
  s.ringThickness = display.ringThickness ?? 1;
  s.font = `500 ${(8 / scale) * tier.multiplier}px ${CORE_TOKENS.fontFamily}`;
  s.textColor = CORE_TOKENS.textStyle;
  s.textAlign = "center";
  s.textBaseline = labelPosition === "inside" ? "middle" : "top";
  s.textYOffset = textYOffset;
  s.visibilityThreshold = tier.visibilityThreshold;
  s.labelPosition = labelPosition;

  return s;
}

export function clearStyleCache2D(nodeId) {
  if (nodeId !== undefined) styleCache.delete(nodeId);
  else styleCache.clear();
}
