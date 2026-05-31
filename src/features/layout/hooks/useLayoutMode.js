import { layoutStore } from "../store/layoutStore";
import Upload from "../../upload/components/Upload";
import Mentor from "../../mentor/components/Mentor";

const OVERLAYS = {
  upload: Upload,
  mentor: Mentor,
};

export function useLayoutMode() {
  const modeKey = layoutStore((s) => s.activeMode);
  const modes = layoutStore((s) => s.modes);

  const allTools = {
    graph: modes.graph.useTools(),
    upload: modes.upload.useTools(),
    mentor: modes.mentor.useTools(),
  };

  return {
    mode: modes[modeKey],
    tools: allTools[modeKey],
    Overlay: OVERLAYS[modeKey] ?? null,
  };
}
