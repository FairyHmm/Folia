import { useEffect, useRef, useCallback } from "react";
import { graphConfigStore } from "../store/graphConfigStore";
import { isActionNode, isContentNode } from "../utils/graphUtils";
import { forceX, forceY, forceZ, forceCollide } from "d3-force-3d";

const SPAWN_RAMP_TICKS = 10;
const ORBIT_RADIUS = 18;

export function useGraphPhysics(instanceRef, dimension) {
  const ready = useRef(false);
  const forcesRef = useRef(graphConfigStore.getState().forces);

  // ✅ Always keep latest slider values
  useEffect(() => {
    const unsub = graphConfigStore.subscribe((state) => {
      forcesRef.current = state.forces;

      const fg = instanceRef.current;
      if (!fg?.d3Force) return;

      applyForces(fg);
      updateLinkForce(fg);
      fg.d3ReheatSimulation?.();
    });

    return unsub;
  }, [instanceRef]);

  // ----------------------------
  // FORCES (ONLY PLACE THAT TOUCHES PHYSICS)
  // ----------------------------
  const applyForces = useCallback(
    (fg) => {
      if (!fg?.d3Force) return;

      const { charge, gravity } = forcesRef.current;

      // --- SAFE CHARGE (no explosions)
      fg.d3Force("charge")?.strength((node) => {
        if (isActionNode(node.id) || isContentNode(node.id)) return 0;

        const age =
          node.spawning && node.spawnAge != null
            ? Math.min(node.spawnAge / SPAWN_RAMP_TICKS, 1)
            : 1;

        return -charge * 25 * age;
      });

      // --- CENTERING (stable)
      const g = gravity * 0.02;

      fg.d3Force("gravity", null);

      fg.d3Force("center-x", forceX(0).strength(g));
      fg.d3Force("center-y", forceY(0).strength(g));

      if (dimension === "3d") {
        fg.d3Force("center-z", forceZ(0).strength(g));
      } else {
        fg.d3Force("center-z", null);
      }

      // --- COLLISION (prevents overlaps that cause explosions)
      fg.d3Force("collide", forceCollide((n) => n.radius ?? 8).strength(0.7));
    },
    [dimension],
  );

  // ----------------------------
  // LINK FORCE (stable, no NaN risk)
  // ----------------------------
  const updateLinkForce = useCallback((fg) => {
    if (!fg?.d3Force) return;

    const link = fg.d3Force("link");
    if (!link) return;

    const { distance, linkStrength } = forcesRef.current;

    link
      .distance((l) => {
        const t = typeof l.target === "object" ? l.target : null;

        const age =
          t?.spawning && t.spawnAge != null
            ? Math.min(t.spawnAge / SPAWN_RAMP_TICKS, 1)
            : 1;

        const base = l.linkDistance ?? distance;

        return ORBIT_RADIUS + (base - ORBIT_RADIUS) * age;
      })
      .strength((l) => l.linkStrength ?? linkStrength);
  }, []);

  // ----------------------------
  // INIT
  // ----------------------------
  const onGraphReady = useCallback(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;

    applyForces(fg);
    updateLinkForce(fg);
    fg.d3ReheatSimulation?.();
  }, [applyForces, updateLinkForce]);

  const gentleReheat = useCallback(() => {
    const fg = instanceRef.current;
    const sim = fg?.d3Simulation?.();
    if (!sim) return;

    sim.alpha(Math.max(sim.alpha(), 0.25)).restart();
  }, [instanceRef]);

  // ----------------------------
  // ENGINE TICK (ONLY SAFE STATE UPDATES)
  // ----------------------------
  const onEngineTick = useRef(() => {
    const fg = instanceRef.current;
    const sim = fg?.d3Simulation?.();
    if (!sim) return;

    const nodes = sim.nodes();
    if (!nodes?.length) return;

    if (!ready.current) {
      ready.current = true;
      updateLinkForce(fg);
      return;
    }

    for (const n of nodes) {
      // ✅ HARD SAFETY: prevent NaN explosions
      n.vx = n.vx || 0;
      n.vy = n.vy || 0;
      if (dimension === "3d") n.vz = n.vz || 0;

      // ✅ spawn ramp ONLY (no physics interference)
      if (!n.spawning) continue;

      n.spawnAge = (n.spawnAge ?? 0) + 1;

      if (n.spawnAge >= SPAWN_RAMP_TICKS) {
        n.spawning = false;
      }
    }
  }).current;

  // ----------------------------
  // RESET
  // ----------------------------
  const resetReady = useCallback(() => {
    ready.current = false;
  }, []);

  return {
    onEngineTick,
    gentleReheat,
    resetReady,
    onGraphReady,
  };
}
