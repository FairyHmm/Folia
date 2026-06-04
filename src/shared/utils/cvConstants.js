export const Proficiency = {
  UNKNOWN: 0,
  INTERESTED: 1,
  BASIC: 2,
  EXPERIENCED: 3,
  EXPERT: 4,
};

export const Relevance = {
  NEGLIGIBLE: 1,
  LOW: 2,
  MODERATE: 3,
  HIGH: 4,
  CRITICAL: 5,
};

export const StructuralTier = {
  ROLE: { type: "role", tier: 1 },
  DOMAIN: { type: "domain", tier: 2 },
  MODULE: { type: "module", tier: 3 },
  SKILL: { type: "skill", tier: 4 },
};

export const ActionType = {
  PROFICIENCY: "proficiency",
  RESOURCE: "resource",
  NOTE: "note",
  ARTIFACT: "artifact",
};

export const ArtifactType = {
  GITHUB: "github",
  DESIGN: "design",
  CERTIFICATE: "certificate",
  COURSE: "course",
  OTHER: "other",
};

export const ResourceType = {
  ARTICLE: "article",
  VIDEO: "video",
  COURSE: "course",
  DOCUMENTATION: "documentation",
};
