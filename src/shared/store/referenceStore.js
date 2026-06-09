import { create } from "zustand";
import resourceSchema from "../data/resourceSchema.json";

export const useReferenceStore = create((set) => ({
  resources: resourceSchema, // Load data immediately

  // Helper to get resources for a specific skill
  getResourcesForSkill: (skillName) => {
    const state = useReferenceStore.getState();
    return state.resources[skillName] || [];
  },
}));
