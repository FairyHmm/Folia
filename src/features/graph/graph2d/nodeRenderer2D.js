function labelAlpha(visibilityThreshold, scale) {
  if (scale >= visibilityThreshold) return 1;
  if (scale < visibilityThreshold * 0.4) return 0;
  return (scale - visibilityThreshold * 0.4) / (visibilityThreshold * 0.6);
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

export function renderNode2D(node, ctx, scale, showLabels, style) {
  if (node.x == null || node.y == null) return;
  const { x, y } = node;

  // 1. Glow Layer
  const glow = ctx.createRadialGradient(
    x,
    y,
    style.radius * 0.4,
    x,
    y,
    style.glowRadius,
  );
  glow.addColorStop(0, style.glowInner);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.arc(x, y, style.glowRadius, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // 2. Structural Ring Layer
  ctx.beginPath();
  ctx.arc(x, y, style.radius * 1.4, 0, Math.PI * 2);
  ctx.strokeStyle = style.ringColor;
  ctx.stroke();

  // 3. Core Geometric Fill
  renderShape2D(ctx, style.shape, x, y, style.radius);
  ctx.fillStyle = style.color;
  ctx.fill();

  // 4. Typography Layout Layer
  if (!showLabels) return;
  const alpha = labelAlpha(style.visibilityThreshold, scale);
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = style.font;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = style.textColor;
  ctx.fillText(
    style.label,
    x,
    y + style.radius + (8 / scale) * style.radius * 0.4,
  );
  ctx.restore();
}
