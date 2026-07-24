import { memo, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import ForceGraph3D from "react-force-graph-3d";
import { graphConfigStore } from "../store/graphConfigStore";
import { resolveNode3D } from "./nodeStyleResolver3D";
import { renderNode3D } from "./nodeRenderer3D";
import { CORE_TOKENS } from "../utils/graphStyleTokens";

const STAR_COUNT = 1400;
const STAR_FIELD_RADIUS = 900;

function buildStarfield() {
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    // Distribute on a spherical shell well outside the graph's working
    // volume so stars read as distant background, not scene geometry.
    const radius = STAR_FIELD_RADIUS * (0.6 + Math.random() * 0.4);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    sizes[i] = Math.random() * 1.6 + 0.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: "#c9d4f0",
    size: 1.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.userData.ignoreRaycast = true;
  points.raycast = () => {};
  return points;
}

const Graph3D = memo(function Graph3DWrapper({
  graphRef,
  commonProps,
  onEngineTick,
  onLinkColor,
  onNodeHover,
  onNodeClick,
}) {
  const fgInternalRef = useRef(null);
  const displayRef = useRef(graphConfigStore.getState().display);

  useEffect(() => {
    const unsub = graphConfigStore.subscribe((state) => {
      displayRef.current = state.display;

      // IMPORTANT: force graph refresh so nodeThreeObject re-evaluates
      fgInternalRef.current?.refresh?.();
    });

    return unsub;
  }, []);

  const setRefs = useCallback(
    (instance) => {
      fgInternalRef.current = instance;
      if (typeof graphRef === "function") graphRef(instance);
      else if (graphRef) graphRef.current = instance;

      // Give the void some depth: a starfield backdrop plus exponential
      // fog. Canvas clear stays transparent (layout-root supplies the
      // real background via --mantine-color-body), so fog must match
      // that exact value or distant stars fade to a mismatched color
      // instead of dissolving into the page.
      const scene = instance?.scene?.();
      if (scene && !scene.userData.hasSpaceDressing) {
        scene.add(buildStarfield());
        const bodyColor = getComputedStyle(document.body)
          .getPropertyValue("--mantine-color-body")
          .trim();
        scene.fog = new THREE.FogExp2(
          bodyColor || CORE_TOKENS.spaceBg,
          0.0022,
        );
        scene.userData.hasSpaceDressing = true;
      }
    },
    [graphRef],
  );

  // ❗ NO useCallback (must stay fresh)
  const nodeThreeObject = (node) => {
    const style = resolveNode3D(node, displayRef.current);
    return renderNode3D(style);
  };

  return (
    <ForceGraph3D
      {...commonProps}
      ref={setRefs}
      onEngineTick={onEngineTick}
      showNavInfo={false}
      backgroundColor="#0000"
      linkColor={onLinkColor}
      linkOpacity={1}
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={false}
      onNodeHover={onNodeHover}
      onNodeClick={onNodeClick}
    />
  );
});

export default Graph3D;
