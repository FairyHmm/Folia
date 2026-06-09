import {
  ActionType,
  NodeType,
  Proficiency,
} from "../../../shared/utils/cvConstants";
import { ACTION_SHAPE, PROFICIENCY_COLOR } from "./graphStyleTokens";
import { graphConfigStore } from "../store/graphConfigStore";

const ACTION_PREFIX = "__action__";
const CONTENT_PREFIX = "__content__";

export function actionNodeId(skillId, actionType) {
  return `${skillId}${ACTION_PREFIX}${actionType}`;
}

export function contentNodeId(actionId) {
  return `${actionId}${CONTENT_PREFIX}`;
}

const ACTION_LABELS = {
  [ActionType.PROFICIENCY]: "proficiency",
  [ActionType.RESOURCE]: "resources",
  [ActionType.NOTE]: "notes",
  [ActionType.ARTIFACT]: "artifacts",
};

const PROFICIENCY_LABELS = {
  [Proficiency.UNKNOWN]: "Unknown",
  [Proficiency.INTERESTED]: "Interested",
  [Proficiency.BASIC]: "Basic",
  [Proficiency.EXPERIENCED]: "Experienced",
  [Proficiency.EXPERT]: "Expert",
};

const PROFICIENCY_KEY = Object.fromEntries(
  Object.entries(Proficiency).map(([k, v]) => [k, v]),
);

function normalizeProficiency(value) {
  if (value == null) return Proficiency.UNKNOWN;
  if (typeof value === "number") return value;
  return PROFICIENCY_KEY[value] ?? Proficiency.UNKNOWN;
}

export function buildContentNodes(actionNode, skillNode) {
  const distance = graphConfigStore.getState().forces.distance;
  const linkDistance = distance * 0.22;
  const nodes = [];
  const links = [];

  // 1. PROFICIENCY: Spawn 5 nodes (one for each level)
  if (actionNode.actionType === ActionType.PROFICIENCY) {
    const levels = [
      Proficiency.UNKNOWN,
      Proficiency.INTERESTED,
      Proficiency.BASIC,
      Proficiency.EXPERIENCED,
      Proficiency.EXPERT,
    ];

    levels.forEach((level) => {
      const id = `${actionNode.id}${CONTENT_PREFIX}${level}`;
      const isCurrent = skillNode.proficiency === level;

      nodes.push({
        id,
        label: PROFICIENCY_LABELS[level],
        nodeType: NodeType.CONTENT,
        actionType: ActionType.PROFICIENCY,
        shape: "circle", // Commit 1: Force circle
        parentId: actionNode.id,
        x: actionNode.x,
        y: actionNode.y,
        z: actionNode.z,
        level: level, // Used to update parent on click
        spawning: true,
        spawnAge: 0,
        // Temporary visual cue: White if selected, Grey if not
        color: isCurrent ? "#ffffff" : "#94a3b8",
      });

      links.push({
        source: actionNode.id,
        target: id,
        linkDistance,
        linkStrength: 1.0,
        color: "#ffffff22",
      });
    });
  }
  // 2. OTHERS: Placeholder to prove interaction works
  else {
    const id = `${actionNode.id}${CONTENT_PREFIX}0`;

    nodes.push({
      id,
      label: "No content yet",
      nodeType: NodeType.CONTENT,
      actionType: actionNode.actionType,
      shape: "circle", // Commit 1: Force circle
      parentId: actionNode.id,
      x: actionNode.x,
      y: actionNode.y,
      z: actionNode.z,
      spawning: true,
      spawnAge: 0,
      color: "#94a3b8",
    });

    links.push({
      source: actionNode.id,
      target: id,
      linkDistance,
      linkStrength: 1.0,
      color: "#ffffff11",
    });
  }

  return { nodes, links };
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
      label: getActionLabel(actionType), // Ensure you have this helper or use a string map
      nodeType: NodeType.ACTION,
      actionType,
      shape: "circle", // Commit 1: Force circle
      parentId: skillNode.id,
      x: skillNode.x ?? 0,
      y: skillNode.y ?? 0,
      z: skillNode.z ?? 0,
      vx: 0,
      vy: 0,
      spawning: true,
      spawnAge: 0,
      color: "#94a3b8", // Default action color
    });

    links.push({
      source: skillNode.id,
      target: id,
      linkDistance,
      linkStrength: 1.0,
      color: "#ffffff22",
    });
  });

  return { nodes, links };
}

// Helper if you don't have it
function getActionLabel(type) {
  switch (type) {
    case ActionType.PROFICIENCY:
      return "Proficiency";
    case ActionType.RESOURCE:
      return "Resources";
    case ActionType.NOTE:
      return "Notes";
    case ActionType.ARTIFACT:
      return "Artifacts";
    default:
      return "Action";
  }
}
