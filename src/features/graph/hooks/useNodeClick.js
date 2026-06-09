import { useCallback } from "react";
import { NodeType } from "../../../shared/utils/cvConstants";
import { graphDataStore, isActionNode, isContentNode } from "../../../shared/store/graphDataStore";
import { buildActionNodes, buildContentNode } from "../utils/actionNodeBuilder";

export function useNodeClick(gentleReheat) {
  return useCallback((node) => {
    const { expandedSkill, expandedAction, expandSkill, collapseSkill, expandAction, updateNode } =
      graphDataStore.getState();

    // ─── Content node click ───────────────────────────────────────────────
    if (isContentNode(node.id)) {
      if (node.nextProficiency != null) {
        const skillId = node.parentId.split("__action__")[0];
        updateNode(skillId, { proficiency: node.nextProficiency });
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

      const { node: contentNode, link: contentLink } = buildContentNode(node, skillNode);

      contentNode.x = node.x;
      contentNode.y = node.y;
      contentNode.z = node.z;

      expandAction(node.id, contentNode, contentLink);
      gentleReheat?.();
      return;
    }

    // ─── Structural node click ────────────────────────────────────────────
    if (node.nodeType !== NodeType.ACTION) {
      if (expandedSkill === node.id) {
        collapseSkill();
        return;
      }
      const { nodes: actionNodes, links: actionLinks } = buildActionNodes(node);

      actionNodes.forEach((actionNode) => {
        actionNode.x = node.x;
        actionNode.y = node.y;
        actionNode.z = node.z;
      });

      console.log("before expand - parent pos:", node.x, node.y);

      expandSkill(node.id, actionNodes, actionLinks);
      gentleReheat?.();
    }
  }, [gentleReheat]);
}
