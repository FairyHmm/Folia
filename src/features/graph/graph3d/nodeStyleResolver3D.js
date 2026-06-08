import { NodeType } from "../../../shared/utils/cvConstants";
import { TIER_PRESETS, CORE_TOKENS } from "../utils/graphStyleTokens";
import { applyNodeStyles } from "../utils/styleApplicator";

const styleCache = new Map();

const ACTION_STYLE = {
  shape:          "circle",
  color:          "#94a3b8",
  sizeMultiplier: 0.6,
  ringColor:      null,
  ringMultiplier: 1.4,
  labelPosition:  "below",
  labelType:      "sprite",
};

export function resolveNode3D(node, display = {}) {
  const isAction = node.nodeType === NodeType.ACTION;
  const styles = isAction ? { ...ACTION_STYLE, shape: node.shape || ACTION_STYLE.shape, color: node.color || ACTION_STYLE.color } : applyNodeStyles(node);
  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];
  const radius = 2 * tier.multiplier * styles.sizeMultiplier * (display.nodeSize ?? 1);
  const labelPosition = styles.labelPosition || "below";

  let s = styleCache.get(node.id);
  if (!s) { s = {}; styleCache.set(node.id, s); }

  s.id            = node.id;
  s.radius        = radius;
  s.shape         = styles.shape;
  s.color         = styles.color;
  s.label         = node.label || "";
  s.labelType     = styles.labelType;
  s.glowRadius    = radius * (isAction ? 1.5 : tier.glowMultiplier) * (display.glowSize ?? 1);
  s.glowOpacity   = display.glowOpacity ?? CORE_TOKENS.glowOpacity3D;
  s.ringRadius    = styles.ringColor ? 0.5 * radius * styles.ringMultiplier * (display.ringSize ?? 1) : 0;
  s.ringOpacity   = styles.ringColor ? (display.ringOpacity ?? CORE_TOKENS.ringOpacity3D) : 0;
  s.ringThickness = display.ringThickness ? 10 * display.ringThickness : 1;
  s.ringColor     = styles.ringColor ?? styles.color;
  s.textColor     = CORE_TOKENS.textStyle;
  s.textHeight    = 8 * tier.fontScale;
  s.textOffset    = labelPosition === "inside" ? 0 : 1.5 + radius * 0.1;
  s.labelPosition = labelPosition;

  return s;
}

export function clearStyleCache(nodeId) {
  if (nodeId !== undefined) styleCache.delete(nodeId);
  else styleCache.clear();
}
