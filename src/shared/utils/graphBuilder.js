import { parseRoleSchema } from "./roleSchemaParser";
import { applyNodeStyles } from "../../features/graph/utils/styleApplicator";
import roleSchema from "../data/roleSchema.json";

export function buildGraph(cvData) {
  const { targetRoles, skills, artifacts } = cvData;

  const { nodes, links } = parseRoleSchema(roleSchema, targetRoles);

  const enrichedNodes = nodes.map((node) => {
    const skillData = skills[node.id];

    const enriched = skillData
      ? {
          ...node,
          proficiency: skillData.proficiency,
          relevance: skillData.relevance ?? {},
        }
      : node;

    return {
      ...enriched,
      artifacts: artifacts
        .filter((a) => a.skills.includes(node.id))
        .map((a) => ({ url: a.url, type: a.type })),
      ...applyNodeStyles(enriched),
    };
  });

  return { nodes: enrichedNodes, links };
}
