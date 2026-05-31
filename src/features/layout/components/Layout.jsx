import Graph from "../../graph/components/Graph";
import FloatingPanel from "./FloatingPanel";
import { layoutStore } from "../store/layoutStore";
import classes from "../styles/layout.module.css";

export default function Layout() {
  const modeKey = layoutStore((s) => s.activeMode);
  const mode = layoutStore((s) => s.modes[modeKey]);

  return (
    <div className={classes["layout-root"]}>
      <div className={classes["layout-canvas"]}>
        <Graph />
      </div>

      <div className={classes["layout-panel"]}>
        <FloatingPanel sections={mode.panel} useTools={mode.useTools} />
      </div>
    </div>
  );
}
