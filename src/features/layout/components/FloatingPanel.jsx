import React from "react";
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

export default function FloatingPanel({ sections, tools, useToolValue }) {
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
                {section.tools.map((tool) => (
                  <ToolRow
                    key={tool.id}
                    tool={tool}
                    tools={tools}
                    useToolValue={useToolValue}
                  />
                ))}
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

const ToolRow = React.memo(function ToolRow({ tool, tools, useToolValue }) {
  const Component = tool.component;
  const Wrapper = tool.layout === "stack" ? Stack : Group;

  if (tool.id === "reroll") {
    return (
      <Wrapper {...layoutProps[tool.layout]}>
        <Text size="xs" c="dimmed" fw={500}>
          {tool.label}
        </Text>

        <Component {...tool.props} onClick={tools.rerollStyles} />
      </Wrapper>
    );
  }

  const value = useToolValue(tool);

  const onChange = (v) => {
    if (tool.group === "display") {
      tools.updateDisplay(tool.id, v);
    }

    if (tool.group === "forces") {
      tools.updateForces(tool.id, v);
    }
  };

  return (
    <Wrapper {...layoutProps[tool.layout]}>
      <Text size="xs" c="dimmed" fw={500}>
        {tool.label}
      </Text>

      <Component {...tool.props} value={value} onChange={onChange} />
    </Wrapper>
  );
});
