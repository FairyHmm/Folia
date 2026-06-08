import { useEffect, useRef } from "react";
import { graphConfigStore } from "../store/graphConfigStore";
import { forceX, forceY, forceZ } from "d3-force-3d";

export function useGraphPhysics(instanceRef, dimension) {
  const charge = graphConfigStore((s) => s.forces.charge);
  const distance = graphConfigStore((s) => s.forces.distance);
  const gravity = graphConfigStore((s) => s.forces.gravity);
  const linkStrength = graphConfigStore((s) => s.forces.linkStrength);

  const ready = useRef(false);

  useEffect(() => {
    ready.current = false;
  }, [dimension]);

  useEffect(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;

    try {
      const g = gravity / 100;

      fg.d3Force("charge")?.strength(-10 * (charge + 1));
      // Per-link distance: use node's linkDistance if set, else fall back to config
      fg.d3Force("link")
        ?.distance((link) => link.linkDistance ?? distance)
        ?.strength(linkStrength);
      fg.d3Force("gravity", null);

      if (dimension === "3d") {
        fg.d3Force("center-x", forceX(0).strength(g));
        fg.d3Force("center-y", forceY(0).strength(g));
        fg.d3Force("center-z", forceZ(0).strength(g));
        if (ready.current) fg.d3ReheatSimulation?.();
      } else {
        fg.d3Force("center-x", forceX(0).strength(g));
        fg.d3Force("center-y", forceY(0).strength(g));
        fg.d3ReheatSimulation?.();
      }
    } catch (e) {
      console.warn("[useGraphPhysics]", e);
    }
  }, [charge, distance, gravity, linkStrength, dimension]);

  const onEngineTick = useRef(() => {
    if (!ready.current) ready.current = true;
  }).current;

  return { onEngineTick };
}
