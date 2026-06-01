import { Slider, Switch, SegmentedControl, Button } from "@mantine/core";

export const graphPanel = [
  {
    id: "view",
    label: "View",
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
      {
        id: "labels",
        label: "Labels",
        component: Switch,
        layout: "row",
        props: { size: "xs" },
      },
    ],
  },
  {
    id: "style",
    label: "Style",
    defaultOpen: true,
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
  {
    id: "physics",
    label: "Physics",
    defaultOpen: false,
    tools: [
      {
        id: "charge",
        label: "Charge",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: -500, max: -10 },
      },
      {
        id: "distance",
        label: "Distance",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 10, max: 200 },
      },
      {
        id: "gravity",
        label: "Gravity",
        component: Slider,
        layout: "stack",
        props: { size: "xs", min: 0, max: 1, step: 0.01 },
      },
    ],
  },
];
