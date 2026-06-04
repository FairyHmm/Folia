import { graphConfigStore } from "../store/graphConfigStore";

export function useGraphPanelTools() {
  const updateDisplay = graphConfigStore((s) => s.updateDisplay);
  const updateForces = graphConfigStore((s) => s.updateForces);

  return {
    updateDisplay,
    updateForces,
  };
}
