export const parseRoles = (rolesArray) => {
  const nodeMap = new Map();
  const links = [];

  const registerNode = (id, label, tier) => {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, label, tier });
    }
  };

  rolesArray.forEach((role) => {
    const jobTitle = role.title;

    registerNode(jobTitle, jobTitle, 1);

    Object.entries(role.domains).forEach(([domain, modules]) => {
      registerNode(domain, domain, 2);
      links.push({ source: jobTitle, target: domain });

      Object.entries(modules).forEach(([module, tools]) => {
        registerNode(module, module, 3);
        links.push({ source: domain, target: module });

        tools.forEach((tool) => {
          const dashed = tool.startsWith("*");
          const name = dashed ? tool.slice(1) : tool;

          registerNode(name, name, 4);
          links.push({
            source: module,
            target: name,
            isDash: dashed,
          });
        });
      });
    });
  });

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
};
