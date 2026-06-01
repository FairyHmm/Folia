import * as THREE from "three";
import SpriteText from "three-spritetext";

const geometryCache = new Map();

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

const textureCache = new Map();

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
    g.addColorStop(1.0, `${color}00`);

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

function getTexture(color, isGlow) {
  const key = `${color}_${isGlow}`;
  if (!textureCache.has(key)) {
    textureCache.set(key, createRingTexture(color, isGlow));
  }
  return textureCache.get(key);
}

export function renderNode3D(style) {
  const nodeGroup = new THREE.Group();
  const threeColor = new THREE.Color(style.color);

  // GLOW
  const glowTexture = getTexture(style.color, true);
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: style.glowOpacity,
    depthTest: false,
    depthWrite: false,
  });

  const glowSprite = new THREE.Sprite(glowMaterial);

  glowSprite.scale.set(style.glowRadius * 2, style.glowRadius * 2, 1);

  glowSprite.renderOrder = 0;
  glowSprite.raycast = () => {};
  glowSprite.userData = { ignoreRaycast: true };

  nodeGroup.add(glowSprite);

  // RING
  const ringTexture = getTexture(style.color, false);
  const ringMaterial = new THREE.SpriteMaterial({
    map: ringTexture,
    transparent: true,
    opacity: style.ringOpacity,
    depthWrite: false,
  });

  const ringSprite = new THREE.Sprite(ringMaterial);

  ringSprite.scale.set(style.ringRadius * 2.5, style.ringRadius * 2.5, 1);
  ringSprite.renderOrder = 1;
  nodeGroup.add(ringSprite);

  // CORE
  const geometry = getGeometry(style.shape, style.radius);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: threeColor,
  });

  const coreMesh = new THREE.Mesh(geometry, coreMaterial);
  coreMesh.renderOrder = 2;

  nodeGroup.add(coreMesh);

  // LABEL
  if (style.label && style.labelType !== "html") {
    const label = new SpriteText(style.label);
    label.color = style.textColor;
    label.textHeight = style.textHeight;
    label.center.y = style.textOffset;
    label.raycast = () => {};
    label.userData = { ignoreRaycast: true };
    label.renderOrder = 3;
    nodeGroup.add(label);
  }

  nodeGroup.userData = { nodeId: style.id };

  return nodeGroup;
}
