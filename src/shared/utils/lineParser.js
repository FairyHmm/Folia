const COMBINED = /<<([^>]+)>>|\{\{([^}]+)\}\}|\(\(([^)]+)\)\)|\[\[([^\]]+)\]\]/g;

export function parseLine(line) {
  const segments = [];
  let last = 0;
  let match;

  COMBINED.lastIndex = 0;
  while ((match = COMBINED.exec(line)) !== null) {
    if (match.index > last) {
      segments.push({ type: "text", value: line.slice(last, match.index) });
    }
    const label = match[1] ?? match[2] ?? match[3] ?? match[4];
    const tier = match[1] ? 1 : match[2] ? 2 : match[3] ? 3 : 4;
    segments.push({ type: "token", value: label, tier });
    last = match.index + match[0].length;
  }

  if (last < line.length) {
    segments.push({ type: "text", value: line.slice(last) });
  }

  return segments;
}

// Returns every token occurrence in reading order — no dedup.
// Each occurrence gets a unique id: `${tier}:${value}:${occurrenceIndex}`.
// lineIndex is preserved so the fly phase can assign tokens to the correct page.
export function extractTokens(lines) {
  const occurrenceCount = {};
  const tokens = [];

  lines.forEach((line, lineIndex) => {
    parseLine(line).forEach((seg) => {
      if (seg.type !== "token") return;
      const baseKey = `${seg.tier}:${seg.value}`;
      const n = occurrenceCount[baseKey] ?? 0;
      occurrenceCount[baseKey] = n + 1;
      tokens.push({ ...seg, id: `${baseKey}:${n}`, lineIndex });
    });
  });

  return tokens;
}

// Returns flat word list for a line with segment + word indices.
// occurrenceCount is a shared mutable map { "tier:value" -> nextIndex } that
// the caller maintains across lines so tokenIds match those from extractTokens.
export function getLineWords(line, occurrenceCount) {
  const segments = parseLine(line);
  const words = [];
  let global = 0;

  segments.forEach((seg, si) => {
    const raw = seg.value.trim();
    if (!raw) return;
    const segWords = raw.split(/\s+/);

    let tokenId = null;
    if (seg.type === "token") {
      const baseKey = `${seg.tier}:${seg.value}`;
      const n = occurrenceCount[baseKey] ?? 0;
      occurrenceCount[baseKey] = n + 1;
      tokenId = `${baseKey}:${n}`;
    }

    segWords.forEach((word, wi) => {
      words.push({
        word,
        segIndex: si,
        wordInSeg: wi,
        globalIndex: global++,
        isToken: seg.type === "token",
        tier: seg.tier,
        tokenId,
        isLastInSeg: wi === segWords.length - 1,
      });
    });
  });

  return words;
}
