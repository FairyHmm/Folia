import { create } from "zustand";

const getId = (v) => (typeof v === "object" && v !== null ? v.id : v);

export const graphDataStore = create((set, get) => ({
  graphData: { nodes: [], links: [] },
  pendingLinks: [],
  _version: 0,

  addNode: (node, links = []) => {
    const { graphData, pendingLinks, _version } = get();
    const { nodes, links: existingLinks } = graphData;
    // TEMP DEBUG — remove once the empty-graph issue is confirmed fixed.
    console.log("[graphDataStore debug] addNode called:", node?.id, "already present:", nodes.some((n) => n.id === node?.id));
    if (nodes.some((n) => n.id === node.id)) return;

    nodes.push(node);
    const nodeIds = new Set(nodes.map((n) => n.id));

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

    existingLinks.push(...resolved);

    set({
      graphData: { nodes, links: existingLinks },
      pendingLinks: stillPending,
      _version: _version + 1,
    });
  },

  updateNode: (id, patch) => {
    const node = get().graphData.nodes.find((n) => n.id === id);
    if (!node) return;
    Object.assign(node, patch);
  },

  clearGraph: () => set({ graphData: { nodes: [], links: [] }, pendingLinks: [], _version: 0 }),
}));
