import { create } from "zustand";
import { persist } from "zustand/middleware";

export const graphConfigStore = create(
  persist(
    (set) => ({
      display: {
        dimension: "2d",
        nodeSize: 1,
        glowSize: 1,
        glowOpacity: 0.6,
        ringSize: 1.5,
        ringThickness: 1,
        ringOpacity: 0.5,
      },

      forces: {
        charge: 10,
        gravity: 2.5,
        distance: 10,
        linkStrength: 1,
      },

      interaction: {},

      updateDisplay: (key, value) =>
        set((state) => ({
          display: { ...state.display, [key]: value },
        })),

      updateForces: (key, value) =>
        set((state) => ({
          forces: { ...state.forces, [key]: value },
        })),
    }),
    {
      name: "graph-config-storage",
      partialize: (state) => ({
        display: state.display,
        forces: state.forces,
      }),
    }
  )
);
