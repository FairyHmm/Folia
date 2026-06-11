import { useCallback } from "react";
import { NodeType, ActionType } from "../../../shared/utils/cvConstants";
import { isActionNode, isContentNode } from "../utils/graphUtils";
import { updateSkillProficiency } from "../../../shared/store/cvStore";

export function useNodeClick(gentleReheat, toggleSkill, toggleAction) {
  return useCallback(
    (node) => {
      // ─── Content Node Click ───────────────────────────────────────────────
      if (isContentNode(node.id)) {
        if (node.actionType === ActionType.PROFICIENCY && node.level != null) {
          const skillId = node.parentId.split("__action__")[0];
          updateSkillProficiency(skillId, node.level);
        } else if (node.url) {
          window.open(node.url, "_blank");
        }
        return;
      }

      if (node.nodeType === NodeType.ADD_BUTTON) {
        console.log("Open Add Modal for:", node.parentId);
        return;
      }

      // ─── Action Node Click ────────────────────────────────────────────────
      if (isActionNode(node.id)) {
        toggleAction(node.id);
        gentleReheat?.();
        return;
      }

      // ─── Structural Node Click (Skill Core) ───────────────────────────────
      if (node.nodeType !== NodeType.ACTION) {
        toggleSkill(node.id);
        gentleReheat?.();
      }
    },
    [toggleSkill, toggleAction, gentleReheat],
  );
}
