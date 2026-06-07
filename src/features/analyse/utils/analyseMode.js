import { graphPanel } from "../../graph/utils/graphPanel";
import Analyse from "../components/Analyse";

export const analyseMode = {
  label: "Analyse",
  view: "graph",
  panel: graphPanel,
  Overlay: Analyse,
  transitions: ["upload", "mentor"],
  disableTransitions: true,
};
