import { TIER_PRESETS, CORE_TOKENS } from "../utils/graphStyleTokens";
import { applyNodeStyles } from "../utils/styleApplicator";

const styleCache = new Map();

export function resolveNode2D(node, scale, display = {}) {
  const styles = applyNodeStyles(node);
  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];
  const radius =
    tier.multiplier * styles.sizeMultiplier * (display.nodeSize ?? 1);
  const labelPosition = styles.labelPosition || "below";
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
  s.shape = styles.shape;
  s.color = styles.color;
  s.label = node.label || "";
  s.labelType = styles.labelType;
  s.glowRadius = 1.5 * radius * tier.glowMultiplier * (display.glowSize ?? 1);
  s.glowInner = styles.color;
  s.glowOpacity = display.glowOpacity ?? CORE_TOKENS.glowOpacity3D;
  s.ringRadius = styles.ringColor
    ? radius * styles.ringMultiplier * (display.ringSize ?? 1)
    : 0;
  s.ringColor = styles.ringColor ?? styles.color;
  s.ringOpacity = styles.ringColor
    ? (display.ringOpacity ?? CORE_TOKENS.ringOpacity3D)
    : 0;
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
