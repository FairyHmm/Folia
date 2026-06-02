import { graphConfigStore } from "../store/graphConfigStore";

export function useGraphToolValue(tool) {
  return graphConfigStore((state) => {
    if (!tool.group) return undefined;

    return state[tool.group]?.[tool.id];
  });
}
