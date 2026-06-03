import { memo } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { resolveNode3D } from "./nodeStyleResolver3D";
import { renderNode3D } from "./nodeRenderer3D";

const Graph3D = memo(function Graph3DWrapper({
  graphRef,
  commonProps,
  onEngineTick,
  display,
}) {
  return (
    <ForceGraph3D
      {...commonProps}
      ref={graphRef}
      onEngineTick={onEngineTick}
      showNavInfo={false}
      backgroundColor="#0000"
      nodeThreeObject={(node) => {
        const style = resolveNode3D(node, display);
        return renderNode3D(style);
      }}
    />
  );
});

export default Graph3D;
