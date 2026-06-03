import { useEffect } from "react";
import { graphConfigStore } from "../store/graphConfigStore";

export function useGraphPhysics(instanceRef) {
  // Select ONLY the forces slice from the config store
  const charge = graphConfigStore((s) => s.forces.charge);
  const distance = graphConfigStore((s) => s.forces.distance);
  const gravity = graphConfigStore((s) => s.forces.gravity);
  const linkStrength = graphConfigStore((s) => s.forces.linkStrength);

  useEffect(() => {
    const fg = instanceRef.current;
    if (!fg?.d3Force) return;

    try {
      fg.d3Force("charge")?.strength(charge);
      fg.d3Force("center")?.strength(gravity);
      fg.d3Force("link")?.distance(distance)?.strength(linkStrength);

      fg.d3ReheatSimulation?.();
    } catch (e) {
      console.warn("[useGraphPhysics]", e);
    }
  }, [charge, distance, gravity, linkStrength, instanceRef]);
}
