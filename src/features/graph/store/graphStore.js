import { create } from "zustand";
import { parseRoles } from "../utils/graphParser";
import rolesData from "../../../shared/data/dummyData.json";

const parsedData = parseRoles(rolesData);

export const graphStore = create((set) => ({
  // Core Data & View Engine Targets
  graphData: parsedData,
  activeView: "2d", // "2d" | "3d"
  labels: true,

  // Shared Global D3 Physics Parameters
  charge: -250,
  distance: 60,
  gravity: 0.2,
  linkStrength: 0.5,

  // Action Setters
  setView: (v) => set({ activeView: v }),
  setLabels: (v) => set({ labels: v }),
  setCharge: (v) => set({ charge: v }),
  setDistance: (v) => set({ distance: v }),
  setGravity: (v) => set({ gravity: v }),
  setLinkStrength: (v) => set({ linkStrength: v }),
}));
