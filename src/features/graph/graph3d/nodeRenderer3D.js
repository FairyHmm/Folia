import * as THREE from "three";
import SpriteText from "three-spritetext";

const meshGroupCache = new Map();

const GEOMETRY_FACTORIES = {
  circle: (r) => new THREE.SphereGeometry(r, 24, 24),
  square: (r) => new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 1.4),
  triangle: (r) => new THREE.ConeGeometry(r, r * 2, 4),
};

function createRingTexture(color, isGlow = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");
  const cx = 64;
  const cy = 64;

  if (isGlow) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);

    g.addColorStop(0.0, `${color}AA`);
    g.addColorStop(0.2, `${color}66`);
    g.addColorStop(0.5, `${color}22`);
    g.addColorStop(1.0, "rgba(0,0,0,0)");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, 58, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

export function renderNode3D(style) {
  const cacheKey = `${style.shape}_${style.color}_${style.tier}_${style.label}`;

  if (meshGroupCache.has(cacheKey)) {
    return meshGroupCache.get(cacheKey).clone();
  }

  const nodeGroup = new THREE.Group();
  const threeColor = new THREE.Color(style.color);

  // GLOW
  const glowTexture = createRingTexture(style.color, true);

  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: style.glowOpacity,
    depthTest: false,
    depthWrite: false,
  });

  const glowSprite = new THREE.Sprite(glowMaterial);

  glowSprite.scale.set(style.glowRadius * 3.4, style.glowRadius * 3.4, 1);

  glowSprite.renderOrder = 0;

  // Remove from interaction system
  glowSprite.raycast = () => {};
  glowSprite.userData = { ignoreRaycast: true };

  nodeGroup.add(glowSprite);

  // RING
  const ringTexture = createRingTexture(style.color, false);

  const ringMaterial = new THREE.SpriteMaterial({
    map: ringTexture,
    transparent: true,
    opacity: style.ringOpacity,
    depthWrite: false,
  });

  const ringSprite = new THREE.Sprite(ringMaterial);

  ringSprite.scale.set(style.ringRadius * 2, style.ringRadius * 2, 1);

  ringSprite.renderOrder = 1;

  nodeGroup.add(ringSprite);

  // CORE
  const geometryFactory =
    GEOMETRY_FACTORIES[style.shape] || GEOMETRY_FACTORIES.circle;

  const coreMesh = new THREE.Mesh(
    geometryFactory(style.radius),
    new THREE.MeshStandardMaterial({
      color: threeColor,
      roughness: 0.65,
      metalness: 0.0,
    }),
  );

  coreMesh.renderOrder = 2;

  nodeGroup.add(coreMesh);

  // LABEL
  if (style.label) {
    const label = new SpriteText(style.label);

    label.color = style.textColor;
    label.textHeight = style.textHeight;
    label.center.y = style.textOffset;

    // IMPORTANT: rendering only, no interaction
    label.raycast = () => {};
    label.userData = { ignoreRaycast: true };

    label.renderOrder = 3;

    nodeGroup.add(label);
  }

  meshGroupCache.set(cacheKey, nodeGroup);

  return nodeGroup;
}
