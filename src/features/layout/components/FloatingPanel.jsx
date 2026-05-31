import { Accordion, Stack, Group, Text, Button } from "@mantine/core";
import { layoutStore, setMode } from "../store/layoutStore";

const MODE_BUTTONS = {
  graph: [
    { label: "Upload", mode: "upload" },
    { label: "Mentor", mode: "mentor" },
  ],
  upload: [{ label: "Graph", mode: "graph" }],
  mentor: [{ label: "Graph", mode: "graph" }],
};

export default function FloatingPanel({ sections, tools }) {
  const activeMode = layoutStore((s) => s.activeMode);
  const defaultOpen = sections.filter((s) => s.defaultOpen).map((s) => s.id);

  return (
    <Stack gap="xs">
      <ModeSwitcher activeMode={activeMode} />

      <Accordion
        multiple
        defaultValue={defaultOpen}
        variant="separated"
        radius="lg"
      >
        {sections.map((section) => (
          <Accordion.Item key={section.id} value={section.id}>
            <Accordion.Control fw={600} fz="sm">
              {section.label}
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                {section.tools.map((tool) => {
                  const state = tools[tool.id];
                  if (!state) return null;
                  return <ToolRow key={tool.id} tool={tool} state={state} />;
                })}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
}

function ModeSwitcher({ activeMode }) {
  return (
    <Group grow gap="xs">
      {MODE_BUTTONS[activeMode].map(({ label, mode }) => (
        <Button
          key={mode}
          variant="default"
          size="xs"
          radius="lg"
          onClick={() => setMode(mode)}
        >
          {label}
        </Button>
      ))}
    </Group>
  );
}

const layoutProps = {
  stack: { gap: 4, w: "100%" },
  row: { justify: "space-between", wrap: "nowrap", w: "100%" },
};

function ToolRow({ tool, state }) {
  const Component = tool.component;
  const Wrapper = tool.layout === "stack" ? Stack : Group;

  return (
    <Wrapper {...layoutProps[tool.layout]}>
      <Text size="xs" c="dimmed" fw={500}>
        {state.label ?? tool.label}
      </Text>
      <Component {...tool.props} {...state} />
    </Wrapper>
  );
}
