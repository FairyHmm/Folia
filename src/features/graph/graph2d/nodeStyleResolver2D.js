import { NodeType } from "../../../shared/utils/cvConstants";
import { TIER_PRESETS, CORE_TOKENS } from "../utils/graphStyleTokens";
import { applyNodeStyles } from "../utils/styleApplicator";
import { lerp, lerpColor, dimColor } from "../utils/animationUtils";

const styleCache = new Map();

const ACTION_STYLE = {
  shape: "circle",
  color: "#94a3b8",
  sizeMultiplier: 0.6,
  ringColor: null,
  ringMultiplier: 1.4,
  labelPosition: "below",
  labelType: "sprite",
};

export function resolveNode2D(node, scale, display = {}) {
  const isAction = node.nodeType === NodeType.ACTION;
  const styles = isAction
    ? {
        ...ACTION_STYLE,
        shape: node.shape || ACTION_STYLE.shape,
        color: node.color || ACTION_STYLE.color,
      }
    : applyNodeStyles(node);

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

  const targetColor = styles.color;
  // Increased to 0.12 to match the snappy feedback of the overshoot
  s.color = lerpColor(s.color || targetColor, targetColor, 0.12);
  s.glowInner = s.color;

  // Smoothed 0→1 focus factor (1 = fully normal, 0 = fully dimmed) instead
  // of snapping instantly on node.dimmed — makes hover/select focus read
  // as a fade rather than a jump cut. Persisted per-node in styleCache so
  // it keeps easing across repaints regardless of how often this runs.
  const targetFocus = node.dimmed ? 0 : 1;
  s.focus = lerp(s.focus ?? targetFocus, targetFocus, 0.15);
  const dimFactor = lerp(0.22, 1, s.focus);

  s.radius = radius;
  s.shape = styles.shape;
  s.label = node.label || "";
  s.labelType = styles.labelType;
  s.glowRadius =
    1.5 *
    radius *
    (isAction ? 1.5 : tier.glowMultiplier) *
    (display.glowSize ?? 1);
  s.glowOpacity = (display.glowOpacity ?? CORE_TOKENS.glowOpacity3D) * dimFactor;
  s.ringRadius = styles.ringColor
    ? radius * styles.ringMultiplier * (display.ringSize ?? 1)
    : 0;
  s.ringColor = styles.ringColor ?? s.color;
  s.ringOpacity = styles.ringColor
    ? (display.ringOpacity ?? CORE_TOKENS.ringOpacity3D) * dimFactor
    : 0;
  s.ringThickness = display.ringThickness ?? 1;
  s.font = `500 ${(8 / scale) * tier.multiplier}px ${CORE_TOKENS.fontFamily}`;
  s.textColor = dimColor(CORE_TOKENS.textStyle, lerp(0.45, 1, s.focus));
  s.textAlign = "center";
  s.textBaseline = labelPosition === "inside" ? "middle" : "top";
  s.textYOffset = textYOffset;
  s.visibilityThreshold = tier.visibilityThreshold;
  s.labelPosition = labelPosition;
  s.coreColor = dimColor(s.color, lerp(0.3, 1, s.focus));

  return s;
}

export function clearStyleCache2D(nodeId) {
  if (nodeId !== undefined) styleCache.delete(nodeId);
  else styleCache.clear();
}
