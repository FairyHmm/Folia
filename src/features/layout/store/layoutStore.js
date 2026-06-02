import { create } from "zustand";

import { graphPanel } from "../../graph/utils/graphPanel";
import { useGraphPanelTools } from "../../graph/hooks/useGraphPanelTools";
import { useGraphToolValue } from "../../graph/hooks/useGraphToolValue";

import Upload from "../../upload/components/Upload";
import Mentor from "../../mentor/components/Mentor";

export const layoutStore = create(() => ({
  activeMode: "graph",

  modes: {
    graph: {
      panel: graphPanel,
      useTools: useGraphPanelTools,
      useToolValue: useGraphToolValue,
      Overlay: null,
    },
    upload: {
      panel: [],
      useTools: () => ({}),
      useToolValue: () => undefined,
      Overlay: Upload,
    },
    mentor: {
      panel: [],
      useTools: () => ({}),
      useToolValue: () => undefined,
      Overlay: Mentor,
    },
  },
}));

export const setMode = (mode) => layoutStore.setState({ activeMode: mode });
