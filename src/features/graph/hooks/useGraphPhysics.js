import { useEffect, useRef, useCallback } from "react";
import { graphConfigStore } from "../store/graphConfigStore";
import { graphDataStore, isActionNode, isContentNode } from "../../../shared/store/graphDataStore";
import {
  forceX,
  forceY,
  forceZ,
  forceCollide,
  forceManyBody,
} from "d3-force-3d";

const SPAWN_RAMP_TICKS = 5;

export function useGraphPhysics(instanceRef, dimension) {
  const charge = graphConfigStore((s) => s.forces.charge);
  const distance = graphConfigStore((s) => s.forces.distance);
  const gravity = graphConfigStore((s) => s.forces.gravity);
  const linkStrength = graphConfigStore((s) => s.forces.linkStrength);

  const ready = useRef(false);

  // Refs so onEngineTick always calls the latest versions without stale closures
  const applyForcesRef = useRef(null);
  const updateLinkForceRef = useRef(null);

  useEffect(() => {
    ready.current = false;
  }, [dimension]);

  const applyForces = useCallback(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;

    const { charge, gravity, distance } = graphConfigStore.getState().forces;
    const g = gravity / 100;

    fg.d3Force("charge")?.strength((node) =>
      isActionNode(node.id) || isContentNode(node.id)
        ? 0
        : -10 * (charge + 1),
    );

    fg.d3Force(
      "menu-charge",
      forceManyBody().strength((node) => {
        if (!(isActionNode(node.id) || isContentNode(node.id))) return 0;
        if (node.spawning) return 0;
        return -2 * (charge + 1);
      }),
    );

    fg.d3Force(
      "transient-collide",
      forceCollide((node) => {
        if (!(isActionNode(node.id) || isContentNode(node.id))) return 0;
        if (node.spawning) return 0;
        return distance * 0.1;
      }).strength(0.7),
    );

    fg.d3Force("gravity", null);
    if (dimension === "3d") {
      fg.d3Force("center-x", forceX(0).strength(g));
      fg.d3Force("center-y", forceY(0).strength(g));
      fg.d3Force("center-z", forceZ(0).strength(g));
    } else {
      fg.d3Force("center-x", forceX(0).strength(g));
      fg.d3Force("center-y", forceY(0).strength(g));
    }
  }, [dimension, instanceRef]);

  // Keep ref current so onEngineTick always calls the latest version
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
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;

        if (
          isActionNode(targetId) ||
          isActionNode(sourceId) ||
          isContentNode(targetId) ||
          isContentNode(sourceId)
        ) {
          return link.linkDistance || globalDistance * 0.35;
        }
        return link.linkDistance || globalDistance;
      })
      .strength((link) => {
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;

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

  // Keep ref current so onEngineTick always calls the latest version
  updateLinkForceRef.current = updateLinkForce;

  useEffect(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;
    try {
      applyForces();
      if (ready.current) fg.d3ReheatSimulation?.();
    } catch (e) {
      console.warn("[useGraphPhysics] force setup error", e);
    }
  }, [charge, gravity, distance, dimension, applyForces]);

  useEffect(() => {
    updateLinkForce();
    const fg = instanceRef.current;
    if (ready.current && fg) fg.d3ReheatSimulation?.();
  }, [distance, linkStrength, updateLinkForce]);

  const gentleReheat = useCallback(() => {
    const fg = instanceRef.current;
    if (!fg?.d3ReheatSimulation) return;
    try {
      // NOTE: intentionally not calling updateLinkForce here — calling it
      // mid-simulation resets the distance accessor and causes a second jerk
      fg.d3ReheatSimulation();
    } catch (e) {
      console.warn("[useGraphPhysics] gentleReheat", e);
    }
  }, [instanceRef]);

  const onEngineTick = useRef(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;

    const { graphData } = graphDataStore.getState();
    const safeNodes = graphData?.nodes || [];

    if (!ready.current) {
      ready.current = true;
      updateLinkForceRef.current?.();
      return;
    }

    // VELOCITY CLAMPING: prevent physics spikes on structural nodes
    const MAX_VELOCITY = 1;
    safeNodes.forEach((node) => {
      if (!isActionNode(node.id) && !isContentNode(node.id)) {
        if (node.vx > MAX_VELOCITY) node.vx = MAX_VELOCITY;
        if (node.vx < -MAX_VELOCITY) node.vx = -MAX_VELOCITY;
        if (node.vy > MAX_VELOCITY) node.vy = MAX_VELOCITY;
        if (node.vy < -MAX_VELOCITY) node.vy = -MAX_VELOCITY;
      }
    });

    // SPAWN RAMP: new nodes have spawning=true which zeroes their repulsion.
    // Tick up spawnAge each frame; clear the flag once mature so normal forces apply.
    let anyJustMatured = false;
    safeNodes.forEach((node) => {
      if (!node.spawning) return;
      node.spawnAge = (node.spawnAge ?? 0) + 1;
      if (node.spawnAge >= SPAWN_RAMP_TICKS) {
        node.spawning = false;
        anyJustMatured = true;
      }
    });

    // Use ref so we always call the latest applyForces, never a stale closure
    applyForcesRef.current?.();
  }).current;

  const resetReady = useCallback(() => {
    ready.current = false;
  }, []);

  return { onEngineTick, gentleReheat, resetReady };
}
