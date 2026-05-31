import { Accordion, Stack, Group, Text } from "@mantine/core";

export default function FloatingPanel({ sections, useTools }) {
  const tools = useTools();
  const defaultOpen = sections.filter((s) => s.defaultOpen).map((s) => s.id);

  return (
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
                return (
                  <ToolRow key={tool.id} tool={tool} state={tools[tool.id]} />
                );
              })}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
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
