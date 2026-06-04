import { create } from "zustand";
import { buildGraph } from "../utils/graphBuilder";
import { cvStore } from "./cvStore";

export const graphDataStore = create(() => ({
  graphData: { nodes: [], links: [] },
}));

export const rebuildGraph = () => {
  const cvData = cvStore.getState().cvData;
  if (!cvData) return;
  graphDataStore.setState({ graphData: buildGraph(cvData) });
};

// Rebuild whenever cvData changes
cvStore.subscribe(
  (state) => state.cvData,
  () => rebuildGraph()
);
