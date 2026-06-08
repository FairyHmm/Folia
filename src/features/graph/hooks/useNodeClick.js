import { useCallback } from "react";
import { NodeType } from "../../../shared/utils/cvConstants";
import {
  graphDataStore,
  isActionNode,
  isContentNode,
} from "../../../shared/store/graphDataStore";
import { buildActionNodes, buildContentNode } from "../utils/actionNodeBuilder";

export function useNodeClick() {
  return useCallback((node) => {
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
      // Proficiency: apply next level to parent skill node
      if (node.nextProficiency != null) {
        const skillId = node.parentId.split("__action__")[0];
        updateNode(skillId, { proficiency: node.nextProficiency });
      }
      return;
    }

    // ─── Action node click ────────────────────────────────────────────────
    if (isActionNode(node.id)) {
      if (expandedAction === node.id) return; // already open
      const { graphData } = graphDataStore.getState();
      const skillId = node.parentId;
      const skillNode = graphData.nodes.find((n) => n.id === skillId);
      if (!skillNode) return;
      const { node: contentNode, link: contentLink } = buildContentNode(
        node,
        skillNode,
      );
      expandAction(node.id, contentNode, contentLink);
      return;
    }

    // ─── Structural skill node click ──────────────────────────────────────
    if (node.nodeType !== NodeType.ACTION) {
      if (expandedSkill === node.id) {
        collapseSkill();
        return;
      }
      const { nodes: actionNodes, links: actionLinks } = buildActionNodes(node);
      expandSkill(node.id, actionNodes, actionLinks);
    }
  }, []);
}
