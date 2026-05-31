import { create } from "zustand";

export const graphStore = create((set) => ({
  activeView: "2d",
  labels: false,
  charge: -120,
  distance: 60,
  gravity: 0.1,

  setView:     (v) => set({ activeView: v }),
  setLabels:   (v) => set({ labels: v }),
  setCharge:   (v) => set({ charge: v }),
  setDistance: (v) => set({ distance: v }),
  setGravity:  (v) => set({ gravity: v }),
}));
