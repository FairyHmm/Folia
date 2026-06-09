import { ActionType, NodeType, Proficiency } from "../../../shared/utils/cvConstants";
import { ACTION_SHAPE, PROFICIENCY_COLOR } from "./graphStyleTokens";
import { graphConfigStore } from "../store/graphConfigStore";

const ACTION_PREFIX  = "__action__";
const CONTENT_PREFIX = "__content__";

export function actionNodeId(skillId, actionType) {
  return `${skillId}${ACTION_PREFIX}${actionType}`;
}

export function contentNodeId(actionId) {
  return `${actionId}${CONTENT_PREFIX}`;
}

const ACTION_LABELS = {
  [ActionType.PROFICIENCY]: "proficiency",
  [ActionType.RESOURCE]:    "resources",
  [ActionType.NOTE]:        "notes",
  [ActionType.ARTIFACT]:    "artifacts",
};

const PROFICIENCY_KEY = Object.fromEntries(
  Object.entries(Proficiency).map(([k, v]) => [k, v])
);

function normalizeProficiency(value) {
  if (value == null) return Proficiency.UNKNOWN;
  if (typeof value === "number") return value;
  return PROFICIENCY_KEY[value] ?? Proficiency.UNKNOWN;
}

export function buildActionNodes(skillNode) {
  const distance = graphConfigStore.getState().forces.distance;
  const linkDistance = distance * 0.22;
  const actionTypes = Object.values(ActionType);
  const nodes = [];
  const links = [];

  actionTypes.forEach((actionType) => {
    const id = actionNodeId(skillNode.id, actionType);

    nodes.push({
      id,
      label:    ACTION_LABELS[actionType],
      nodeType: NodeType.ACTION,
      actionType,
      shape:    ACTION_SHAPE[actionType],
      parentId: skillNode.id,
      x:  skillNode.x ?? 0,
      y:  skillNode.y ?? 0,
      z:  skillNode.z ?? 0,
      vx: 0,
      vy: 0,
      spawning:  true,
      spawnAge:  0,
    });

    links.push({
      source:       skillNode.id,
      target:       id,
      linkDistance,
      linkStrength: 1.0,
      color:        "#ffffff22",
    });
  });

  return { nodes, links };
}

export function buildContentNode(actionNode, skillNode) {
  const id = contentNodeId(actionNode.id);
  const distance = graphConfigStore.getState().forces.distance;
  const linkDistance = distance * 0.22;

  const currentProficiency = normalizeProficiency(skillNode.proficiency);
  const nextProficiency = (currentProficiency + 1) % (Proficiency.EXPERT + 1);

  const node = {
    id,
    label:      "",
    nodeType:   NodeType.CONTENT,
    actionType: actionNode.actionType,
    shape:      actionNode.shape,
    parentId:   actionNode.id,
    x:  actionNode.x ?? 0,
    y:  actionNode.y ?? 0,
    z:  actionNode.z ?? 0,
    vx: 0,
    vy: 0,
    spawning:  true,
    spawnAge:  0,
    ...(actionNode.actionType === ActionType.PROFICIENCY && {
      color:           PROFICIENCY_COLOR[nextProficiency],
      nextProficiency,
    }),
  };

  const link = {
    source:       actionNode.id,
    target:       id,
    linkDistance,
    linkStrength: 1.0,
    color:        "#ffffff11",
  };

  return { node, link };
}