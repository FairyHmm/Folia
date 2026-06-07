import { buildGraph } from "../../../shared/utils/graphBuilder";

export function buildRevealData(cvData, tokens) {
  const fullGraph = buildGraph(cvData);

  const nodeMap = new Map();
  const linkMap = new Map();

  for (const node of fullGraph.nodes) {
    nodeMap.set(node.id, node);
  }

  for (const link of fullGraph.links) {
    if (!linkMap.has(link.source)) {
      linkMap.set(link.source, []);
    }
    linkMap.get(link.source).push(link);
  }

  const mentionedIds = new Set(tokens.map((t) => t.value));

  const mentionedNodes = tokens
    .map((t) => nodeMap.get(t.value))
    .filter(Boolean);

  const missingNodes = fullGraph.nodes.filter(
    (n) => !mentionedIds.has(n.id)
  );

  return {
    nodeMap,
    linkMap,
    mentionedNodes,
    mentionedIds,
    missingNodes,
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
