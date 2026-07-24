import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { graphConfigStore } from "../store/graphConfigStore";
import { useCompiledGraph } from "../hooks/useCompiledGraph";
import { useGraphPhysics } from "../hooks/useGraphPhysics";
import { useNodeClick } from "../hooks/useNodeClick";
import { isTransientNode } from "../utils/graphUtils";
import { setMode } from "../../layout/store/layoutStore";
import { lerp } from "../utils/animationUtils";
import Graph2D from "../graph2d/Graph2D";
import Graph3D from "../graph3d/Graph3D";
import NodePanel from "./NodePanel";

export default function Graph() {
  const fgRef = useRef(null);
  const dimension = graphConfigStore((s) => s.display.dimension);

  const {
    graphData,
    baseNodes,
    baseLinks,
    selectedSkillId,
    selectedSkill,
    selectSkill,
    clearSelection,
  } = useCompiledGraph();

  const { onEngineTick, gentleReheat, resetReady, onGraphReady } =
    useGraphPhysics(fgRef, dimension);
  const onNodeClick = useNodeClick(gentleReheat, selectSkill);

  useEffect(() => {
    resetReady?.();
    onGraphReady?.();
  }, [graphData, resetReady, onGraphReady]);

  // Hover previews focus the same way a click does, without committing to
  // a selection — hover wins while active, falling back to whatever's
  // selected once the pointer leaves.
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const activeFocusId = hoveredNodeId ?? selectedSkillId;

  // Repaint pulse: the canvas only redraws on-demand once physics has
  // settled (see Graph2D's manual .refresh() on config change), so without
  // this the style resolvers' smoothed dim/focus lerp would only ever
  // step once per external trigger instead of animating as a fade. This
  // keeps forcing repaints for a short window after focus changes so the
  // lerp actually gets to play out.
  const pulseFrameRef = useRef(null);
  const pulseRepaint = useCallback((durationMs = 500) => {
    if (pulseFrameRef.current) cancelAnimationFrame(pulseFrameRef.current);
    const start = performance.now();
    const step = (now) => {
      fgRef.current?.refresh?.();
      if (now - start < durationMs) {
        pulseFrameRef.current = requestAnimationFrame(step);
      } else {
        pulseFrameRef.current = null;
      }
    };
    pulseFrameRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => () => {
    if (pulseFrameRef.current) cancelAnimationFrame(pulseFrameRef.current);
  }, []);

  // Focus-dim in place: mutate the *same* node/link objects rather than
  // swapping in new ones (see useCompiledGraph.js for why), then pulse a
  // few repaints so the fade eases in smoothly. This keeps the live
  // simulation's positions and link source/target references intact —
  // hovering/selecting a node no longer resets or "disconnects" the graph.
  useEffect(() => {
    const neighborhood = activeFocusId ? new Set([activeFocusId]) : null;
    if (neighborhood) {
      baseLinks.forEach((l) => {
        const sourceId = typeof l.source === "object" ? l.source.id : l.source;
        const targetId = typeof l.target === "object" ? l.target.id : l.target;
        if (sourceId === activeFocusId) neighborhood.add(targetId);
        if (targetId === activeFocusId) neighborhood.add(sourceId);
      });
    }

    baseNodes.forEach((n) => {
      n.dimmed = neighborhood ? !neighborhood.has(n.id) : false;
    });
    baseLinks.forEach((l) => {
      if (!neighborhood) {
        l.dimmed = false;
        return;
      }
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      l.dimmed = !(neighborhood.has(sourceId) && neighborhood.has(targetId));
    });

    pulseRepaint();
  }, [activeFocusId, baseNodes, baseLinks, pulseRepaint]);

  const setGraphRef = useCallback((instance) => {
    fgRef.current = instance;
  }, []);

  const commonProps = useMemo(
    () => ({
      graphData,
      linkId: "id",
      // Previously 0.004 — far below d3's own default (~0.0228). Combined
      // with the ambient "drift" force continuously reinjecting velocity,
      // the simulation never actually cooled down, so the whole graph felt
      // like it never stopped moving. Raised close to default so it settles
      // into a stable layout; drift still adds a small amount of life on
      // top once at rest.
      d3AlphaDecay: 0.02,
      d3VelocityDecay: 0.35,
    }),
    [graphData],
  );

  // Every structural link previously rendered at one flat alpha (#fff8),
  // so the graph read as a wireframe rather than a web of varying bonds.
  // Scale opacity by relationship strength (falling back to a sensible
  // mid value) so stronger links visibly glow brighter than weak ones.
  // The dim/normal alpha itself is smoothed per-link (same idea as the
  // node style resolvers' `focus` lerp) so links fade instead of snapping.
  const linkFocusRef = useRef(new Map());
  const handleLinkColor = useCallback((link) => {
    const key =
      link.id ??
      `${typeof link.source === "object" ? link.source.id : link.source}-${
        typeof link.target === "object" ? link.target.id : link.target
      }`;
    const targetFocus = link.dimmed ? 0 : 1;
    const prevFocus = linkFocusRef.current.get(key) ?? targetFocus;
    const focus = lerp(prevFocus, targetFocus, 0.15);
    linkFocusRef.current.set(key, focus);

    if (link.color) return link.color;
    const strength = link.linkStrength ?? 0.6;
    const baseAlphaFraction = Math.min(1, Math.max(0.18, strength));
    const alphaFraction = lerp(0.047, baseAlphaFraction, focus);
    const alpha = Math.round(alphaFraction * 255)
      .toString(16)
      .padStart(2, "0");
    return `#c9d4f0${alpha}`;
  }, []);

  // Nothing previously signalled that a node was clickable until you'd
  // already clicked it — flip the cursor on hover instead. Also drives
  // hover-focus dimming (see activeFocusId above).
  const [isHoveringNode, setIsHoveringNode] = useState(false);
  const handleNodeHover = useCallback((node) => {
    setIsHoveringNode(!!node);
    setHoveredNodeId(node?.id ?? null);
  }, []);

  // There was previously zero keyboard access to any node. Arrow keys move
  // a cycling cursor through the structural (non action/content) nodes,
  // Enter/Space activates the currently-selected one the same way a click
  // would. This doesn't yet render a distinct "keyboard focus" ring before
  // Enter is pressed — that would need a second highlight channel through
  // the style resolvers — so the only visible feedback right now is
  // whatever focus-mode dimming kicks in after activation.
  const structuralNodes = useMemo(
    () => graphData.nodes.filter((n) => !isTransientNode(n.id)),
    [graphData.nodes],
  );
  const keyboardIndexRef = useRef(-1);

  const handleKeyDown = useCallback(
    (e) => {
      if (!structuralNodes.length) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        keyboardIndexRef.current =
          (keyboardIndexRef.current + 1 + structuralNodes.length) %
          structuralNodes.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        keyboardIndexRef.current =
          (keyboardIndexRef.current - 1 + structuralNodes.length) %
          structuralNodes.length;
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (keyboardIndexRef.current < 0) keyboardIndexRef.current = 0;
        const node = structuralNodes[keyboardIndexRef.current];
        if (node) onNodeClick(node);
      }
    },
    [structuralNodes, onNodeClick],
  );

  const handleRecenter = useCallback(() => {
    fgRef.current?.zoomToFit?.(600, 60);
  }, []);

  // On first load, ease people into an unfamiliar network-graph view by
  // landing the camera near the target-role node — a sensible place to
  // start looking, not a "home" position the graph actually has. No
  // permanent button for this: a network graph has no canonical start to
  // teleport back to, and treating one node as special that way undercuts
  // the whole point of the layout. zoomToFit (below) is the one persistent
  // nav aid, matching design.md's "return to center" control.
  const startNode = useMemo(
    () => structuralNodes.find((n) => n.type === "role") ?? structuralNodes[0],
    [structuralNodes],
  );

  const goToStartNode = useCallback(() => {
    const fg = fgRef.current;
    const node = startNode;
    if (!fg || !node) return;
    if (dimension === "3d") {
      const distance = 120;
      const ratio = node.z
        ? 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1)
        : 1;
      fg.cameraPosition?.(
        {
          x: (node.x || 0) * ratio,
          y: (node.y || 0) * ratio,
          z: (node.z || 0) * ratio + distance,
        },
        node,
        700,
      );
    } else {
      fg.centerAt?.(node.x ?? 0, node.y ?? 0, 700);
      fg.zoom?.(2.2, 700);
    }
  }, [startNode, dimension]);

  // Previously: zero base nodes just rendered an empty void with the tool
  // panel floating over it — no cue that anything is supposed to happen
  // here. Guide instead of showing nothing.
  const isEmpty = structuralNodes.length === 0;

  // Auto-focus on the start node once the graph has actually settled with
  // real data, instead of leaving the camera wherever it happened to land
  // (or requiring a manual click just to find the anchor node).
  const hasAutoFocused = useRef(false);
  useEffect(() => {
    if (isEmpty || hasAutoFocused.current || !startNode) return;
    hasAutoFocused.current = true;
    const t = setTimeout(() => goToStartNode(), 900);
    return () => clearTimeout(t);
  }, [isEmpty, startNode, goToStartNode]);

  // TEMP DEBUG — remove after diagnosing the persistent empty-state overlay.
  useEffect(() => {
    console.log(
      "[Graph debug] baseNodes:", graphData.nodes.length,
      "structuralNodes:", structuralNodes.length,
      "isEmpty:", isEmpty,
    );
  }, [graphData.nodes.length, structuralNodes.length, isEmpty]);

  return (
    <div
      role="application"
      aria-label="Skill constellation graph. Arrow keys to move between skills, Enter to open."
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor: isHoveringNode ? "pointer" : "default",
        outline: "none",
      }}
    >
      {dimension === "2d" ? (
        <Graph2D
          graphRef={setGraphRef}
          commonProps={commonProps}
          onEngineTick={onEngineTick}
          onLinkColor={handleLinkColor}
          onNodeHover={handleNodeHover}
          onNodeClick={onNodeClick}
        />
      ) : (
        <Graph3D
          graphRef={setGraphRef}
          commonProps={commonProps}
          onEngineTick={onEngineTick}
          onLinkColor={handleLinkColor}
          onNodeHover={handleNodeHover}
          onNodeClick={onNodeClick}
        />
      )}

      {isEmpty && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            pointerEvents: "none",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <div style={{ color: "#c9d4f0", fontSize: 15, fontWeight: 500 }}>
            This is what your CV becomes.
          </div>
          <div style={{ color: "#c9d4f099", fontSize: 13, maxWidth: 320 }}>
            Drop your CV in to build your own constellation.
          </div>
          <button
            type="button"
            onClick={() => setMode("upload")}
            style={{
              pointerEvents: "auto",
              marginTop: 4,
              padding: "8px 18px",
              borderRadius: 999,
              border: "1px solid #ffffff2a",
              background: "#00000055",
              color: "#c9d4f0",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              backdropFilter: "blur(6px)",
            }}
          >
            Submit your resume
          </button>
        </div>
      )}

      {!isEmpty && (
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Return to center"
          title="Return to center"
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            zIndex: 30,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid #ffffff2a",
            background: "#00000055",
            color: "#c9d4f0",
            backdropFilter: "blur(6px)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⌖
        </button>
      )}

      {selectedSkill && (
        <NodePanel skill={selectedSkill} onClose={clearSelection} />
      )}
    </div>
  );
}
