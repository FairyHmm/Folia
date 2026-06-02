import { TIER_PRESETS, CORE_TOKENS } from "../utils/graphStyleTokens";

function buildRadius(node, tier, display) {
  return (
    2 *
    tier.multiplier *
    (node.sizeMultiplier || 1) *
    (display.nodeSize ?? 1)
  );
}

export function resolveNode3D(node, display = {}) {
  const tier = TIER_PRESETS[node.tier] || TIER_PRESETS[4];

  const radius = buildRadius(node, tier, display);

  const color = node.color || "#ffffff";
  const ringColor = node.ringColor || color;

  const labelPosition = node.labelPosition || "below";

  return {
    // ─────────────────────────────
    // CORE
    radius,
    shape: node.shape || "circle",
    color,
    id: node.id,
    label: node.label || "",
    labelType: node.labelType || "sprite",

    // ─────────────────────────────
    // GLOW
    glowRadius: radius * (node.glowMultiplier || 1) * (display.glowSize ?? 1),
    glowOpacity: display.glowOpacity ?? CORE_TOKENS.glowOpacity3D,

    // ─────────────────────────────
    // RING
    ringRadius: radius * (node.ringMultiplier || 1.4) * (display.ringSize ?? 1),
    ringOpacity: display.ringOpacity ?? CORE_TOKENS.ringOpacity3D,
    ringThickness: display.ringThickness ?? 1,
    ringColor,

    // ─────────────────────────────
    // TEXT
    textColor: CORE_TOKENS.textStyle,
    textHeight: 8 * tier.fontScale,
    textOffset: labelPosition === "inside" ? 0 : 1.5 + radius * 0.1,

    // ─────────────────────────────
    // LABEL META
    labelPosition,
  };
}
