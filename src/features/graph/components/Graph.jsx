import { useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import ForceGraph3D from "react-force-graph-3d";
import { graphConfigStore } from "../store/graphConfigStore";
import { graphDataStore } from "../store/graphDataStore";
import { useGraphPhysics } from "../hooks/useGraphPhysics";
import { resolveNode2D } from "../graph2d/nodeStyleResolver2D";
import { renderNode2D } from "../graph2d/nodeRenderer2D";
import { resolveNode3D } from "../graph3d/nodeStyleResolver3D";
import { renderNode3D } from "../graph3d/nodeRenderer3D";

export default function Graph() {
  const fgRef = useRef(null);

  const graphData = graphDataStore((s) => s.graphData);
  const display = graphConfigStore((s) => s.display);
  const dimension = graphConfigStore((s) => s.display.dimension);

  const { onEngineTick } = useGraphPhysics(fgRef, dimension);

  const ref = useCallback((instance) => {
    fgRef.current = instance;
  }, []);

  const commonProps = {
    ref,
    graphData,
    d3AlphaDecay: 0.01,
    d3VelocityDecay: 0.3,
    onEngineTick: onEngineTick,
  };

  return dimension === "2d" ? (
    <ForceGraph2D
      {...commonProps}
      nodeCanvasObject={(node, ctx, scale) => {
        const style = resolveNode2D(node, scale, display);
        renderNode2D(node, ctx, scale, true, style);
      }}
      linkColor={(link) => link.color || "#fffa"}
    />
  ) : (
    <ForceGraph3D
      {...commonProps}
      showNavInfo={false}
      backgroundColor="#0000"
      nodeThreeObject={(node) => {
        const style = resolveNode3D(node, display);
        return renderNode3D(style);
      }}
    />
  );
}
