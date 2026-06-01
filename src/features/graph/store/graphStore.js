import { create } from "zustand";
import { parseRoles } from "../utils/graphParser";
import { applyNodeStyles } from "../utils/styleApplicator";
import rolesData from "../../../shared/data/dummyData.json";

const parsedData = parseRoles(rolesData);

export const graphStore = create((set, get) => ({
  graphData: {
    ...parsedData,
    nodes: parsedData.nodes.map((node) => ({
      ...node,
      ...applyNodeStyles(node),
    })),
  },

  activeView: "2d",
  labels: true,

  charge: -250,
  distance: 60,
  gravity: 0.2,
  linkStrength: 0.5,

  setView: (v) => set({ activeView: v }),
  setLabels: (v) => set({ labels: v }),
  setCharge: (v) => set({ charge: v }),
  setDistance: (v) => set({ distance: v }),
  setGravity: (v) => set({ gravity: v }),
  setLinkStrength: (v) => set({ linkStrength: v }),

  rerollStyles: () => {
    const currentData = get().graphData;

    currentData.nodes.forEach((node) => {
      const newStyles = applyNodeStyles(node);
      Object.assign(node, newStyles);
    });

    set({ graphData: { nodes: currentData.nodes, links: currentData.links } });
  },
}));
