import { useState } from "react";
import dummyDataAI from "../../../shared/data/dummyDataAI.json";
import { setCVData } from "../../../shared/store/cvStore";
import { setMode } from "../../layout/store/layoutStore";

export function useCVAnalyser() {
  const [loading, setLoading] = useState(false);

  const handleAnalyse = async ({ text, canSubmit }) => {
    if (!canSubmit) return;
    setLoading(true);

    try {
      // Fake AI call — replace with real API call later
      await new Promise((r) => setTimeout(r, 800));
      setCVData(dummyDataAI);
      setMode("analyse");
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return { handleAnalyse, loading };
}
