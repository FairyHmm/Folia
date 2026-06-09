import { useCallback } from "react";
import { NodeType, ActionType } from "../../../shared/utils/cvConstants";
import {
  graphDataStore,
  isActionNode,
  isContentNode,
} from "../../../shared/store/graphDataStore";
import {
  buildActionNodes,
  buildContentNodes,
} from "../utils/actionNodeBuilder";

export function useNodeClick(gentleReheat) {
  return useCallback(
    (node) => {
      const {
        expandedSkill,
        expandedAction,
        expandSkill,
        collapseSkill,
        expandAction,
        updateNode,
      } = graphDataStore.getState();

      // ─── Content node click ───────────────────────────────────────────────
      if (isContentNode(node.id)) {
        // Proficiency Logic: Update parent skill
        if (node.actionType === ActionType.PROFICIENCY && node.level != null) {
          const skillId = node.parentId.split("__action__")[0];
          updateNode(skillId, { proficiency: node.level });
        }
        return;
      }

      // ─── Action node click ────────────────────────────────────────────────
      if (isActionNode(node.id)) {
        if (expandedAction === node.id) return;

        const { graphData } = graphDataStore.getState();
        const skillId = node.parentId;
        const skillNode = graphData.nodes.find((n) => n.id === skillId);
        if (!skillNode) return;

        // Use new plural builder
        const { nodes: contentNodes, links: contentLinks } = buildContentNodes(
          node,
          skillNode,
        );

        // Set spawn positions
        contentNodes.forEach((n) => {
          n.x = node.x;
          n.y = node.y;
          n.z = node.z;
        });

        expandAction(node.id, contentNodes, contentLinks);
        gentleReheat?.();
        return;
      }

      // ─── Structural node click ────────────────────────────────────────────
      if (node.nodeType !== NodeType.ACTION) {
        if (expandedSkill === node.id) {
          collapseSkill();
          return;
        }

        const { nodes: actionNodes, links: actionLinks } =
          buildActionNodes(node);

        actionNodes.forEach((actionNode) => {
          actionNode.x = node.x;
          actionNode.y = node.y;
          actionNode.z = node.z;
        });

        expandSkill(node.id, actionNodes, actionLinks);
        gentleReheat?.();
      }
    },
    [gentleReheat],
  );
}
