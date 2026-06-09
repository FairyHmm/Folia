import { create } from "zustand";

const getId = (v) => (typeof v === "object" && v !== null ? v.id : v);

export const graphDataStore = create((set, get) => ({
  graphData: { nodes: [], links: [] },
  pendingLinks: [],

  addNode: (node, links = []) => {
    const { graphData, pendingLinks } = get();
    const { nodes, links: existingLinks } = graphData;
    if (nodes.some((n) => n.id === node.id)) return;

    const newNodes = [...nodes, node];
    const nodeIds = new Set(newNodes.map((n) => n.id));

    const normalised = [
      ...pendingLinks,
      ...links.map((l) => ({ source: getId(l.source), target: getId(l.target) })),
    ];

    const linkKey = (l) => `${getId(l.source)}→${getId(l.target)}`;
    const existingKeys = new Set(existingLinks.map(linkKey));

    const resolved = normalised.filter(
      (l) => nodeIds.has(l.source) && nodeIds.has(l.target) && !existingKeys.has(linkKey(l))
    );
    const stillPending = normalised.filter(
      (l) => !nodeIds.has(l.source) || !nodeIds.has(l.target)
    );

    set({
      graphData: { nodes: newNodes, links: [...existingLinks, ...resolved] },
      pendingLinks: stillPending,
    });
  },

  updateNode: (id, patch) => {
    const node = get().graphData.nodes.find((n) => n.id === id);
    if (!node) return;
    Object.assign(node, patch);
  },

  clearGraph: () => set({ graphData: { nodes: [], links: [] }, pendingLinks: [] }),
}));
