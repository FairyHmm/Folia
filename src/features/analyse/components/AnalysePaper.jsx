import { useRef } from "react";
import { motion } from "framer-motion";
import { useAnalyseStore } from "../store/analyseStore";
import { getLineWords } from "../../../shared/utils/lineParser";
import classes from "../styles/analyse.module.css";

export default function AnalysePaper({
  lines,
  allTokens,
  paperRef,
  registerRef,
}) {
  const wordProgress = useAnalyseStore((s) => s.wordProgress);
  const tokenStates = useAnalyseStore((s) => s.tokenStates);

  // Shared occurrence counter so getLineWords produces tokenIds that match
  // those from extractTokens. Reset on every render via useRef initialiser —
  // this is intentional: the paper re-renders with the same lines, so the
  // counter must restart from zero each time to stay in sync.
  const occurrenceCount = useRef({});
  occurrenceCount.current = {};

  return (
    <motion.div
      ref={paperRef}
      className={classes.paper}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {lines.map((line, li) => {
        const visibleWordCount = wordProgress[li] ?? 0;
        const words = getLineWords(line, occurrenceCount.current);

        return (
          <p key={li} className={classes.line}>
            {words.map((entry, wi) => {
              const visible = entry.globalIndex < visibleWordCount;
              const tokenState = entry.isToken
                ? tokenStates[entry.tokenId]
                : "inline";
              const isHidden =
                tokenState === "hovering" ||
                tokenState === "flying" ||
                tokenState === "gone";

              return (
                <span
                  key={wi}
                  ref={
                    entry.isToken && entry.wordInSeg === 0
                      ? (el) => registerRef(entry.tokenId, el)
                      : undefined
                  }
                  className={classes.word}
                  style={{
                    opacity: visible ? 1 : 0,
                    visibility: isHidden ? "hidden" : "visible",
                  }}
                >
                  {entry.word}{" "}
                </span>
              );
            })}
          </p>
        );
      })}
    </motion.div>
  );
}
