export const ACTION_PREFIX = "__action__";
export const CONTENT_PREFIX = "__content__";

export const isActionNode = (id) =>
  typeof id === "string" && id.includes(ACTION_PREFIX);
export const isContentNode = (id) =>
  typeof id === "string" && id.includes(CONTENT_PREFIX);
export const isTransientNode = (id) => isActionNode(id) || isContentNode(id);
