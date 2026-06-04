import { create } from "zustand";
import { graphMode } from "../../graph/utils/graphMode";
import { uploadMode } from "../../upload/utils/uploadMode";
import { analyseMode } from "../../analyse/utils/analyseMode";
import { mentorMode } from "../../mentor/utils/mentorMode";

export const layoutStore = create(() => ({
  activeMode: "graph",
  modes: {
    graph: graphMode,
    upload: uploadMode,
    analyse: analyseMode,
    mentor: mentorMode,
  },
}));

export const setMode = (mode) => layoutStore.setState({ activeMode: mode });
