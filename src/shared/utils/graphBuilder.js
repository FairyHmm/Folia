import { parseRoleSchema } from "./roleSchemaParser";
import { applyNodeStyles } from "../../features/graph/utils/styleApplicator";
import roleSchema from "../data/roleSchema.json";

// Build the full enriched graph from cvData
export function buildGraph(cvData) {
  const { targetRoles, skills, artifacts } = cvData;
  const { nodes, links } = parseRoleSchema(roleSchema, targetRoles);

  const enrichedNodes = nodes.map((node) =>
    enrichNode(node, skills, artifacts)
  );

  return { nodes: enrichedNodes, links };
}

// Build a single enriched node by id (for one-by-one animation)
export function buildNode(nodeId, cvData) {
  const { targetRoles, skills, artifacts } = cvData;
  const { nodes } = parseRoleSchema(roleSchema, targetRoles);
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  return enrichNode(node, skills, artifacts);
}

// Get all links for a node from the full parsed schema
export function getNodeLinks(nodeId, cvData) {
  const { targetRoles } = cvData;
  const { links } = parseRoleSchema(roleSchema, targetRoles);
  return links.filter(
    (l) => l.source === nodeId || l.target === nodeId
  );
}

function enrichNode(node, skills, artifacts) {
  const skillData = skills?.[node.id];
  const enriched = skillData
    ? { ...node, proficiency: skillData.proficiency, relevance: skillData.relevance ?? {} }
    : node;

  return {
    ...enriched,
    artifacts: (artifacts ?? [])
      .filter((a) => a.skills.includes(node.id))
      .map((a) => ({ url: a.url, type: a.type })),
    ...applyNodeStyles(enriched),
  };
}
