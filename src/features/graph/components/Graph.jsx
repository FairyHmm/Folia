import { useRef } from "react";
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
  const ref = useRef(null);

  const graphData = graphDataStore((s) => s.graphData);
  const display = graphConfigStore((s) => s.display);
  const dimension = graphConfigStore((s) => s.display.dimension);

  useGraphPhysics(ref);

  const commonProps = {
    ref,
    graphData,
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
