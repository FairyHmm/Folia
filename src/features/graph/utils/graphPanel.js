import { Slider, Switch, SegmentedControl, Button } from "@mantine/core";

export const graphPanel = [
  {
    id: "display",
    label: "Display",
    defaultOpen: true,
    tools: [
      {
        id: "dimension",
        group: "display",
        label: "Dimension",
        component: SegmentedControl,
        layout: "row",
        props: {
          size: "xs",
          data: [
            { label: "2D", value: "2d" },
            { label: "3D", value: "3d" },
          ],
        },
      },
      // --- Core Node ---
      {
        id: "nodeSize",
        group: "display",
        label: "Node Size",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0.1, max: 5, step: 0.1 },
      },
      // --- Glow Layer ---
      {
        id: "glowSize",
        group: "display",
        label: "Glow Size",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0.5, max: 2, step: 0.05 },
      },
      {
        id: "glowOpacity",
        group: "display",
        label: "Glow Opacity",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 1, step: 0.05 },
      },
      // --- Ring Layer ---
      {
        id: "ringSize",
        group: "display",
        label: "Ring Size",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 1, max: 3, step: 0.1 },
      },
      {
        id: "ringThickness",
        group: "display",
        label: "Ring Thickness",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 1, max: 10, step: 0.5 },
      },
      {
        id: "ringOpacity",
        group: "display",
        label: "Ring Opacity",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 1, step: 0.05 },
      },
    ],
  },
  {
    id: "forces",
    label: "Forces",
    defaultOpen: false,
    tools: [
      {
        id: "charge",
        group: "forces",
        label: "Repel Force",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 20, step: 0.1 },
      },
      {
        id: "gravity",
        group: "forces",
        label: "Center Force",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 10, step: 0.1 },
      },
      {
        id: "distance",
        group: "forces",
        label: "Link Distance",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 10, max: 150, step: 5 },
      },
      {
        id: "linkStrength",
        group: "forces",
        label: "Link Force",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 1, step: 0.05 },
      },
    ],
  },
  {
    id: "interaction",
    label: "Interaction",
    defaultOpen: false,
    tools: [
      {
        id: "reroll",
        label: "Reroll Styles",
        component: Button,
        layout: "row",
        props: {
          size: "xs",
          variant: "default",
          children: "Reroll",
        },
      },
    ],
  },
];
