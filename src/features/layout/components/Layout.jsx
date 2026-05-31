import { Transition } from "@mantine/core";
import { useRef } from "react";
import Graph from "../../graph/components/Graph";
import FloatingPanel from "./FloatingPanel";
import { useLayoutMode } from "../hooks/useLayoutMode";
import classes from "../styles/layout.module.css";

export default function Layout() {
  const { mode, tools, Overlay } = useLayoutMode();
  const lastOverlay = useRef(Overlay);
  if (Overlay) lastOverlay.current = Overlay;
  const RenderedOverlay = lastOverlay.current;

  return (
    <div className={classes["layout-root"]}>
      <div className={classes["layout-canvas"]}>
        <Graph />
      </div>

      <Transition mounted={!!Overlay} transition="fade" duration={200}>
        {(styles) => (
          <div className={classes["layout-overlay"]} style={styles}>
            <RenderedOverlay />
          </div>
        )}
      </Transition>

      <div className={classes["layout-panel"]}>
        <FloatingPanel sections={mode.panel} tools={tools} />
      </div>
    </div>
  );
}
