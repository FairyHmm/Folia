import { graphConfigStore } from "../store/graphConfigStore";
import { graphDataStore } from "../store/graphDataStore";

export function useGraphPanelTools() {
  const updateDisplay = graphConfigStore((s) => s.updateDisplay);
  const updateForces = graphConfigStore((s) => s.updateForces);

  const rerollStyles = graphDataStore((s) => s.rerollStyles);

  return {
    updateDisplay,
    updateForces,
    rerollStyles,
  };
}
