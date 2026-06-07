import { useCallback } from "react";
import { useAnalyseStore } from "../store/analyseStore";
import { ANALYSE_CONFIG } from "../utils/analyseConfig";
import { smoothScrollTo, wait } from "../utils/smoothScroll";

const SCROLL_TOP_PADDING = 16;

export function useReadingPhase(paperRef) {
  return useCallback(
    async (lines, cancelled) => {
      for (let li = 0; li < lines.length; li++) {
        if (cancelled.current) return;

        const wordCount = lines[li].trim().split(/\s+/).length;

        for (let wi = 1; wi <= wordCount; wi++) {
          if (cancelled.current) return;
          useAnalyseStore.getState().revealWord(li, wi);
          await wait(ANALYSE_CONFIG.WORD_INTERVAL);
        }

        await wait(50);
        const paper = paperRef.current;
        if (!paper) return;

        const lineEl = paper.querySelectorAll("p")[li];
        if (lineEl) {
          const lineBottom =
            lineEl.offsetTop + lineEl.offsetHeight - paper.scrollTop;
          const threshold = paper.clientHeight * 0.72;

          if (lineBottom >= threshold) {
            const newScrollTop = Math.max(
              0,
              lineEl.offsetTop - SCROLL_TOP_PADDING
            );
            useAnalyseStore.getState().addPageBreak(li, newScrollTop);
            await smoothScrollTo(
              paper,
              newScrollTop,
              ANALYSE_CONFIG.SCROLL_DURATION
            );
          }
        }

        await wait(ANALYSE_CONFIG.LINE_PAUSE);
      }

      // Scroll back to top before handing off to fly phase
      const paper = paperRef.current;
      if (paper)
        await smoothScrollTo(paper, 0, ANALYSE_CONFIG.SCROLL_DURATION);
      await wait(300);
    },
    [paperRef]
  );
}
