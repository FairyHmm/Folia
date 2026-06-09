import { create } from "zustand";

const ACTION_PREFIX = "__action__";
const CONTENT_PREFIX = "__content__";

// Safe reference unwrapper for D3 objects
const getId = (v) => (typeof v === "object" && v !== null ? v.id : v);

export const isActionNode = (id) =>
  typeof id === "string" && id.includes(ACTION_PREFIX);
export const isContentNode = (id) =>
  typeof id === "string" && id.includes(CONTENT_PREFIX);
export const isTransientNode = (id) => isActionNode(id) || isContentNode(id);

const filterTransientLinks = (links) =>
  links.filter(
    (l) =>
      !isTransientNode(getId(l.source)) && !isTransientNode(getId(l.target)),
  );

const filterContentLinks = (links) =>
  links.filter(
    (l) => !isContentNode(getId(l.source)) && !isContentNode(getId(l.target)),
  );

export const graphDataStore = create((set, get) => ({
  graphData: { nodes: [], links: [] },
  pendingLinks: [],
  expandedSkill: null,
  expandedAction: null,

  // ─── Core node management ─────────────────────────────────────────────────

  addNode: (node, links = []) => {
    const { graphData, pendingLinks } = get();
    const { nodes, links: existingLinks } = graphData;
    if (nodes.some((n) => n.id === node.id)) return;

    const newNodes = [...nodes, node];
    const nodeIds = new Set(newNodes.map((n) => n.id));

    const normalised = [
      ...pendingLinks,
      ...links.map((l) => ({
        source: getId(l.source),
        target: getId(l.target),
      })),
    ];

    const linkKey = (l) => `${getId(l.source)}→${getId(l.target)}`;
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

  updateNode: (id, patch) => {
    const node = get().graphData.nodes.find((n) => n.id === id);
    if (!node) return;
    Object.assign(node, patch);
    // no set() — visual-only update, renderer reads node directly each tick
  },

  clearGraph: () =>
    set({
      graphData: { nodes: [], links: [] },
      pendingLinks: [],
      expandedSkill: null,
      expandedAction: null,
    }),

  // ─── Expansion helpers ────────────────────────────────────────────────────

  expandSkill: (skillId, actionNodes, actionLinks) => {
    const { graphData, expandedSkill } = get();
    let { nodes, links } = graphData;

    // Clear previous menu items cleanly if another node was open
    if (expandedSkill) {
      nodes = nodes.filter((n) => !isTransientNode(n.id));
      links = filterTransientLinks(links);
    }

    const newNodes = [...nodes, ...actionNodes];
    const nodeIds = new Set(newNodes.map((n) => n.id));
    const linkKey = (l) => `${getId(l.source)}→${getId(l.target)}`;
    const existingKeys = new Set(links.map(linkKey));

    // Normalize incoming targets to safe IDs to prevent object-to-string reference flashes
    const processedActionLinks = actionLinks.map((l) => ({
      ...l,
      source: getId(l.source),
      target: getId(l.target),
    }));

    const newLinks = [
      ...links,
      ...processedActionLinks.filter(
        (l) =>
          nodeIds.has(l.source) &&
          nodeIds.has(l.target) &&
          !existingKeys.has(linkKey(l)),
      ),
    ];

    set({
      graphData: { nodes: newNodes, links: newLinks },
      expandedSkill: skillId,
      expandedAction: null,
    });
  },

  collapseSkill: () => {
    const { graphData } = get();
    set({
      graphData: {
        nodes: graphData.nodes.filter((n) => !isTransientNode(n.id)),
        links: filterTransientLinks(graphData.links),
      },
      expandedSkill: null,
      expandedAction: null,
    });
  },

  // ... inside create((set, get) => ({ ... })):

  expandAction: (actionId, contentNodes, contentLinks) => {
    const { graphData, expandedAction } = get();
    let { nodes, links } = graphData;

    // Clear previous content if switching actions
    if (expandedAction) {
      nodes = nodes.filter((n) => !isContentNode(n.id));
      links = filterContentLinks(links);
    }

    const newNodes = [...nodes, ...contentNodes];
    const nodeIds = new Set(newNodes.map((n) => n.id));

    // Normalize links
    const processedContentLinks = contentLinks.map((l) => ({
      ...l,
      source: getId(l.source),
      target: getId(l.target),
    }));

    const linkKey = (l) => `${getId(l.source)}→${getId(l.target)}`;
    const existingKeys = new Set(links.map(linkKey));

    const newLinks = [
      ...links,
      ...processedContentLinks.filter(
        (l) =>
          nodeIds.has(l.source) &&
          nodeIds.has(l.target) &&
          !existingKeys.has(linkKey(l)),
      ),
    ];

    set({
      graphData: { nodes: newNodes, links: newLinks },
      expandedAction: actionId,
    });
  },
}));
