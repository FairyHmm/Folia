import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Box } from "@mantine/core";
import { useAnalyseStore } from "../store/analyseStore";
import { useOrchestrator } from "../hooks/useOrchestrator";
import { useTokenPositions } from "../hooks/useTokenPositions";
import { extractTokens } from "../../../shared/utils/lineParser";
import { cvStore } from "../../../shared/store/cvStore";
import { PHASES } from "../utils/analyseConfig";
import AnalysePaper from "./AnalysePaper";
import FlyingTokens from "./FlyingTokens";
import classes from "../styles/analyse.module.css";

export default function Analyse() {
  const containerRef = useRef(null);
  const paperRef = useRef(null);

  const { registerRef, snap } = useTokenPositions();
  const { run } = useOrchestrator(paperRef, containerRef, snap);

  const phase = useAnalyseStore((s) => s.phase);
  const cvData = cvStore((s) => s.cvData);
  const lines = cvData?.lines ?? [];
  const allTokens = extractTokens(lines);

  useEffect(() => {
    if (lines.length > 0) {
      run();
    }
  }, [lines.length, run]);

  const container = containerRef.current;
  const flyTarget = {
    x: container ? container.offsetWidth / 2 : 0,
    y: container ? container.offsetHeight * 0.25 : 0,
  };

  const showTokens = phase === PHASES.FLYING;

  return (
    <Box ref={containerRef} className={classes.container}>
      <AnimatePresence>
        {phase !== PHASES.DONE && (
          <AnalysePaper
            lines={lines}
            allTokens={allTokens}
            paperRef={paperRef}
            registerRef={registerRef}
          />
        )}
      </AnimatePresence>

      {showTokens && (
        <FlyingTokens
          allTokens={allTokens}
          flyTarget={flyTarget}
        />
      )}
    </Box>
  );
}
