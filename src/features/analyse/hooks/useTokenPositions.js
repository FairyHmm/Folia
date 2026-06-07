import { useRef, useCallback } from "react";

export function useTokenPositions() {
  const tokenRefs = useRef({});

  const registerRef = useCallback((id, el) => {
    if (el) tokenRefs.current[id] = el;
  }, []);

  const snap = useCallback((paperRef, containerRef, allTokens) => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const container = containerRef.current;
        const paper = paperRef.current;
        if (!container || !paper) {
          resolve({});
          return;
        }

        const cRect = container.getBoundingClientRect();
        const pRect = paper.getBoundingClientRect();
        const positions = {};

        allTokens.forEach(({ id }) => {
          const el = tokenRefs.current[id];
          if (!el) return;
          const r = el.getBoundingClientRect();

          // Snap any token whose vertical midpoint is within the paper viewport.
          // Checking midpoint rather than full containment means tokens sitting
          // on the bottom edge (r.bottom slightly past pRect.bottom) are still
          // captured, preventing unnecessary fallback scrolls.
          const midY = (r.top + r.bottom) / 2;
          if (midY >= pRect.top && midY <= pRect.bottom) {
            positions[id] = {
              x: r.left - cRect.left,
              y: r.top - cRect.top,
              w: r.width,
              h: r.height,
            };
          }
        });

        resolve(positions);
      });
    });
  }, []);

  return { registerRef, snap };
}
