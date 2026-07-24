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
  onNodeHover,
  onNodeClick,
}) {
  const fgInternalRef = useRef(null);
  const displayRef = useRef(graphConfigStore.getState().display);

  useEffect(() => {
    const unsub = graphConfigStore.subscribe((state) => {
      displayRef.current = state.display;

      // ✅ FIX 1: Explicitly tell the 2D canvas to repaint right now
      fgInternalRef.current?.refresh();
    });

    return unsub;
  }, []);

  // Shared ref setter to keep references perfectly in sync
  const setRefs = useCallback(
    (instance) => {
      fgInternalRef.current = instance;
      if (typeof graphRef === "function") graphRef(instance);
      else if (graphRef) graphRef.current = instance;
    },
    [graphRef],
  );

  // 1. Fresh render cycle layout reader
  const nodeCanvasObject = useCallback((node, ctx, scale) => {
    const displayState = graphConfigStore.getState().display;
    const style = resolveNode2D(node, scale, displayState);
    renderNode2D(node, ctx, scale, true, style);
  }, []);

  // 2. 🎯 THE POINTER HITBOX RESOLVER: Fixes sizing & disables dragging on the glow
  const nodePointerAreaPaint = useCallback((node, color, ctx, scale) => {
    const displayState = graphConfigStore.getState().display;
    const style = resolveNode2D(node, scale, displayState);

    if (node.x == null || node.y == null) return;

    // We paint the hit testing path using the unique 'color' string provided by D3.
    // Notice we do NOT paint any glow or outer rings here! We only paint the structural core shape.
    ctx.fillStyle = color;
    ctx.beginPath();

    if (style.shape === "square") {
      const r = style.radius;
      ctx.rect(node.x - r, node.y - r, r * 2, r * 2);
    } else if (style.shape === "triangle") {
      const r = style.radius;
      ctx.moveTo(node.x, node.y - r);
      ctx.lineTo(node.x + r, node.y + r);
      ctx.lineTo(node.x - r, node.y + r);
      ctx.closePath();
    } else {
      // Circle core interaction hitbox mapping
      ctx.arc(node.x, node.y, style.radius, 0, Math.PI * 2);
    }

    ctx.fill();
  }, []);

  return (
    <ForceGraph2D
      {...commonProps}
      ref={graphRef}
      onEngineTick={onEngineTick}
      nodeCanvasObject={nodeCanvasObject}
      // ✅ Inject the pointer tracking template
      nodePointerAreaPaint={nodePointerAreaPaint}
      linkColor={onLinkColor}
      onNodeHover={onNodeHover}
      onNodeClick={onNodeClick}
    />
  );
});

export default Graph2D;
