import { graphPanel } from "../../graph/utils/graphPanel";

export const analyseMode = {
  label: "Analyse",
  view: "graph",
  panel: graphPanel,
  Overlay: null,
  transitions: ["upload", "mentor"],
  disableTransitions: true,
};
