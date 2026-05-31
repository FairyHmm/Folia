import { Group, Text, SegmentedControl, Slider, Switch } from "@mantine/core";
import FloatingPanel from "../../components/FloatingPanel"; // Adjust path to shared component
import { graphPanelSections } from "../utils/graphPanel";
import { layoutStore } from "../store/layoutStore";
// import { useGraphStore } from "../store/graphStore"; // Assuming you have a store for physics/filters

function GraphToolItem({ tool }) {
  // 1. View Toggle Type
  if (tool.type === "viewToggle") {
    const activeView = layoutStore((s) => s.activeView);
    const setView = layoutStore((s) => s.setView);

    return (
      <Group justify="space-between" wrap="nowrap" w="100%">
        <Text size="xs" fw={500} c="dimmed">{tool.label}</Text>
        <SegmentedControl
          size="xs"
          value={activeView}
          onChange={setView}
          data={[
            { label: "2D", value: "2d" },
            { label: "3D", value: "3d" },
          ]}
        />
      </Group>
    );
  }

  // 2. Boolean Switch Type (Labels, Arrows)
  if (tool.type === "toggle") {
    // Replace with your actual store hooks dynamically using tool.storeKey
    // const value = useGraphStore((s) => s[tool.storeKey]);
    // const setValue = useGraphStore((s) => s.setToggleValue);

    return (
      <Group justify="space-between" wrap="nowrap" w="100%">
        <Text size="xs" fw={500} c="dimmed">{tool.label}</Text>
        <Switch size="xs" aria-label={tool.label} />
      </Group>
    );
  }

  // 3. Numeric Slider Type (Charge, Distance, Gravity)
  if (tool.type === "slider") {
    return (
      <Group justify="space-between" wrap="nowrap" w="100%">
        <Text size="xs" fw={500} c="dimmed" style={{ flexShrink: 0 }}>
          {tool.label}
        </Text>
        <Slider
          size="xs"
          min={tool.min}
          max={tool.max}
          step={tool.type === "gravity" ? 0.05 : 1}
          w={120} // Fixed uniform width for input alignment inside the panel
        />
      </Group>
    );
  }

  // 4. Custom Graph Filter Type
  if (tool.type === "groupFilter") {
    return (
      <Group justify="space-between" wrap="nowrap" w="100%">
        <Text size="xs" fw={500} c="dimmed">{tool.label}</Text>
        {/* Render your group filter badge selector / menu here */}
      </Group>
    );
  }

  // Fallback for primitive text items
  return (
    <Group justify="space-between" wrap="nowrap" w="100%">
      <Text size="xs" fw={500} c="dimmed">{tool.label}</Text>
    </Group>
  );
}

// Concrete instance exported specifically for your network canvas views
export default function GraphPanel() {
  const panelConfig = { sections: graphPanelSections };

  return (
    <FloatingPanel
      config={panelConfig}
      renderTool={(tool) => <GraphToolItem key={tool.id} tool={tool} />}
    />
  );
}
