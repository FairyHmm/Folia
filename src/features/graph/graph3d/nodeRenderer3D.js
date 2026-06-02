import * as THREE from "three";
import SpriteText from "three-spritetext";

const geometryCache = new Map();
const textureCache = new Map();

/* ─────────────────────────────
   GEOMETRY
───────────────────────────── */

const GEOMETRY_FACTORIES = {
  circle: (r) => new THREE.SphereGeometry(r, 24, 24),
  square: (r) => new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 1.4),
  triangle: (r) => new THREE.ConeGeometry(r, r * 2, 4),
};

function getGeometry(shape, radius) {
  const key = `${shape}_${radius.toFixed(2)}`;

  if (!geometryCache.has(key)) {
    const factory = GEOMETRY_FACTORIES[shape] || GEOMETRY_FACTORIES.circle;
    geometryCache.set(key, factory(radius));
  }

  return geometryCache.get(key);
}

/* ─────────────────────────────
   TEXTURES
───────────────────────────── */

function createRingTexture(color, thickness, isGlow = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");
  const cx = 64;
  const cy = 64;

  if (isGlow) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);

    g.addColorStop(0, `${color}AA`);
    g.addColorStop(1, `${color}00`);

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, 58, 0, Math.PI * 2);

    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

function getTexture(color, thickness, isGlow) {
  const key = `${color}_${thickness}_${isGlow}`;

  if (!textureCache.has(key)) {
    textureCache.set(key, createRingTexture(color, thickness, isGlow));
  }

  return textureCache.get(key);
}

/* ─────────────────────────────
   HELPERS
───────────────────────────── */

function disableInteraction(obj) {
  obj.raycast = () => {};
  obj.userData = { ignoreRaycast: true };
}

/* ─────────────────────────────
   MAIN RENDER
───────────────────────────── */

export function renderNode3D(style) {
  const group = new THREE.Group();

  const color = new THREE.Color(style.color);

  /* ─────────────────────────────
     GLOW
  ───────────────────────────── */

  const glowTexture = getTexture(style.color, style.ringThickness, true);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: style.glowOpacity,
      depthTest: false,
      depthWrite: false,
    }),
  );

  glow.scale.set(style.glowRadius * 2, style.glowRadius * 2, 1);
  disableInteraction(glow);

  /* ─────────────────────────────
     RING
  ───────────────────────────── */

  const ringTexture = getTexture(style.ringColor, style.ringThickness, false);

  const ring = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: ringTexture,
      transparent: true,
      opacity: style.ringOpacity,
      depthWrite: false,
    }),
  );

  ring.scale.set(style.ringRadius * 2.5, style.ringRadius * 2.5, 1);
  disableInteraction(ring);

  /* ─────────────────────────────
     LABEL
  ───────────────────────────── */

  let label = null;

  if (style.label && style.labelType !== "html") {
    label = new SpriteText(style.label);
    label.color = style.textColor;
    label.textHeight = style.textHeight;
    label.center.y = style.textOffset;

    disableInteraction(label);
  }

  /* ─────────────────────────────
     CORE
  ───────────────────────────── */

  const core = new THREE.Mesh(
    getGeometry(style.shape, style.radius),
    new THREE.MeshBasicMaterial({
      color,
    }),
  );

  core.renderOrder = 2;

  /* ─────────────────────────────
     ASSEMBLY
  ───────────────────────────── */

  const decorations = new THREE.Group();
  disableInteraction(decorations);

  decorations.add(glow);
  decorations.add(ring);

  if (label) decorations.add(label);

  group.add(decorations);
  group.add(core);

  group.userData = {
    nodeId: style.id,
  };

  return group;
}
