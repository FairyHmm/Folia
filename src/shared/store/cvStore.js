import { create } from "zustand";
import { graphDataStore } from "./graphDataStore";
import { PROFICIENCY_COLOR } from "../../features/graph/utils/graphStyleTokens";
import { Proficiency } from "../utils/cvConstants";

export const cvStore = create(() => ({
  cvData: null,
}));

export const setCVData = (data) => cvStore.setState({ cvData: data });

export const updateSkillProficiency = (skillId, level) => {
  // Update live graph node color immediately
  graphDataStore.getState().updateNode(skillId, {
    proficiency: level,
    color: PROFICIENCY_COLOR[level] ?? PROFICIENCY_COLOR[Proficiency.UNKNOWN],
  });

  // Keep cvData in sync
  const { cvData } = cvStore.getState();
  if (!cvData?.skills) return;

  const skill = cvData.skills.find((s) => s.id === skillId);
  if (skill) skill.proficiency = level;
};
