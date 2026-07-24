import { useCallback } from "react";
import { useAnalyseStore } from "../store/analyseStore";
import {
  buildRevealData,
  getRelatedMissingNodes,
} from "../utils/revealQueueBuilder";
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

const MAX_SPEED = 3;

export function useFlyingPhase(paperRef, containerRef, snap) {
  return useCallback(
    async (cvData, allTokens, cancelled) => {
      const addNode = graphDataStore.getState().addNode;
      const { pageBreaks, pageScrollTops } = useAnalyseStore.getState();

      const { nodeMap, linkMap, parentMap, mentionedIds, fullGraph } = buildRevealData(
        cvData,
        allTokens,
      );

      // Lazily ensure a node's full ancestor chain is in the graph before
      // the node itself arrives. This way structural nodes (role/domain/module)
      // appear the moment their first child skill flies in — no upfront dump,
      // no delayed batch. Edges connect immediately since parents are always
      // present before children.
      const ensureAncestors = (nodeId) => {
        const chain = [];
        let cursor = parentMap.get(nodeId);
        while (cursor) {
          chain.unshift(cursor);
          cursor = parentMap.get(cursor);
        }
        for (const ancestorId of chain) {
          const ancestor = nodeMap.get(ancestorId);
          if (ancestor) addNode(ancestor, linkMap.get(ancestorId) ?? []);
        }
      };

      const tokensWithNodes = [];
      for (const token of allTokens) {
        const node = nodeMap.get(token.value);
        if (node) tokensWithNodes.push({ token, node });
      }

      const total = Math.max(tokensWithNodes.length, 1);
      let processed = 0;

      const getSpeed = () => {
        const progress = processed / total;
        const eased = progress * progress; // acceleration curve
        return 1 + eased * (MAX_SPEED - 1);
      };

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

        const paper = paperRef.current;
        if (paper) {
          const targetScrollTop = pi === 0 ? 0 : (pageScrollTops[pi - 1] ?? 0);

          if (Math.abs(paper.scrollTop - targetScrollTop) > 2) {
            const speed = getSpeed();

            await smoothScrollTo(
              paper,
              targetScrollTop,
              ANALYSE_CONFIG.SCROLL_DURATION / speed,
            );

            await wait(300 / speed);
          }
        }

        const positions = await snap(paperRef, containerRef, allTokens);

        useAnalyseStore.getState().replaceTokenPositions(positions);

        await wait(100 / getSpeed());

        let lastTokenHadPosition = false;

        for (const { token, node } of pageItems) {
          if (cancelled.current) return;

          processed++;

          const speed = getSpeed();

          let hasPosition =
            !!useAnalyseStore.getState().tokenPositions[token.id];

          if (!hasPosition) {
            const paper = paperRef.current;

            if (paper) {
              const lineEl = paper.querySelectorAll("p")[token.lineIndex];

              if (lineEl) {
                await scrollToLine(
                  paper,
                  lineEl,
                  ANALYSE_CONFIG.SCROLL_DURATION / speed,
                );

                const newPositions = await snap(
                  paperRef,
                  containerRef,
                  allTokens,
                );

                useAnalyseStore.getState().replaceTokenPositions(newPositions);

                await wait(100 / speed);

                hasPosition =
                  !!useAnalyseStore.getState().tokenPositions[token.id];
              }
            }
          }

          if (hasPosition) {
            lastTokenHadPosition = true;

            useAnalyseStore.getState().setTokenState(token.id, "hovering");

            await wait(ANALYSE_CONFIG.HOVER_DURATION / speed);

            useAnalyseStore.getState().setTokenState(token.id, "flying");

            ensureAncestors(node.id);
            addNode(node, linkMap.get(node.id) ?? []);

            await wait(ANALYSE_CONFIG.FLY_DURATION / speed);

            useAnalyseStore.getState().setTokenState(token.id, "gone");

            const remaining = Math.max(
              0,
              interval -
                ANALYSE_CONFIG.HOVER_DURATION -
                ANALYSE_CONFIG.FLY_DURATION,
            );

            await wait(remaining / speed);

            interval *= ANALYSE_CONFIG.FLY_ACCEL;
          } else {
            lastTokenHadPosition = false;

            ensureAncestors(node.id);
            addNode(node, linkMap.get(node.id) ?? []);

            await wait(ANALYSE_CONFIG.MISSING_NODE_INTERVAL / speed);
          }
        }

        if (lastTokenHadPosition) {
          await wait(ANALYSE_CONFIG.FLY_DURATION / getSpeed());
        }
      }

      await wait((ANALYSE_CONFIG.FADE_DURATION * 0.5) / getSpeed());

      const relatedMissing = getRelatedMissingNodes(mentionedIds, fullGraph, 4);

      for (const node of relatedMissing) {
        if (cancelled.current) return;

        ensureAncestors(node.id);
        addNode(node, linkMap.get(node.id) ?? []);

        await wait(ANALYSE_CONFIG.MISSING_NODE_INTERVAL / getSpeed());
      }
    },
    [paperRef, containerRef, snap],
  );
}
