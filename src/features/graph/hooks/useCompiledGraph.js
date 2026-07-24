import { useState, useMemo, useCallback } from "react";
import { graphDataStore } from "../../../shared/store/graphDataStore";

export function useCompiledGraph() {
  const baseNodes = graphDataStore((s) => s.graphData.nodes);
  const baseLinks = graphDataStore((s) => s.graphData.links);

  const [selectedSkillId, setSelectedSkillId] = useState(null);

  // IMPORTANT: graphData must keep stable node/link object identity across
  // selection changes. react-force-graph relies on object identity to carry
  // simulation state (x/y/vx/vy, resolved link.source/target) between
  // renders — swapping in new objects resets the simulation and makes the
  // graph appear to "disconnect". So we never .map() into new objects here;
  // dimming is applied by mutating `dimmed` in place (see selectSkill/
  // useSelectionDimming in Graph.jsx) instead of recomputing this array.
  const graphData = useMemo(
    () => ({ nodes: baseNodes, links: baseLinks }),
    [baseNodes, baseLinks],
  );

  const selectSkill = useCallback((skillId) => {
    setSelectedSkillId((prev) => (prev === skillId ? null : skillId));
  }, []);

  const clearSelection = useCallback(() => setSelectedSkillId(null), []);

  const selectedSkill = useMemo(
    () => baseNodes.find((n) => n.id === selectedSkillId) || null,
    [baseNodes, selectedSkillId],
  );

  return {
    graphData,
    baseNodes,
    baseLinks,
    selectedSkillId,
    selectedSkill,
    selectSkill,
    clearSelection,
  };
}
