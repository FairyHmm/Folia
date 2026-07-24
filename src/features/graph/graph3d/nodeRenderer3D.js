import * as THREE from "three";
import SpriteText from "three-spritetext";

const geometryCache = new Map();
const textureCache = new Map();
const nodeObjectCache = new Map();

/* ─────────────────────────────
   GEOMETRY
───────────────────────────── */

const GEOMETRY_FACTORIES = {
  circle: (r) => new THREE.SphereGeometry(r, 24, 24),
  square: (r) => new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 1.4),
  triangle: (r) => new THREE.ConeGeometry(r, r * 2, 4),
  // Action/content nodes read as UI chrome (pills, cards) when built from
  // flat primitives — swapped for faceted crystal forms so they stay in
  // the constellation metaphor (gems/debris) while still differentiating
  // by type via facet count.
  pill: (r) => new THREE.OctahedronGeometry(r, 0),
  "card-artifact": (r) => new THREE.IcosahedronGeometry(r, 0),
  "card-resource": (r) => new THREE.DodecahedronGeometry(r, 0),
  note: (r) => new THREE.TetrahedronGeometry(r * 1.2, 0),
};

function getGeometry(shape, radius) {
  let byRadius = geometryCache.get(shape);
  if (!byRadius) {
    byRadius = new Map();
    geometryCache.set(shape, byRadius);
  }
  const r = Math.round(radius * 100) / 100;
  if (!byRadius.has(r)) {
    const factory = GEOMETRY_FACTORIES[shape] || GEOMETRY_FACTORIES.circle;
    byRadius.set(r, factory(r));
  }
  return byRadius.get(r);
}

/* ─────────────────────────────
   TEXTURES
───────────────────────────── */

function createRingTexture(color, thickness, isGlow = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const cx = 64,
    cy = 64;

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
   MUTATE EXISTING GROUP
───────────────────────────── */

function updateNode3D(group, style) {
  const { core, glow, ring, label } = group.userData.parts;
  const ud = group.userData;

  // Core — geometry
  if (ud.shape !== style.shape || ud.radius !== style.radius) {
    core.geometry = getGeometry(style.shape, style.radius);
    ud.shape = style.shape;
    ud.radius = style.radius;
  }
  // Core — color
  if (ud.coreColor !== style.coreColor) {
    core.material.color.set(style.coreColor);
    ud.coreColor = style.coreColor;
  }

  // Glow — texture
  if (
    ud.glowColor !== style.color ||
    ud.glowThickness !== style.ringThickness
  ) {
    glow.material.map = getTexture(style.color, style.ringThickness, true);
    glow.material.needsUpdate = true;
    ud.glowColor = style.color;
    ud.glowThickness = style.ringThickness;
  }
  // Glow — opacity
  if (ud.glowOpacity !== style.glowOpacity) {
    glow.material.opacity = style.glowOpacity;
    ud.glowOpacity = style.glowOpacity;
  }
  // Glow — scale
  const newGlowScale = style.glowRadius * 2;
  if (ud.glowScale !== newGlowScale) {
    glow.scale.set(newGlowScale, newGlowScale, 1);
    ud.glowScale = newGlowScale;
  }

  // Ring — texture
  if (
    ud.ringColor !== style.ringColor ||
    ud.ringThickness !== style.ringThickness
  ) {
    ring.material.map = getTexture(style.ringColor, style.ringThickness, false);
    ring.material.needsUpdate = true;
    ud.ringColor = style.ringColor;
    ud.ringThickness = style.ringThickness;
  }
  // Ring — opacity
  if (ud.ringOpacity !== style.ringOpacity) {
    ring.material.opacity = style.ringOpacity;
    ud.ringOpacity = style.ringOpacity;
  }
  // Ring — scale
  const newRingScale = style.ringRadius * 2.5;
  if (ud.ringScale !== newRingScale) {
    ring.scale.set(newRingScale, newRingScale, 1);
    ud.ringScale = newRingScale;
  }

  // Label
  if (label) {
    if (ud.textColor !== style.textColor) {
      label.color = style.textColor;
      ud.textColor = style.textColor;
    }
    if (ud.textHeight !== style.textHeight) {
      label.textHeight = style.textHeight;
      ud.textHeight = style.textHeight;
    }
    if (ud.textOffset !== style.textOffset) {
      label.center.y = style.textOffset;
      ud.textOffset = style.textOffset;
    }
  }
}

/* ─────────────────────────────
   BUILD NEW GROUP
───────────────────────────── */

function buildNode3D(style) {
  const group = new THREE.Group();

  // Glow
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getTexture(style.color, style.ringThickness, true),
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: style.glowOpacity,
      depthTest: false,
      depthWrite: false,
    }),
  );
  glow.scale.set(style.glowRadius * 2, style.glowRadius * 2, 1);
  disableInteraction(glow);

  // Ring
  const ring = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getTexture(style.ringColor, style.ringThickness, false),
      transparent: true,
      opacity: style.ringOpacity,
      depthWrite: false,
    }),
  );
  ring.scale.set(style.ringRadius * 2.5, style.ringRadius * 2.5, 1);
  disableInteraction(ring);

  // Label
  let label = null;
  if (style.label && style.labelType !== "html") {
    label = new SpriteText(style.label);
    label.color = style.textColor;
    label.textHeight = style.textHeight;
    label.center.y = style.textOffset;
    disableInteraction(label);
  }

  // Core
  const core = new THREE.Mesh(
    getGeometry(style.shape, style.radius),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(style.coreColor) }),
  );
  core.renderOrder = 2;

  // Assembly
  const decorations = new THREE.Group();
  disableInteraction(decorations);
  decorations.add(glow);
  decorations.add(ring);
  if (label) decorations.add(label);
  group.add(decorations);
  group.add(core);

  // Seed userData with all tracked values
  group.userData = {
    nodeId: style.id,
    parts: { core, glow, ring, label },
    shape: style.shape,
    radius: style.radius,
    coreColor: style.coreColor,
    glowColor: style.color,
    glowThickness: style.ringThickness,
    glowOpacity: style.glowOpacity,
    glowScale: style.glowRadius * 2,
    ringColor: style.ringColor,
    ringThickness: style.ringThickness,
    ringOpacity: style.ringOpacity,
    ringScale: style.ringRadius * 2.5,
    textColor: style.textColor,
    textHeight: style.textHeight,
    textOffset: style.textOffset,
  };

  return group;
}

/* ─────────────────────────────
   MAIN RENDER (cache + mutate)
───────────────────────────── */

export function renderNode3D(style) {
  const cached = nodeObjectCache.get(style.id);

  if (cached) {
    updateNode3D(cached, style);
    return cached;
  }

  const group = buildNode3D(style);
  nodeObjectCache.set(style.id, group);
  return group;
}

/* ─────────────────────────────
   CACHE CLEANUP
───────────────────────────── */

export function clearNodeCache(nodeId) {
  if (nodeId !== undefined) nodeObjectCache.delete(nodeId);
  else nodeObjectCache.clear();
}
