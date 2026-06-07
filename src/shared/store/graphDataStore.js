import { create } from "zustand";

export const graphDataStore = create((set, get) => ({
  graphData: { nodes: [], links: [] },
  pendingLinks: [], // links waiting for endpoints

  addNode: (node, links = []) => {
    const { graphData, pendingLinks } = get(); // destructure graphData, not nodes directly
    const { nodes, links: existingLinks } = graphData;
    if (nodes.some((n) => n.id === node.id)) return;

    const newNodes = [...nodes, node];
    const nodeIds = new Set(newNodes.map((n) => n.id));

    const normalised = [
      ...pendingLinks,
      ...links.map((l) => ({
        source: typeof l.source === "object" ? l.source.id : l.source,
        target: typeof l.target === "object" ? l.target.id : l.target,
      })),
    ];

    const linkKey = (l) => `${l.source}→${l.target}`;
    const existingKeys = new Set(existingLinks.map(linkKey));

    const resolved = normalised.filter(
      (l) =>
        nodeIds.has(l.source) &&
        nodeIds.has(l.target) &&
        !existingKeys.has(linkKey(l)),
    );
    const stillPending = normalised.filter(
      (l) => !nodeIds.has(l.source) || !nodeIds.has(l.target),
    );

    set({
      graphData: { nodes: newNodes, links: [...existingLinks, ...resolved] },
      pendingLinks: stillPending,
    });
  },

  clearGraph: () =>
    set({ graphData: { nodes: [], links: [] }, pendingLinks: [] }),
}));
