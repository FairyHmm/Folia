export function smoothScrollTo(el, top, duration = 700) {
  return new Promise((resolve) => {
    const start = el.scrollTop;
    const dist = top - start;
    if (Math.abs(dist) < 1) {
      resolve();
      return;
    }
    const startTime = performance.now();
    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      // Ease-in-out: starts and ends gently
      const eased = t * t * (3 - 2 * t);
      el.scrollTop = start + dist * eased;
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Scrolls the paper just enough to bring lineEl into view.
// If the line is already fully visible, does nothing.
export async function scrollToLine(paper, lineEl, scrollDuration) {
  const lineTop = lineEl.offsetTop;
  const lineBottom = lineEl.offsetTop + lineEl.offsetHeight;
  const viewTop = paper.scrollTop;
  const viewBottom = paper.scrollTop + paper.clientHeight;

  if (lineTop >= viewTop && lineBottom <= viewBottom) return;

  let target;
  if (lineTop < viewTop) {
    // Line is above viewport — scroll up to it
    target = Math.max(0, lineTop - 16);
  } else {
    // Line is below viewport — scroll down just enough to show it
    target = lineBottom - paper.clientHeight + 16;
  }

  await smoothScrollTo(paper, target, scrollDuration);
  await wait(300);
}
