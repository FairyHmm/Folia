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
  getNoteNodeColor,
} from "./graphStyleTokens";
import { useReferenceStore } from "../../../shared/store/referenceStore";
import { cvStore } from "../../../shared/store/cvStore";
import { ACTION_PREFIX, CONTENT_PREFIX } from "./graphUtils";

function createNodeAndLink(parent, idSuffix, linkDistance, props = {}) {
  const offset = 2;

  const parentRadius = parent.radius || parent.val || 12;
  const dynamicallyScaledDistance = linkDistance + parentRadius * 1.5;

  let rx = (Math.random() - 0.5) * offset;
  let ry = (Math.random() - 0.5) * offset;
  let outwardVx = props.vx ?? 0;
  let outwardVy = props.vy ?? 0;

  if (props.angle !== undefined) {
    const spawnDistance = parentRadius + 4;
    rx = Math.cos(props.angle) * spawnDistance;
    ry = Math.sin(props.angle) * spawnDistance;
    outwardVx = Math.cos(props.angle) * 0.4;
    outwardVy = Math.sin(props.angle) * 0.4;
  }

  const node = {
    id: `${parent.id}${idSuffix}`,
    parentId: parent.id,
    x: parent.x != null ? parent.x + rx : rx,
    y: parent.y != null ? parent.y + ry : ry,
    z:
      parent.z != null
        ? parent.z + (Math.random() - 0.5) * offset
        : (Math.random() - 0.5) * offset,
    vx: outwardVx,
    vy: outwardVy,
    vz: props.vz ?? 0,
    ...props,
  };

  delete node.angle;

  const link = {
    source: parent.id,
    target: node.id,
    linkDistance: dynamicallyScaledDistance,
    linkStrength: props.spawning ? 0.2 : 1.0,
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
    const levels = Object.values(Proficiency);
    const currentLevel = normalizeProficiency(skillNode.proficiency);

    levels.forEach((level, index) => {
      const arcAngle = (index / (levels.length - 1 || 1)) * Math.PI;

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
          angle: arcAngle,
          color: getProficiencyNodeColor(level, currentLevel),
          linkColor: "#ffffff22",
          ...baseSpawn,
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
      const hasAddButton = config.hasAddButton;

      const totalElements = items.length + (hasAddButton ? 1 : 0);
      const denominator = totalElements || 1;

      items.forEach((item, index) => {
        const spokeAngle = (index / denominator) * (Math.PI * 2);

        const { node, link } = createNodeAndLink(
          actionNode,
          `${CONTENT_PREFIX}${index}`,
          linkDistance,
          {
            nodeType: NodeType.CONTENT,
            actionType: actionNode.actionType,
            shape,
            angle: spokeAngle,
            ...baseSpawn,
            ...config.getProps(item),
          },
        );
        nodes.push(node);
        links.push(link);
      });

      if (hasAddButton) {
        const addAngle = ((totalElements - 1) / denominator) * (Math.PI * 2);
        const { node, link } = createNodeAndLink(
          actionNode,
          `${CONTENT_PREFIX}add`,
          linkDistance,
          {
            label: "+ Add",
            nodeType: NodeType.ADD_BUTTON,
            shape: "circle",
            color: "#ffffff",
            angle: addAngle,
            ...baseSpawn,
          },
        );
        nodes.push(node);
        links.push(link);
      }
    }
  }

  return { nodes, links };
}

export function buildActionNodes(skillNode, linkDistance) {
  const nodes = [];
  const links = [];
  const actions = Object.values(ActionType);

  actions.forEach((actionType, index) => {
    const radialAngle = (index / actions.length) * (Math.PI * 2);

    const { node, link } = createNodeAndLink(
      skillNode,
      `${ACTION_PREFIX}${actionType}`,
      linkDistance,
      {
        label: ACTION_LABELS[actionType],
        nodeType: NodeType.ACTION,
        actionType,
        shape: getActionNodeShape(actionType),
        angle: radialAngle,
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
    hasAddButton: false,
    fetch: (skill) => {
      const currentLevel = normalizeProficiency(skill.proficiency);
      const all = useReferenceStore
        .getState()
        .getResourcesForSkill(skill.label);
      return all.filter((r) => {
        const min = Proficiency[r.minProficiency] ?? Proficiency.UNKNOWN;
        return currentLevel >= min;
      });
    },
    getProps: (res) => ({
      label: res.title,
      url: res.url,
      color: getResourceNodeColor(),
    }),
  },

  [ActionType.ARTIFACT]: {
    hasAddButton: true,
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
    hasAddButton: true,
    fetch: (skill) => {
      const data = cvStore.getState().cvData;
      return (data?.notes || []).filter((n) => n.skillId === skill.id);
    },
    getProps: (note) => ({
      label: note.text,
      noteId: note.id,
      color: getNoteNodeColor(),
    }),
  },
};
