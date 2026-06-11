import {
  ActionType,
  NodeType,
  Proficiency,
} from "../../../shared/utils/cvConstants";
import {
  ACTION_LABELS,
  PROFICIENCY_LABELS,
  normalizeProficiency,
  getActionNodeShape,
  getProficiencyNodeColor,
  getArtifactNodeColor,
  getResourceNodeColor,
} from "./graphStyleTokens";
import { useReferenceStore } from "../../../shared/store/referenceStore";
import { cvStore } from "../../../shared/store/cvStore";
import { ACTION_PREFIX, CONTENT_PREFIX } from "./graphUtils";

function createNodeAndLink(parent, idSuffix, linkDistance, props = {}) {
  const offset = 5;

  const node = {
    id: `${parent.id}${idSuffix}`,
    parentId: parent.id,
    x:
      parent.x != null
        ? parent.x + (Math.random() - 0.5) * offset
        : (Math.random() - 0.5) * offset,
    y:
      parent.y != null
        ? parent.y + (Math.random() - 0.5) * offset
        : (Math.random() - 0.5) * offset,
    z:
      parent.z != null
        ? parent.z + (Math.random() - 0.5) * offset
        : (Math.random() - 0.5) * offset,
    vx: props.vx ?? 0,
    vy: props.vy ?? 0,
    vz: props.vz ?? 0,
    ...props,
  };

  const link = {
    source: parent.id,
    target: node.id,
    linkDistance,
    linkStrength: props.spawning ? 0 : 1.0,
    spawning: props.spawning ?? false,
    color: props.linkColor || "#ffffff11",
  };

  return { node, link };
}

export function buildContentNodes(actionNode, skillNode, linkDistance) {
  const nodes = [];
  const links = [];
  const baseSpawn = { spawning: true, spawnAge: 0 };

  if (actionNode.actionType === ActionType.PROFICIENCY) {
    const currentLevel = normalizeProficiency(skillNode.proficiency);
    Object.values(Proficiency).forEach((level) => {
      const { node, link } = createNodeAndLink(
        actionNode,
        `${CONTENT_PREFIX}${level}`,
        linkDistance,
        {
          label: PROFICIENCY_LABELS[level],
          nodeType: NodeType.CONTENT,
          actionType: ActionType.PROFICIENCY,
          shape: "circle",
          level,
          color: getProficiencyNodeColor(level, currentLevel),
          linkColor: "#ffffff22",
        },
      );
      nodes.push(node);
      links.push(link);
    });
  } else {
    const config = CONTENT_CONFIG[actionNode.actionType];
    if (config) {
      const items = config.fetch(skillNode);
      const shape = getActionNodeShape(actionNode.actionType);

      items.forEach((item, index) => {
        const { node, link } = createNodeAndLink(
          actionNode,
          `${CONTENT_PREFIX}${index}`,
          linkDistance,
          {
            nodeType: NodeType.CONTENT,
            actionType: actionNode.actionType,
            shape,
            ...baseSpawn,
            ...config.getProps(item),
          },
        );
        nodes.push(node);
        links.push(link);
      });

      // Add Button
      const { node, link } = createNodeAndLink(
        actionNode,
        `${CONTENT_PREFIX}add`,
        linkDistance,
        {
          label: "+ Add",
          nodeType: NodeType.ADD_BUTTON,
          shape: "circle",
          color: "#ffffff",
          ...baseSpawn,
        },
      );
      nodes.push(node);
      links.push(link);
    }
  }

  return { nodes, links };
}

export function buildActionNodes(skillNode, linkDistance) {
  const nodes = [];
  const links = [];

  Object.values(ActionType).forEach((actionType) => {
    const { node, link } = createNodeAndLink(
      skillNode,
      `${ACTION_PREFIX}${actionType}`,
      linkDistance,
      {
        label: ACTION_LABELS[actionType],
        nodeType: NodeType.ACTION,
        actionType,
        shape: getActionNodeShape(actionType),
        vx: 0,
        vy: 0,
        spawning: true,
        spawnAge: 0,
        color: "#94a3b8",
        linkColor: "#ffffff22",
      },
    );
    nodes.push(node);
    links.push(link);
  });

  return { nodes, links };
}

const CONTENT_CONFIG = {
  [ActionType.RESOURCE]: {
    fetch: (skill) =>
      useReferenceStore.getState().getResourcesForSkill(skill.label),
    getProps: (res) => ({
      label: res.title,
      url: res.url,
      color: getResourceNodeColor(),
    }),
  },
  [ActionType.ARTIFACT]: {
    fetch: (skill) => {
      const data = cvStore.getState().cvData;
      return (data?.artifacts || []).filter((a) =>
        a.skills?.includes(skill.label),
      );
    },
    getProps: (art) => ({
      label: art.type,
      url: art.url,
      color: getArtifactNodeColor(),
    }),
  },
  [ActionType.NOTE]: {
    fetch: () => [{ label: "Notes empty" }],
    getProps: () => ({ label: "Notes empty", color: "#a78bfa" }),
  },
};
