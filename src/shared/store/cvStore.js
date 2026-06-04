import { create } from "zustand";

export const cvStore = create(() => ({
  cvData: null,
}));

export const setCVData = (data) => cvStore.setState({ cvData: data });
