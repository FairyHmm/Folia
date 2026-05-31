import { useEffect } from "react";
import { graphStore } from "../store/graphStore";

export function useGraphPhysics(instanceRef) {
  const charge = graphStore((s) => s.charge);
  const distance = graphStore((s) => s.distance);
  const gravity = graphStore((s) => s.gravity);
  const linkStrength = graphStore((s) => s.linkStrength);

  useEffect(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;

    try {
      fg.d3Force("charge")?.strength(charge);
      fg.d3Force("center")?.strength(gravity);
      fg.d3Force("link")?.distance(distance)?.strength(linkStrength);

      const sim = fg.d3Simulation?.();
      if (sim) {
        sim.alphaTarget(0.2);
        const t = setTimeout(() => sim.alphaTarget(0), 400);
        return () => clearTimeout(t);
      }
    } catch (e) {
      console.warn("[useGraphPhysics]", e);
    }
  }, [charge, distance, gravity, linkStrength, instanceRef]);
}
