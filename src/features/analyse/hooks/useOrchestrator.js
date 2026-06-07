import { useRef, useCallback, useEffect } from "react";
import { useAnalyseStore } from "../store/analyseStore";
import { extractTokens } from "../../../shared/utils/lineParser";
import { PHASES } from "../utils/analyseConfig";
import { wait } from "../utils/smoothScroll";
import { cvStore } from "../../../shared/store/cvStore";
import { setMode } from "../../layout/store/layoutStore";
import { useReadingPhase } from "./useReadingPhase";
import { useFlyingPhase } from "./useFlyingPhase";
import { ANALYSE_CONFIG } from "../utils/analyseConfig";

export function useOrchestrator(paperRef, containerRef, snap) {
  const cancelled = useRef(false);
  const runReading = useReadingPhase(paperRef);
  const runFlying = useFlyingPhase(paperRef, containerRef, snap);

  const run = useCallback(async () => {
    cancelled.current = false;
    useAnalyseStore.getState().resetAnalyse();
    useAnalyseStore.getState().setPhase(PHASES.READING);

    const cvData = cvStore.getState().cvData;
    const lines = cvData?.lines ?? [];
    const allTokens = extractTokens(lines);

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
      cancelled.current = true;
    };
  }, []);

  return { run };
}
