import { useEffect, useRef, useCallback } from "react";
import { graphConfigStore } from "../store/graphConfigStore";
import { isActionNode, isContentNode } from "../utils/graphUtils";
import {
  forceX,
  forceY,
  forceZ,
  forceCollide,
  forceManyBody,
} from "d3-force-3d";

const SPAWN_RAMP_TICKS = 8;

export function useGraphPhysics(instanceRef, dimension) {
  const charge = graphConfigStore((s) => s.forces.charge);
  const distance = graphConfigStore((s) => s.forces.distance);
  const gravity = graphConfigStore((s) => s.forces.gravity);
  const linkStrength = graphConfigStore((s) => s.forces.linkStrength);

  const ready = useRef(false);

  const applyForcesRef = useRef(null);
  const updateLinkForceRef = useRef(null);

  useEffect(() => {
    ready.current = false;
  }, [dimension]);

  // Ensure our custom forces are registered exactly once on the engine instance
  const initCustomForces = useCallback((fg) => {
    if (!fg?.d3Force) return;
    if (!fg.d3Force("menu-charge")) fg.d3Force("menu-charge", forceManyBody());
    if (!fg.d3Force("transient-collide")) fg.d3Force("transient-collide", forceCollide());
  }, []);

  const applyForces = useCallback(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;

    // Initialize custom layout structural branches if missing
    initCustomForces(fg);

    const { charge, gravity, distance } = graphConfigStore.getState().forces;
    const g = gravity / 100;
    const distanceScaleFactor = distance / 40;

    // Mutate existing properties directly instead of instantiating new objects on every frame tick
    fg.d3Force("charge")?.strength((node) =>
      isActionNode(node.id) || isContentNode(node.id)
        ? 0
        : -10 * (charge + 1) * distanceScaleFactor,
    );

    fg.d3Force("menu-charge")?.strength((node) => {
      if (!(isActionNode(node.id) || isContentNode(node.id))) return 0;
      if (node.spawning) return 0;
      return -4 * (charge + 1) * distanceScaleFactor;
    });

    fg.d3Force("transient-collide")?.radius((node) => {
      if (!(isActionNode(node.id) || isContentNode(node.id))) return 0;
      if (node.spawning) return distance * 0.05;
      return distance * 0.22;
    }).strength(0.8);

    fg.d3Force("gravity", null);
    if (dimension === "3d") {
      fg.d3Force("center-x", forceX(0).strength(g));
      fg.d3Force("center-y", forceY(0).strength(g));
      fg.d3Force("center-z", forceZ(0).strength(g));
    } else {
      fg.d3Force("center-x", forceX(0).strength(g));
      fg.d3Force("center-y", forceY(0).strength(g));
      fg.d3Force("center-z", null);
    }
  }, [dimension, instanceRef, initCustomForces]);

  applyForcesRef.current = applyForces;

  const updateLinkForce = useCallback(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;

    const linkForce = fg.d3Force("link");
    if (!linkForce) return;

    const globalDistance = graphConfigStore.getState().forces.distance;
    const globalStrength = graphConfigStore.getState().forces.linkStrength;

    linkForce
      .distance((link) => {
        const targetId = typeof link.target === "object" ? link.target.id : link.target;
        const sourceId = typeof link.source === "object" ? link.source.id : link.source;

        // CRITICAL FIX: If the link payload specifies a dynamic linkDistance, use it!
        if (link.linkDistance != null) {
          return link.linkDistance;
        }

        if (
          isActionNode(targetId) ||
          isActionNode(sourceId) ||
          isContentNode(targetId) ||
          isContentNode(sourceId)
        ) {
          return globalDistance * 0.35;
        }
        return link.linkDistance || globalDistance;
      })
      .strength((link) => {
        const targetId = typeof link.target === "object" ? link.target.id : link.target;
        const sourceId = typeof link.source === "object" ? link.source.id : link.source;

        if (
          isActionNode(targetId) ||
          isActionNode(sourceId) ||
          isContentNode(targetId) ||
          isContentNode(sourceId)
        ) {
          return 1.0;
        }
        return link.linkStrength ?? globalStrength;
      });
  }, [instanceRef]);

  updateLinkForceRef.current = updateLinkForce;

  useEffect(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;
    try {
      applyForces();
      if (ready.current) {
        const sim = fg.d3Simulation?.();
        if (sim) sim.alpha(Math.max(sim.alpha(), 0.4)).restart();
        else fg.d3ReheatSimulation?.();
      }
    } catch (e) {
      console.warn("[useGraphPhysics] force setup error", e);
    }
  }, [charge, gravity, distance, dimension, applyForces, instanceRef]);

  useEffect(() => {
    updateLinkForce();
    const fg = instanceRef.current;
    if (ready.current && fg) {
      const sim = fg.d3Simulation?.();
      if (sim) sim.alpha(Math.max(sim.alpha(), 0.4)).restart();
      else fg.d3ReheatSimulation?.();
    }
  }, [distance, linkStrength, updateLinkForce, instanceRef]);

  const gentleReheat = useCallback(() => {
    const fg = instanceRef.current;
    if (!fg?.d3ReheatSimulation) return;
    try {
      fg.d3ReheatSimulation();
    } catch (e) {
      console.warn("[useGraphPhysics] gentleReheat", e);
    }
  }, [instanceRef]);

  const onEngineTick = useRef(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;

    const liveSimulationNodes = fg.d3Simulation?.nodes() || fg.getGraphBbox?.() || [];
    if (!liveSimulationNodes.length) return;

    if (!ready.current) {
      ready.current = true;
      updateLinkForceRef.current?.();
      return;
    }

    // VELOCITY CLAMPING
    const MAX_VELOCITY = 1;
    liveSimulationNodes.forEach((node) => {
      if (!isActionNode(node.id) && !isContentNode(node.id)) {
        if (node.vx > MAX_VELOCITY) node.vx = MAX_VELOCITY;
        if (node.vx < -MAX_VELOCITY) node.vx = -MAX_VELOCITY;
        if (node.vy > MAX_VELOCITY) node.vy = MAX_VELOCITY;
        if (node.vy < -MAX_VELOCITY) node.vy = -MAX_VELOCITY;
      }
    });

    // SPAWN RAMP CALCULATION
    liveSimulationNodes.forEach((node) => {
      if (!node.spawning) return;
      node.spawnAge = (node.spawnAge ?? 0) + 1;
      if (node.spawnAge >= SPAWN_RAMP_TICKS) {
        node.spawning = false;
      }
    });

    applyForcesRef.current?.();
  }).current;

  const resetReady = useCallback(() => {
    ready.current = false;
  }, []);

  return { onEngineTick, gentleReheat, resetReady };
}
