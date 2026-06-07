import { motion } from "framer-motion";
import { useAnalyseStore } from "../store/analyseStore";
import classes from "../styles/analyse.module.css";

function FlyingToken({ token, pos, state, flyTarget }) {
  const variants = {
    hovering: {
      x: pos.x,
      y: pos.y - 8,
      opacity: 1,
      scale: 1.05,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    flying: {
      x: flyTarget.x,
      y: flyTarget.y,
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.6, ease: [0.12, 0, 0.9, 1] },
    },
  };

  return (
    <motion.span
      key={`${token.id}-clone`}
      className={classes.flyingToken}
      initial={{ x: pos.x, y: pos.y, opacity: 1, scale: 1 }}
      animate={state}
      variants={variants}
    >
      {token.value}
    </motion.span>
  );
}

export default function FlyingTokens({ allTokens, flyTarget }) {
  const tokenStates = useAnalyseStore((s) => s.tokenStates);
  const tokenPositions = useAnalyseStore((s) => s.tokenPositions);

  return allTokens.map((token) => {
    const pos = tokenPositions[token.id];
    const state = tokenStates[token.id];

    // No position, no state, still inline, or already gone — don't render
    if (!pos || !state || state === "inline" || state === "gone") return null;

    return (
      <FlyingToken
        key={token.id}
        token={token}
        pos={pos}
        state={state}
        flyTarget={flyTarget}
      />
    );
  });
}
