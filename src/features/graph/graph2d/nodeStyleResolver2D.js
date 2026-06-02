import { TIER_PRESETS, CORE_TOKENS } from "../utils/graphStyleTokens";

function labelAlpha(threshold, scale) {
  if (scale >= threshold) return 1;
  if (scale < threshold * 0.4) return 0;
  return (scale - threshold * 0.4) / (threshold * 0.6);
}

function buildRadius(node, tier, display) {
  return (
    2 *
    tier.multiplier *
    (node.sizeMultiplier || 1) *
    (display.nodeSize ?? 1)
  );
}

export function resolveNode2D(node, scale, display = {}) {
  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];

  const radius = buildRadius(node, tier, display);

  const color = node.color || "#ffffff";
  const ringColor = node.ringColor || color;

  const labelPosition = node.labelPosition || "below";

  const textYOffset =
    labelPosition === "inside"
      ? 0
      : radius + (8 / scale) * tier.multiplier * 0.4;

  return {
    // ─────────────────────────────
    // CORE
    radius,
    shape: node.shape || "circle",
    color,
    label: node.label || "",
    labelType: node.labelType || "sprite",

    // ─────────────────────────────
    // GLOW
    glowRadius: radius * (node.glowMultiplier || 1) * (display.glowSize ?? 1),
    glowInner: color,
    glowOpacity: display.glowOpacity ?? 0.6,

    // ─────────────────────────────
    // RING
    ringRadius: radius * (node.ringMultiplier || 1.4) * (display.ringSize ?? 1),
    ringColor,
    ringOpacity: display.ringOpacity ?? 0.5,
    ringThickness: display.ringThickness ?? 1,

    // ─────────────────────────────
    // TEXT
    font: `500 ${(8 / scale) * tier.multiplier}px ${CORE_TOKENS.fontFamily}`,
    textColor: CORE_TOKENS.textStyle,
    textAlign: "center",
    textBaseline: labelPosition === "inside" ? "middle" : "top",
    textYOffset,
    visibilityThreshold: tier.visibilityThreshold,

    // ─────────────────────────────
    // LABEL META
    labelPosition,
  };
}
