import { TIER_PRESETS, CORE_TOKENS } from "../utils/graphStyleTokens";

const styleCache = new Map(); // reuse style objects per node

export function resolveNode3D(node, display = {}) {
  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];
  const radius =
    2 * tier.multiplier * (node.sizeMultiplier || 1) * (display.nodeSize ?? 1);
  const color = node.color || "#ffffff";
  const ringColor = node.ringColor || color;
  const labelPosition = node.labelPosition || "below";

  let s = styleCache.get(node.id);
  if (!s) {
    s = {};
    styleCache.set(node.id, s);
  }

  s.id = node.id;
  s.radius = radius;
  s.shape = node.shape || "circle";
  s.color = color;
  s.label = node.label || "";
  s.labelType = node.labelType || "sprite";
  s.glowRadius = radius * (node.glowMultiplier || 1) * (display.glowSize ?? 1);
  s.glowOpacity = display.glowOpacity ?? CORE_TOKENS.glowOpacity3D;
  s.ringRadius =
    radius * (node.ringMultiplier || 1.4) * (display.ringSize ?? 1);
  s.ringOpacity = display.ringOpacity ?? CORE_TOKENS.ringOpacity3D;
  s.ringThickness = display.ringThickness ?? 1;
  s.ringColor = ringColor;
  s.textColor = CORE_TOKENS.textStyle;
  s.textHeight = 8 * tier.fontScale;
  s.textOffset = labelPosition === "inside" ? 0 : 1.5 + radius * 0.1;
  s.labelPosition = labelPosition;

  return s;
}

export function clearStyleCache(nodeId) {
  if (nodeId !== undefined) styleCache.delete(nodeId);
  else styleCache.clear();
}
