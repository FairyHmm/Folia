import { memo, useCallback, useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { graphConfigStore } from "../store/graphConfigStore";
import { resolveNode2D } from "./nodeStyleResolver2D";
import { renderNode2D } from "./nodeRenderer2D";

const Graph2D = memo(function Graph2DWrapper({
  graphRef,
  commonProps,
  onEngineTick,
  onLinkColor,
  onNodeClick,
}) {
  const displayRef = useRef(graphConfigStore.getState().display);

  // 🔥 forces redraw when sliders change
  const [, forceRender] = useState(0);

  useEffect(() => {
    const unsub = graphConfigStore.subscribe((state) => {
      displayRef.current = state.display;
      forceRender((x) => x + 1);
    });

    return unsub;
  }, []);

  const nodeCanvasObject = useCallback((node, ctx, scale) => {
    const style = resolveNode2D(node, scale, displayRef.current);
    renderNode2D(node, ctx, scale, true, style);
  }, []);

  return (
    <ForceGraph2D
      {...commonProps}
      ref={graphRef}
      onEngineTick={onEngineTick}
      nodeCanvasObject={nodeCanvasObject}
      linkColor={onLinkColor}
      onNodeClick={onNodeClick}
    />
  );
});

export default Graph2D;
