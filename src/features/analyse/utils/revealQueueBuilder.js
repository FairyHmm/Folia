import { buildGraph } from "../../../shared/utils/graphBuilder";

export function buildRevealData(cvData, tokens) {
  const fullGraph = buildGraph(cvData);

  const nodeMap = new Map();
  const linkMap = new Map();

  for (const node of fullGraph.nodes) {
    nodeMap.set(node.id, node);
  }

  for (const link of fullGraph.links) {
    if (!linkMap.has(link.source)) linkMap.set(link.source, []);
    linkMap.get(link.source).push(link);
    // Also index by target so incoming links are registered when the
    // target node arrives, not just when the source does.
    if (!linkMap.has(link.target)) linkMap.set(link.target, []);
    linkMap.get(link.target).push(link);
  }

  const mentionedIds = new Set(tokens.map((t) => t.value));

  const mentionedNodes = tokens
    .map((t) => nodeMap.get(t.value))
    .filter(Boolean);

  const missingNodes = fullGraph.nodes.filter(
    (n) => !mentionedIds.has(n.id)
  );

  // Build a child→parent map so we can walk up the ancestor chain
  // from any skill node without scanning all links each time.
  const parentMap = new Map();
  for (const link of fullGraph.links) {
    parentMap.set(link.target, link.source);
  }

  const structuralNodes = fullGraph.nodes.filter((n) => n.tier < 4);
  const skillNodes = fullGraph.nodes.filter((n) => n.tier >= 4);

  return {
    nodeMap,
    linkMap,
    parentMap,
    mentionedNodes,
    mentionedIds,
    missingNodes,
    structuralNodes,
    skillNodes,
    fullGraph,
  };
}

/**
 * BFS from mentioned nodes through the link graph (both directions).
 * Depth 4 covers: Skill → Category → Role → sibling Category → sibling Skill
 * Returns only missing nodes that belong to the same skill tree.
 */
export function getRelatedMissingNodes(mentionedIds, fullGraph, depth = 4) {
  const visited = new Set(mentionedIds);
  let frontier = new Set(mentionedIds);

  for (let d = 0; d < depth; d++) {
    const nextFrontier = new Set();
    for (const link of fullGraph.links) {
      if (frontier.has(link.source) && !visited.has(link.target)) {
        nextFrontier.add(link.target);
        visited.add(link.target);
      }
      if (frontier.has(link.target) && !visited.has(link.source)) {
        nextFrontier.add(link.source);
        visited.add(link.source);
      }
    }
    frontier = nextFrontier;
    if (frontier.size === 0) break;
  }

  return fullGraph.nodes.filter(
    (n) => !mentionedIds.has(n.id) && visited.has(n.id)
  );
}
