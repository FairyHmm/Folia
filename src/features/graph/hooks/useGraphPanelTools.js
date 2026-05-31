import { graphStore } from "../store/graphStore";

export function useGraphPanelTools() {
  const store = graphStore();

  return {
    dimension: {
      value: store.activeView,
      onChange: store.setView,
    },
    labels: {
      checked: store.labels,
      onChange: (e) =>
        store.setLabels(e?.currentTarget?.checked ?? e),
    },
    charge: { value: store.charge, onChange: store.setCharge },
    distance: { value: store.distance, onChange: store.setDistance },
    gravity: { value: store.gravity, onChange: store.setGravity },
  };
}
