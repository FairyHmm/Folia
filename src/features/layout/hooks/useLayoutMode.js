import { layoutStore } from "../store/layoutStore";
import { useGraphPanelTools } from "../../graph/hooks/useGraphPanelTools";
import { useGraphToolValue } from "../../graph/hooks/useGraphToolValue";

export function useLayoutMode() {
  const activeMode = layoutStore((s) => s.activeMode);
  const modes = layoutStore((s) => s.modes);
  const currentMode = modes[activeMode];

  const graphTools = useGraphPanelTools();
  const graphToolValue = useGraphToolValue;

  const tools = activeMode === "graph" ? graphTools : {};
  const useToolValue = activeMode === "graph" ? graphToolValue : () => undefined;

  return {
    mode: currentMode,
    tools,
    useToolValue,
    Overlay: currentMode.Overlay,
  };
}
