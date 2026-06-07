import { create } from "zustand";

export const useAnalyseStore = create((set) => ({
  phase: "idle",
  wordProgress: {},
  tokenStates: {},
  tokenPositions: {},
  pageBreaks: [],
  pageScrollTops: [],

  setPhase: (phase) => set({ phase }),

  revealWord: (lineIndex, count) =>
    set((state) => ({
      wordProgress: { ...state.wordProgress, [lineIndex]: count },
    })),

  setTokenState: (tokenId, tokenState) =>
    set((state) => ({
      tokenStates: { ...state.tokenStates, [tokenId]: tokenState },
    })),

  // Merges new positions into existing ones (used for incremental updates)
  setTokenPositions: (positions) =>
    set((state) => ({
      tokenPositions: { ...state.tokenPositions, ...positions },
    })),

  // Replaces all positions wholesale — use this at the start of each fly page
  // so stale positions from a previous scroll don't cause clones to spawn at
  // the wrong coordinates.
  replaceTokenPositions: (positions) =>
    set({ tokenPositions: positions }),

  // Only records the page break if the line index is new — guards against
  // double-appending pageScrollTops when run() is called twice in strict mode.
  addPageBreak: (lineIndex, scrollTop) =>
    set((state) => {
      if (state.pageBreaks.includes(lineIndex)) return {};
      return {
        pageBreaks: [...state.pageBreaks, lineIndex],
        pageScrollTops: [...state.pageScrollTops, scrollTop],
      };
    }),

  resetAnalyse: () =>
    set({
      phase: "idle",
      wordProgress: {},
      tokenStates: {},
      tokenPositions: {},
      pageBreaks: [],
      pageScrollTops: [],
    }),
}));
