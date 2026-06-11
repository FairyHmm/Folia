import { useRef, useCallback, useMemo, useEffect } from "react";
import { graphConfigStore } from "../store/graphConfigStore";
import { useCompiledGraph } from "../hooks/useCompiledGraph";
import { useGraphPhysics } from "../hooks/useGraphPhysics";
import { useNodeClick } from "../hooks/useNodeClick";
import Graph2D from "../graph2d/Graph2D";
import Graph3D from "../graph3d/Graph3D";

export default function Graph() {
  const fgRef = useRef(null);
  const dimension = graphConfigStore((s) => s.display.dimension);

  const { graphData, toggleSkill, toggleAction } = useCompiledGraph();

  const { onEngineTick, gentleReheat, resetReady, onGraphReady } =
    useGraphPhysics(fgRef, dimension);
  const onNodeClick = useNodeClick(gentleReheat, toggleSkill, toggleAction);

  useEffect(() => {
    resetReady?.();
    onGraphReady?.();
  }, [graphData, resetReady, onGraphReady]);

  const setGraphRef = useCallback((instance) => {
    fgRef.current = instance;
  }, []);

  const commonProps = useMemo(
    () => ({
      graphData,
      linkId: "id",
      d3AlphaDecay: 0.004,
      d3VelocityDecay: 0.3,
    }),
    [graphData],
  );

  const handleLinkColor = useCallback((link) => link.color || "#fff8", []);

  return dimension === "2d" ? (
    <Graph2D
      graphRef={setGraphRef}
      commonProps={commonProps}
      onEngineTick={onEngineTick}
      onLinkColor={handleLinkColor}
      onNodeClick={onNodeClick}
    />
  ) : (
    <Graph3D
      graphRef={setGraphRef}
      commonProps={commonProps}
      onEngineTick={onEngineTick}
      onNodeClick={onNodeClick}
    />
  );
}
