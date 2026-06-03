import { memo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { resolveNode2D } from "./nodeStyleResolver2D";
import { renderNode2D } from "./nodeRenderer2D";

const Graph2D = memo(function Graph2DWrapper({
  graphRef,
  commonProps,
  onEngineTick,
  display,
  onLinkColor,
}) {
  return (
    <ForceGraph2D
      {...commonProps}
      ref={graphRef}
      onEngineTick={onEngineTick}
      nodeCanvasObject={(node, ctx, scale) => {
        const style = resolveNode2D(node, scale, display);
        renderNode2D(node, ctx, scale, true, style);
      }}
      linkColor={onLinkColor}
    />
  );
});

export default Graph2D;
