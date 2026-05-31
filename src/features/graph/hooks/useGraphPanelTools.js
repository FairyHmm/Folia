import { graphStore } from "../store/graphStore";

function safeValue(value, fallback) {
  return value ?? fallback;
}

function safeOnChange(fn, transform) {
  return (...args) => {
    try {
      const value = transform ? transform(...args) : args[0];
      fn(value);
    } catch (e) {
      console.warn("[useGraphPanelTools] onChange error:", e);
    }
  };
}

export function useGraphPanelTools() {
  const activeView = graphStore((s) => s.activeView);
  const labels = graphStore((s) => s.labels);
  const charge = graphStore((s) => s.charge);
  const distance = graphStore((s) => s.distance);
  const gravity = graphStore((s) => s.gravity);

  const setView = graphStore((s) => s.setView);
  const setLabels = graphStore((s) => s.setLabels);
  const setCharge = graphStore((s) => s.setCharge);
  const setDistance = graphStore((s) => s.setDistance);
  const setGravity = graphStore((s) => s.setGravity);

  return {
    dimension: {
      value: safeValue(activeView, "2d"),
      onChange: safeOnChange(setView),
    },
    labels: {
      checked: safeValue(labels, false),
      onChange: safeOnChange(setLabels, (e) => e?.currentTarget?.checked ?? e),
    },
    charge: {
      value: safeValue(charge, -120),
      onChange: safeOnChange(setCharge),
    },
    distance: {
      value: safeValue(distance, 60),
      onChange: safeOnChange(setDistance),
    },
    gravity: {
      value: safeValue(gravity, 0.1),
      onChange: safeOnChange(setGravity),
    },
  };
}
