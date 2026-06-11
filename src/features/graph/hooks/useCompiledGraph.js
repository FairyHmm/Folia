import { useState, useMemo, useCallback } from "react";
import { graphDataStore } from "../../../shared/store/graphDataStore";
import { graphConfigStore } from "../store/graphConfigStore";
import {
  buildActionNodes,
  buildContentNodes,
} from "../utils/actionNodeBuilder";

export function useCompiledGraph() {
  const baseNodes = graphDataStore((s) => s.graphData.nodes);
  const baseLinks = graphDataStore((s) => s.graphData.links);

  const [expandedSkillId, setExpandedSkillId] = useState(null);
  const [expandedActionId, setExpandedActionId] = useState(null);

  // Derive the active graph layout on the fly
  const graphData = useMemo(() => {
    let nodes = [...baseNodes];
    let links = [...baseLinks];

    const { distance } = graphConfigStore.getState().forces;
    // Action nodes orbit at a fixed readable distance, not a fraction of the global slider
    const linkDistance = Math.max(distance * 0.5, 20);

    if (expandedSkillId) {
      const skill = nodes.find((n) => n.id === expandedSkillId);
      if (skill) {
        const { nodes: actions, links: actionLinks } = buildActionNodes(
          skill,
          linkDistance,
        );
        nodes.push(...actions);
        links.push(...actionLinks);
      }
    }

    if (expandedActionId) {
      const action = nodes.find((n) => n.id === expandedActionId);
      if (action) {
        const skill = nodes.find((n) => n.id === action.parentId);
        const { nodes: contents, links: contentLinks } = buildContentNodes(
          action,
          skill,
          linkDistance,
        );
        nodes.push(...contents);
        links.push(...contentLinks);
      }
    }

    return { nodes, links };
  }, [baseNodes, baseLinks, expandedSkillId, expandedActionId]);

  // Clean, self-contained toggle interaction hooks
  const toggleSkill = useCallback((skillId) => {
    setExpandedSkillId((prev) => (prev === skillId ? null : skillId));
    setExpandedActionId(null); // Close submenus when skill node shifts
  }, []);

  const toggleAction = useCallback((actionId) => {
    setExpandedActionId((prev) => (prev === actionId ? null : actionId));
  }, []);

  return {
    graphData,
    expandedSkillId,
    expandedActionId,
    toggleSkill,
    toggleAction,
  };
}
