export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function lerp(start, end, t, easingFn = null) {
  const progress = easingFn ? easingFn(t) : t;
  return start + (end - start) * progress;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Darkens/desaturates a hex color toward black by `factor` (1 = untouched,
// 0 = black). Used for focus-mode dimming instead of a flat opacity drop,
// since opacity alone doesn't read against additive-blended glow.
export function dimColor(hex, factor) {
  if (!hex || factor >= 1) return hex;
  const [r, g, b] = hexToRgb(hex);
  const f = Math.max(0, Math.min(1, factor));
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
}

export function lerpColor(a, b, t) {
  if (!a || !b) return b ?? a;

  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);

  const r = Math.min(
    255,
    Math.max(0, Math.round(lerp(ar, br, t, easeOutBack))),
  );
  const g = Math.min(
    255,
    Math.max(0, Math.round(lerp(ag, bg, t, easeOutBack))),
  );
  const bl = Math.min(
    255,
    Math.max(0, Math.round(lerp(ab, bb, t, easeOutBack))),
  );

  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}
