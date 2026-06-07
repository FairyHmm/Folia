import { StructuralTier } from "./cvConstants";

const cache = new Map();

export function parseRoleSchema(roleSchema, targetRoles) {
  const key = targetRoles.join(",");
  if (cache.has(key)) return cache.get(key);

  const nodeMap = new Map();
  const links = [];

  const registerNode = (id, label, tier, extra = {}) => {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, label, tier, ...extra });
    }
  };

  const filteredRoles = roleSchema.filter((r) => targetRoles.includes(r.title));

  filteredRoles.forEach((role) => {
    const { title } = role;
    registerNode(title, title, StructuralTier.ROLE.tier, { type: StructuralTier.ROLE.type });

    Object.entries(role.domains).forEach(([domain, modules]) => {
      registerNode(domain, domain, StructuralTier.DOMAIN.tier, { type: StructuralTier.DOMAIN.type });
      links.push({ source: title, target: domain });

      Object.entries(modules).forEach(([module, skills]) => {
        registerNode(module, module, StructuralTier.MODULE.tier, { type: StructuralTier.MODULE.type });
        links.push({ source: domain, target: module });

        skills.forEach((skill) => {
          const isPrerequisite = skill.startsWith("*");
          const name = isPrerequisite ? skill.slice(1) : skill;
          registerNode(name, name, StructuralTier.SKILL.tier, {
            type: StructuralTier.SKILL.type,
            isPrerequisite,
            proficiency: "UNKNOWN",
            relevance: {},
          });
          links.push({ source: module, target: name });
        });
      });
    });
  });

  const result = { nodes: Array.from(nodeMap.values()), links };
  cache.set(key, result);
  return result;
}
