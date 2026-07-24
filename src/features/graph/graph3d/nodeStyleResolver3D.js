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

export function resolveNode3D(node, display = {}) {
  const isAction = node.nodeType === NodeType.ACTION;
  const styles = isAction
    ? {
        ...ACTION_STYLE,
        shape: node.shape || ACTION_STYLE.shape,
        color: node.color || ACTION_STYLE.color,
      }
    : applyNodeStyles(node);

  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];
  // NOTE: unlike the 2D resolver (canvas pixels, where nodeSize=8 is a
  // reasonable on-screen radius), this radius is a Three.js world-space
  // unit. Using the same nodeSize directly here (previously `2 * ...`)
  // produced ~50-100 unit spheres — huge overlapping cores plus equally
  // huge additive-blended glow sprites, which washed the whole 3D view
  // out to white and made it unnavigable. Scaled down to keep spheres in
  // a sane ~1-8 unit range.
  const radius =
    0.15 * tier.multiplier * styles.sizeMultiplier * (display.nodeSize ?? 1);
  const labelPosition = styles.labelPosition || "below";

  let s = styleCache.get(node.id);
  if (!s) {
    s = {};
    styleCache.set(node.id, s);
  }

  const targetColor = styles.color;
  // Increased to 0.12 to match the snappy feedback of the overshoot
  s.color = lerpColor(s.color || targetColor, targetColor, 0.12);

  // Focus mode: nodes outside the active neighborhood recede instead of
  // competing for attention with the expanded node. Smoothed rather than
  // snapped so hover/select focus reads as a fade, not a jump cut.
  const targetFocus = node.dimmed ? 0 : 1;
  s.focus = lerp(s.focus ?? targetFocus, targetFocus, 0.15);
  const dimFactor = lerp(0.22, 1, s.focus);

  s.id = node.id;
  s.radius = radius;
  s.shape = styles.shape;
  s.label = node.label || "";
  s.labelType = styles.labelType;
  s.glowRadius =
    radius * (isAction ? 1.5 : tier.glowMultiplier) * (display.glowSize ?? 1);
  s.glowOpacity =
    (display.glowOpacity ?? CORE_TOKENS.glowOpacity3D) * dimFactor;
  s.ringRadius = styles.ringColor
    ? 0.5 * radius * styles.ringMultiplier * (display.ringSize ?? 1)
    : 0;
  s.ringOpacity = styles.ringColor
    ? (display.ringOpacity ?? CORE_TOKENS.ringOpacity3D) * dimFactor
    : 0;
  s.ringThickness = display.ringThickness ? 10 * display.ringThickness : 1;
  s.ringColor = styles.ringColor ?? s.color;
  s.textHeight = 8 * tier.fontScale;
  s.textOffset = labelPosition === "inside" ? 0 : 1.5 + radius * 0.1;
  s.labelPosition = labelPosition;

  s.coreColor = dimColor(s.color, lerp(0.3, 1, s.focus));
  s.textColor = dimColor(CORE_TOKENS.textStyle, lerp(0.45, 1, s.focus));

  return s;
}

export function clearStyleCache(nodeId) {
  if (nodeId !== undefined) styleCache.delete(nodeId);
  else styleCache.clear();
}
