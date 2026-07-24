import { useCallback } from "react";

// Previously this spawned action/content nodes into the graph on click,
// which made the layout messy and hard to follow. Clicking a node now
// simply selects it — Graph.jsx renders a side panel with its resources
// instead of growing the graph.
export function useNodeClick(gentleReheat, selectSkill) {
  return useCallback(
    (node) => {
      selectSkill(node.id);
      gentleReheat?.();
    },
    [selectSkill, gentleReheat],
  );
}
