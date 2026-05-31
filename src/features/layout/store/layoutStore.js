import { create } from "zustand";

import { graphPanel } from "../../graph/utils/graphPanel";
import { useGraphPanelTools } from "../../graph/hooks/useGraphPanelTools";

export const layoutStore = create((set) => ({
  activeMode: "graph",
  setMode: (mode) => set({ activeMode: mode }),

  modes: {
    graph: {
      panel: graphPanel,
      useTools: useGraphPanelTools,
    },
  },
}));
