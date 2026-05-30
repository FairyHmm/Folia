import ForceGraph2D from "react-force-graph-2d";
import { drawPillNode } from "../utils/renderNode";
import dummyData from "../../../shared/data/dummyData.json";

function Graph() {
  return (
    <ForceGraph2D
      graphData={dummyData}
      nodeCanvasObjectMode={() => "replace"}
      nodeCanvasObject={drawPillNode}
      linkColor={(link) => link.color}
      linkWidth={2}
      linkDirectionalParticles={0}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
    />
  );
}

export default Graph;
