import { Slider, Switch, SegmentedControl, Button } from "@mantine/core";

export const graphPanel = [
  {
    id: "display",
    label: "Display",
    defaultOpen: true,
    tools: [
      {
        id: "dimension",
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
        label: "Node Size",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0.1, max: 3, step: 0.1 },
      },
      // --- Glow Layer ---
      {
        id: "glowSize",
        label: "Glow Size",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 5, step: 0.1 },
      },
      {
        id: "glowOpacity",
        label: "Glow Opacity",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 1, step: 0.05 },
      },
      // --- Ring Layer ---
      {
        id: "ringSize",
        label: "Ring Size",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 3, step: 0.1 },
      },
      {
        id: "ringThickness",
        label: "Ring Thickness",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0.5, max: 5, step: 0.5 },
      },
      {
        id: "ringOpacity",
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
        label: "Repel Force",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: -500, max: 0, step: 10 },
      },
      {
        id: "gravity",
        label: "Center Force",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 1, step: 0.01 },
      },
      {
        id: "distance",
        label: "Link Distance",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 10, max: 200, step: 5 },
      },
      {
        id: "linkStrength",
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
