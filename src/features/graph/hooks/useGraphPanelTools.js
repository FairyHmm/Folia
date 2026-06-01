import { graphConfigStore } from "../store/graphConfigStore";
import { graphDataStore } from "../store/graphDataStore";

export function useGraphPanelTools() {
  const display = graphConfigStore((s) => s.display);
  const forces = graphConfigStore((s) => s.forces);
  const updateDisplay = graphConfigStore((s) => s.updateDisplay);
  const updateForces = graphConfigStore((s) => s.updateForces);

  const rerollStyles = graphDataStore((s) => s.rerollStyles);

  const bindDisplay = (id) => ({
    value: display[id],
    onChange: (val) => updateDisplay(id, val),
  });

  const bindForces = (id) => ({
    value: forces[id],
    onChange: (val) => updateForces(id, val),
  });

  return {
    dimension: { ...bindDisplay("dimension") },
    nodeSize: { ...bindDisplay("nodeSize") },
    glowSize: { ...bindDisplay("glowSize") },
    glowOpacity: { ...bindDisplay("glowOpacity") },
    ringSize: { ...bindDisplay("ringSize") },
    ringThickness: { ...bindDisplay("ringThickness") },
    ringOpacity: { ...bindDisplay("ringOpacity") },

    charge: { ...bindForces("charge") },
    gravity: { ...bindForces("gravity") },
    distance: { ...bindForces("distance") },
    linkStrength: { ...bindForces("linkStrength") },

    reroll: {
      onClick: rerollStyles,
    },
  };
}
