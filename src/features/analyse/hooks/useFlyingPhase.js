import { useCallback } from "react";
import { useAnalyseStore } from "../store/analyseStore";
import { buildRevealData, getRelatedMissingNodes } from "../utils/revealQueueBuilder";
import { ANALYSE_CONFIG } from "../utils/analyseConfig";
import { smoothScrollTo, scrollToLine, wait } from "../utils/smoothScroll";
import { graphDataStore } from "../../../shared/store/graphDataStore";

function getPage(token, pageBreaks) {
  const li = token.lineIndex ?? 0;
  let page = 0;
  for (let i = 0; i < pageBreaks.length; i++) {
    if (li > pageBreaks[i]) page = i + 1;
    else break;
  }
  return page;
}

export function useFlyingPhase(paperRef, containerRef, snap) {
  return useCallback(
    async (cvData, allTokens, cancelled) => {
      const addNode = graphDataStore.getState().addNode;
      const { pageBreaks, pageScrollTops } = useAnalyseStore.getState();
      const { nodeMap, linkMap, mentionedIds, fullGraph } =
        buildRevealData(cvData, allTokens);

      // Map tokens to nodes in appearance order
      const tokensWithNodes = [];
      for (const token of allTokens) {
        const node = nodeMap.get(token.value);
        if (node) tokensWithNodes.push({ token, node });
      }

      // Bucket tokens by page
      const totalPages = pageBreaks.length + 1;
      const byPage = Array.from({ length: totalPages }, () => []);
      tokensWithNodes.forEach((item) => {
        byPage[getPage(item.token, pageBreaks)].push(item);
      });

      let interval = ANALYSE_CONFIG.BASE_FLY_INTERVAL;

      for (let pi = 0; pi < totalPages; pi++) {
        if (cancelled.current) return;
        const pageItems = byPage[pi];
        if (!pageItems.length) continue;

        // Scroll to this page's stored position
        const paper = paperRef.current;
        if (paper) {
          const targetScrollTop =
            pi === 0 ? 0 : (pageScrollTops[pi - 1] ?? 0);
          if (Math.abs(paper.scrollTop - targetScrollTop) > 2) {
            await smoothScrollTo(
              paper,
              targetScrollTop,
              ANALYSE_CONFIG.SCROLL_DURATION
            );
            await wait(300);
          }
        }

        // Snap positions for all currently visible tokens
        const positions = await snap(paperRef, containerRef, allTokens);
        useAnalyseStore.getState().replaceTokenPositions(positions);
        await wait(100);

        let lastTokenHadPosition = false;

        for (const { token, node } of pageItems) {
          if (cancelled.current) return;

          let hasPosition =
            !!useAnalyseStore.getState().tokenPositions[token.id];

          // Fallback: scroll minimally to bring the token into view, re-snap
          if (!hasPosition) {
            const paper = paperRef.current;
            if (paper) {
              const lineEl = paper.querySelectorAll("p")[token.lineIndex];
              if (lineEl) {
                await scrollToLine(paper, lineEl, ANALYSE_CONFIG.SCROLL_DURATION);
                const newPositions = await snap(paperRef, containerRef, allTokens);
                useAnalyseStore.getState().replaceTokenPositions(newPositions);
                await wait(100);
                hasPosition =
                  !!useAnalyseStore.getState().tokenPositions[token.id];
              }
            }
          }

          if (hasPosition) {
            lastTokenHadPosition = true;

            useAnalyseStore.getState().setTokenState(token.id, "hovering");
            await wait(ANALYSE_CONFIG.HOVER_DURATION);

            useAnalyseStore.getState().setTokenState(token.id, "flying");
            addNode(node, linkMap.get(node.id) ?? []);
            await wait(ANALYSE_CONFIG.FLY_DURATION);

            useAnalyseStore.getState().setTokenState(token.id, "gone");

            const remaining = Math.max(
              0,
              interval - ANALYSE_CONFIG.HOVER_DURATION - ANALYSE_CONFIG.FLY_DURATION
            );
            await wait(remaining);
            interval *= ANALYSE_CONFIG.FLY_ACCEL;
          } else {
            lastTokenHadPosition = false;
            addNode(node, linkMap.get(node.id) ?? []);
            await wait(ANALYSE_CONFIG.MISSING_NODE_INTERVAL);
          }
        }

        // Let the last clone finish flying before scrolling to the next page
        if (lastTokenHadPosition) {
          await wait(ANALYSE_CONFIG.FLY_DURATION);
        }
      }

      // Quietly add related nodes that were never mentioned in the CV
      await wait(ANALYSE_CONFIG.FADE_DURATION * 0.5);
      const relatedMissing = getRelatedMissingNodes(mentionedIds, fullGraph, 4);
      for (const node of relatedMissing) {
        if (cancelled.current) return;
        addNode(node, linkMap.get(node.id) ?? []);
        await wait(ANALYSE_CONFIG.MISSING_NODE_INTERVAL);
      }
    },
    [paperRef, containerRef, snap]
  );
}
