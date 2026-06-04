import { create } from "zustand";
import { parseRoles } from "../utils/graphParser";
import { applyNodeStyles } from "../utils/styleApplicator";
import rolesData from "../../../shared/data/roleSchema.json";

const parsedData = parseRoles(rolesData);

export const graphDataStore = create((set, get) => ({
  graphData: {
    ...parsedData,
    nodes: parsedData.nodes.map((node) => ({
      ...node,
      ...applyNodeStyles(node),
    })),
  },

  rerollStyles: () => {
    const currentData = get().graphData;

    currentData.nodes.forEach((node) => {
      const newStyles = applyNodeStyles(node);
      Object.assign(node, newStyles);
    });

    set({ graphData: { nodes: currentData.nodes, links: currentData.links } });
  },
}));
