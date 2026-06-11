import { memo, useCallback, useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { graphConfigStore } from "../store/graphConfigStore";
import { resolveNode3D } from "./nodeStyleResolver3D";
import { renderNode3D } from "./nodeRenderer3D";

const Graph3D = memo(function Graph3DWrapper({
  graphRef,
  commonProps,
  onEngineTick,
  onNodeClick,
}) {
  const fgInternalRef = useRef(null);
  const displayRef = useRef(graphConfigStore.getState().display);

  useEffect(() => {
    const unsub = graphConfigStore.subscribe((state) => {
      displayRef.current = state.display;

      // IMPORTANT: force graph refresh so nodeThreeObject re-evaluates
      fgInternalRef.current?.refresh?.();
    });

    return unsub;
  }, []);

  const setRefs = useCallback(
    (instance) => {
      fgInternalRef.current = instance;
      if (typeof graphRef === "function") graphRef(instance);
      else if (graphRef) graphRef.current = instance;
    },
    [graphRef],
  );

  // ❗ NO useCallback (must stay fresh)
  const nodeThreeObject = (node) => {
    const style = resolveNode3D(node, displayRef.current);
    return renderNode3D(style);
  };

  return (
    <ForceGraph3D
      {...commonProps}
      ref={setRefs}
      onEngineTick={onEngineTick}
      showNavInfo={false}
      backgroundColor="#0000"
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={false}
      onNodeClick={onNodeClick}
    />
  );
});

export default Graph3D;
