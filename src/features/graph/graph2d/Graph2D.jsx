import { memo, useCallback, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { graphConfigStore } from "../store/graphConfigStore";
import { resolveNode2D } from "./nodeStyleResolver2D";
import { renderNode2D } from "./nodeRenderer2D";

const Graph2D = memo(function Graph2DWrapper({
  graphRef,
  commonProps,
  onEngineTick,
  onLinkColor,
}) {
  const displayRef = useRef(graphConfigStore.getState().display);

  useEffect(() => {
    const unsub = graphConfigStore.subscribe((state) => {
      displayRef.current = state.display;
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
    />
  );
});

export default Graph2D;
