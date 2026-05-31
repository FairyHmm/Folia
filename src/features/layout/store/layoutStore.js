import { create } from "zustand";
import { graphPanel } from "../../graph/utils/graphPanel";
import { useGraphPanelTools } from "../../graph/hooks/useGraphPanelTools";

export const layoutStore = create(() => ({
  activeMode: "graph",
  setMode: (mode) => ({ activeMode: mode }),

  modes: {
    graph: { panel: graphPanel, useTools: useGraphPanelTools },
    upload: { panel: [], useTools: () => ({}) },
    mentor: { panel: [], useTools: () => ({}) },
  },
}));

export const setMode = (mode) => layoutStore.setState({ activeMode: mode });
