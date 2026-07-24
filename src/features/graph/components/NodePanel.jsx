import { Stack, Group, Text, Button, ScrollArea, Divider } from "@mantine/core";
import { useReferenceStore } from "../../../shared/store/referenceStore";
import { cvStore, updateSkillProficiency } from "../../../shared/store/cvStore";
import { Proficiency } from "../../../shared/utils/cvConstants";
import {
  PROFICIENCY_LABELS,
  PROFICIENCY_COLOR,
  normalizeProficiency,
} from "../utils/graphStyleTokens";

export default function NodePanel({ skill, onClose }) {
  const cvData = cvStore((s) => s.cvData);
  const allResources = useReferenceStore((s) => s.resources);

  if (!skill) return null;

  const currentLevel = normalizeProficiency(skill.proficiency);

  const resources = (allResources[skill.label] || []).filter((r) => {
    const min = Proficiency[r.minProficiency] ?? Proficiency.UNKNOWN;
    return currentLevel >= min;
  });

  const artifacts = (cvData?.artifacts || []).filter((a) =>
    a.skills?.includes(skill.label),
  );

  const notes = (cvData?.notes || []).filter((n) => n.skillId === skill.id);

  return (
    <div style={panelWrapperStyle}>
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <Text fw={700} size="lg" c="#edf2f7" lineClamp={2}>
          {skill.label}
        </Text>
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          onClick={onClose}
          aria-label="Close panel"
        >
          ✕
        </Button>
      </Group>

      <Text size="xs" c="dimmed" fw={600} mb={6}>
        Proficiency
      </Text>
      <Group gap={6} mb="md" wrap="wrap">
        {Object.values(Proficiency).map((level) => (
          <Button
            key={level}
            size="xs"
            radius="xl"
            variant={level === currentLevel ? "filled" : "default"}
            color={level === currentLevel ? undefined : "gray"}
            style={
              level === currentLevel
                ? { backgroundColor: PROFICIENCY_COLOR[level], border: "none" }
                : {}
            }
            onClick={() => updateSkillProficiency(skill.id, level)}
          >
            {PROFICIENCY_LABELS[level]}
          </Button>
        ))}
      </Group>

      <Divider mb="sm" color="#ffffff1a" />

      <ScrollArea.Autosize mah="calc(100% - 160px)" type="auto">
        <Stack gap="lg">
          <Section title="Resources" empty="No resources yet for this level.">
            {resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" style={linkStyle}>
                {r.title}
              </a>
            ))}
          </Section>

          <Section title="Artifacts" empty="No artifacts linked yet.">
            {artifacts.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noreferrer" style={linkStyle}>
                {a.type}
              </a>
            ))}
          </Section>

          <Section title="Notes" empty="No notes yet.">
            {notes.map((n, i) => (
              <Text key={i} size="sm" c="#c9d4f0cc">
                {n.text}
              </Text>
            ))}
          </Section>
        </Stack>
      </ScrollArea.Autosize>
    </div>
  );
}

function Section({ title, empty, children }) {
  const items = Array.isArray(children) ? children : [children];
  const hasContent = items.filter(Boolean).length > 0;
  return (
    <div>
      <Text size="xs" c="dimmed" fw={600} mb={6}>
        {title}
      </Text>
      {hasContent ? (
        <Stack gap={6}>{children}</Stack>
      ) : (
        <Text size="xs" c="#c9d4f066">
          {empty}
        </Text>
      )}
    </div>
  );
}

const panelWrapperStyle = {
  position: "absolute",
  top: 20,
  right: 20,
  bottom: 20,
  width: 320,
  maxWidth: "calc(100% - 40px)",
  zIndex: 25,
  padding: "18px 18px",
  borderRadius: 16,
  border: "1px solid #ffffff2a",
  background: "#0b0a16cc",
  backdropFilter: "blur(10px)",
  color: "#c9d4f0",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const linkStyle = {
  color: "#5fa8e0",
  fontSize: 13,
  textDecoration: "none",
  wordBreak: "break-word",
};
