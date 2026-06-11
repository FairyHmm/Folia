import { useCallback } from "react";
import { useAnalyseStore } from "../store/analyseStore";
import { ANALYSE_CONFIG } from "../utils/analyseConfig";
import { smoothScrollTo, wait } from "../utils/smoothScroll";
import { getLineWords } from "../../../shared/utils/lineParser";

const SCROLL_TOP_PADDING = 16;
const MAX_SPEED_MULTIPLIER = 1.5;

export function useReadingPhase(paperRef) {
  return useCallback(
    async (lines, cancelled) => {
      // total words based on exact rendered words
      const totalWords = lines.reduce(
        (sum, line) => sum + getLineWords(line, {}).length,
        0,
      );

      let revealedWords = 0;

      const getSpeedMultiplier = () => {
        const progress = revealedWords / Math.max(totalWords, 1);
        const eased = progress * progress; // ease-in acceleration
        return 1 + eased * (MAX_SPEED_MULTIPLIER - 1);
      };

      for (let li = 0; li < lines.length; li++) {
        if (cancelled.current) return;

        const words = getLineWords(lines[li], {});
        const wordCount = words.length;

        for (let wi = 1; wi <= wordCount; wi++) {
          if (cancelled.current) return;

          useAnalyseStore.getState().revealWord(li, wi);
          revealedWords++;

          const speedMultiplier = getSpeedMultiplier();
          await wait(ANALYSE_CONFIG.WORD_INTERVAL / speedMultiplier);
        }

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
              lineEl.offsetTop - SCROLL_TOP_PADDING,
            );
            useAnalyseStore.getState().addPageBreak(li, newScrollTop);

            const speedMultiplier = getSpeedMultiplier();
            await smoothScrollTo(
              paper,
              newScrollTop,
              ANALYSE_CONFIG.SCROLL_DURATION / speedMultiplier,
            );
          }
        }

        const speedMultiplier = getSpeedMultiplier();
        await wait(ANALYSE_CONFIG.LINE_PAUSE / speedMultiplier);
      }

      const paper = paperRef.current;
      if (paper) {
        const speedMultiplier = getSpeedMultiplier();
        await smoothScrollTo(
          paper,
          0,
          ANALYSE_CONFIG.SCROLL_DURATION / speedMultiplier,
        );
      }

      await wait(300 / getSpeedMultiplier());
    },
    [paperRef],
  );
}
