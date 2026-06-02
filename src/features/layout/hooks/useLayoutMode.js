import { layoutStore } from "../store/layoutStore";

export function useLayoutMode() {
  const activeMode = layoutStore((s) => s.activeMode);
  const modes = layoutStore((s) => s.modes);

  const currentMode = modes[activeMode];

  const graphTools = modes.graph.useTools();
  const uploadTools = modes.upload.useTools();
  const mentorTools = modes.mentor.useTools();

  const tools =
    activeMode === "graph" ? graphTools :
    activeMode === "upload" ? uploadTools :
    mentorTools;

  return {
    mode: currentMode,
    tools: tools,
    useToolValue: currentMode.useToolValue,
    Overlay: currentMode.Overlay,
  };
}
