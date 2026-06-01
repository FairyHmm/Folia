import {
  COLORS,
  SHAPES,
  SIZE_MULTIPLIERS,
  GLOW_MULTIPLIERS,
  RING_MULTIPLIERS,
} from "./graphStyleTokens";

const DEMO_STYLES = {
  shapes: SHAPES,
  colors: COLORS,
  sizeMultipliers: SIZE_MULTIPLIERS,
  glowMultipliers: GLOW_MULTIPLIERS,
  ringMultipliers: RING_MULTIPLIERS,
};

const random = (items) => items[Math.floor(Math.random() * items.length)];

export function applyNodeStyles(node, styles = DEMO_STYLES) {
  const shape = random(Object.keys(styles.shapes));
  const shapeConfig = styles.shapes[shape];

  return {
    shape,
    color: random(styles.colors),
    ringColor: random(styles.colors),
    sizeMultiplier: random(styles.sizeMultipliers),
    glowMultiplier: random(styles.glowMultipliers),
    ringMultiplier: random(styles.ringMultipliers),
    ...shapeConfig,
  };
}
