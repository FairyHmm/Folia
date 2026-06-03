import { useRef, useCallback, useMemo } from "react";
import { graphConfigStore } from "../store/graphConfigStore";
import { graphDataStore } from "../store/graphDataStore";
import { useGraphPhysics } from "../hooks/useGraphPhysics";
import Graph2D from "../graph2d/Graph2D";
import Graph3D from "../graph3d/Graph3D";

export default function Graph() {
  const fgRef = useRef(null);

  const graphData = graphDataStore((s) => s.graphData);
  const display = graphConfigStore((s) => s.display);
  const dimension = display.dimension;

  const { onEngineTick } = useGraphPhysics(fgRef, dimension);

  const setGraphRef = useCallback((instance) => {
    fgRef.current = instance;
  }, []);

  const commonProps = useMemo(
    () => ({
      graphData,
      d3AlphaDecay: 0.01,
      d3VelocityDecay: 0.3,
    }),
    [graphData],
  );

  const handleLinkColor = useCallback((link) => link.color || "#fffa", []);

  return dimension === "2d" ? (
    <Graph2D
      graphRef={setGraphRef}
      commonProps={commonProps}
      onEngineTick={onEngineTick}
      display={display}
      onLinkColor={handleLinkColor}
    />
  ) : (
    <Graph3D
      graphRef={setGraphRef}
      commonProps={commonProps}
      onEngineTick={onEngineTick}
      display={display}
    />
  );
}
