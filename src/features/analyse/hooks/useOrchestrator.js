import { useRef, useCallback, useEffect } from "react";
import { useAnalyseStore } from "../store/analyseStore";
import { extractTokens } from "../../../shared/utils/lineParser";
import { PHASES } from "../utils/analyseConfig";
import { wait } from "../utils/smoothScroll";
import { cvStore } from "../../../shared/store/cvStore";
import { setMode } from "../../layout/store/layoutStore";
import { graphDataStore } from "../../../shared/store/graphDataStore";
import { useReadingPhase } from "./useReadingPhase";
import { useFlyingPhase } from "./useFlyingPhase";
import { ANALYSE_CONFIG } from "../utils/analyseConfig";

export function useOrchestrator(paperRef, containerRef, snap) {
  // Holds the cancellation token for whichever run is currently active, so a
  // second invocation of run() (e.g. React StrictMode's dev-mode double
  // effect-invoke, or a legitimate re-trigger) cancels the previous one
  // instead of racing it. Racing manifested as two concurrent reading-phase
  // loops fighting over scroll position — the "scrolls up and down, never
  // ends" bug.
  const activeToken = useRef(null);
  const runReading = useReadingPhase(paperRef);
  const runFlying = useFlyingPhase(paperRef, containerRef, snap);

  const run = useCallback(async () => {
    if (activeToken.current) activeToken.current.current = true; // cancel any prior run
    const cancelled = { current: false };
    activeToken.current = cancelled;

    graphDataStore.getState().clearGraph();
    useAnalyseStore.getState().resetAnalyse();
    useAnalyseStore.getState().setPhase(PHASES.READING);

    const cvData = cvStore.getState().cvData;
    const lines = cvData?.lines ?? [];
    const allTokens = extractTokens(lines);

    // TEMP DEBUG — remove once the empty-graph issue is confirmed fixed.
    console.log("[orchestrator debug] cvData:", cvData);
    console.log(
      "[orchestrator debug] lines:", lines.length,
      "allTokens:", allTokens.length,
    );

    if (!lines.length) return;

    await runReading(lines, cancelled);

    if (cancelled.current) return;
    useAnalyseStore.getState().setPhase(PHASES.FLYING);
    await wait(100); // give React time to mount FlyingTokens

    await runFlying(cvData, allTokens, cancelled);

    if (cancelled.current) return;
    useAnalyseStore.getState().setPhase(PHASES.DONE);

    await wait(ANALYSE_CONFIG.FADE_DURATION * 0.5 + 300);
    setMode("graph");
  }, [runReading, runFlying]);

  useEffect(() => {
    return () => {
      if (activeToken.current) activeToken.current.current = true;
    };
  }, []);

  return { run };
}
