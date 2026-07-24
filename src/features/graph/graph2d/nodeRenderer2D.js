const glowGradientKeys = new Map();
const glowGradients = new Map();

function labelAlpha(threshold, scale) {
  if (scale >= threshold) return 1;
  if (scale < threshold * 0.4) return 0;
  return (scale - threshold * 0.4) / (threshold * 0.6);
}

function renderShape2D(ctx, shape, x, y, r) {
  ctx.beginPath();

  if (shape === "square") {
    ctx.rect(x - r, y - r, r * 2, r * 2);
  } else if (shape === "triangle") {
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.lineTo(x - r, y + r);
    ctx.closePath();
  } else {
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
}

function getGlowGradient(ctx, node, style) {
  const key = `${style.glowInner}_${style.radius.toFixed(
    1,
  )}_${style.glowRadius.toFixed(1)}`;

  if (glowGradientKeys.get(node.id) !== key) {
    const g = ctx.createRadialGradient(
      0,
      0,
      style.radius * 0.4,
      0,
      0,
      style.glowRadius,
    );

    g.addColorStop(0, style.glowInner);
    g.addColorStop(1, "rgba(0,0,0,0)");

    glowGradients.set(node.id, g);
    glowGradientKeys.set(node.id, key);
  }

  return glowGradients.get(node.id);
}

export function renderNode2D(node, ctx, scale, showLabels, style) {
  if (node.x == null || node.y == null) return;

  const { x, y } = node;

  // ─────────────────────────────
  // 1. GLOW
  if (style.glowOpacity > 0) {
    const glow = getGlowGradient(ctx, node, style);

    ctx.save();
    ctx.translate(x, y);

    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = style.glowOpacity;

    ctx.beginPath();
    ctx.arc(0, 0, style.glowRadius, 0, Math.PI * 2);

    ctx.fillStyle = glow;
    ctx.fill();

    ctx.restore();
  }

  // ─────────────────────────────
  // 2. RING
  if (style.ringOpacity > 0) {
    ctx.save();

    ctx.globalAlpha = style.ringOpacity;
    ctx.lineWidth = style.ringThickness;
    ctx.strokeStyle = style.ringColor;

    ctx.beginPath();
    ctx.arc(x, y, style.ringRadius, 0, Math.PI * 2);

    ctx.stroke();
    ctx.restore();
  }

  // ─────────────────────────────
  // 3. CORE
  ctx.save();

  ctx.fillStyle = style.coreColor ?? style.color;
  renderShape2D(ctx, style.shape, x, y, style.radius);
  ctx.fill();

  ctx.restore();

  // ─────────────────────────────
  // 4. LABEL
  if (!showLabels || style.labelType === "html") return;

  const alpha = labelAlpha(style.visibilityThreshold, scale);
  if (alpha <= 0) return;

  const fontMatch = style.font.match(/^(\d+(?:\.\d+)?)px\s+(.+)$/);

  const baseFontSize = fontMatch ? parseFloat(fontMatch[1]) : 12;

  const fontFamily = fontMatch ? fontMatch[2] : "sans-serif";

  // Label size primarily follows node size.
  // Alpha also acts as a zoom-based size multiplier.
  const fontSize = Math.max(baseFontSize, style.radius * 0.8) * alpha;

  ctx.save();

  ctx.globalAlpha = alpha;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = style.textAlign;
  ctx.textBaseline = style.textBaseline;

  const textX = x;
  const textY = y + style.textYOffset;

  // Black outline
  ctx.lineWidth = Math.max(2, fontSize * 0.12);
  ctx.strokeStyle = "black";
  ctx.lineJoin = "round";

  ctx.strokeText(style.label, textX, textY);

  // Fill
  ctx.fillStyle = style.textColor;
  ctx.fillText(style.label, textX, textY);

  ctx.restore();
}

export function clearGradientCache(nodeId) {
  if (nodeId !== undefined) {
    glowGradientKeys.delete(nodeId);
    glowGradients.delete(nodeId);
  } else {
    glowGradientKeys.clear();
    glowGradients.clear();
  }
}
