import { Transition } from "@mantine/core";
import { useRef } from "react";
import Graph from "../../graph/components/Graph";
import FloatingPanel from "./FloatingPanel";
import { useLayoutMode } from "../hooks/useLayoutMode";
import classes from "../styles/layout.module.css";

export default function Layout() {
  const { mode, tools, useToolValue, Overlay } = useLayoutMode();

  // Keep track of the last valid overlay component for the exit animation
  const lastOverlay = useRef(Overlay);
  if (Overlay) {
    lastOverlay.current = Overlay;
  }

  const RenderedOverlay = lastOverlay.current;

  // Safety check: If mode hasn't loaded yet, don't crash the app
  if (!mode) return null;

  return (
    <div className={classes["layout-root"]}>
      <div className={classes["layout-canvas"]}>
        <Graph />
      </div>

      {/* Only mount transition if Overlay exists and RenderedOverlay is a valid function/component */}
      <Transition mounted={!!Overlay} transition="fade" duration={200}>
        {(styles) => (
          <div className={classes["layout-overlay"]} style={styles}>
            {RenderedOverlay ? <RenderedOverlay /> : null}
          </div>
        )}
      </Transition>

      <div className={classes["layout-panel"]}>
        <FloatingPanel
          sections={mode.panel}
          tools={tools}
          useToolValue={useToolValue}
        />
      </div>
    </div>
  );
}
