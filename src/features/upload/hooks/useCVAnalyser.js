import { useState } from "react";
import { setCVData } from "../../../shared/store/cvStore";
import { setMode } from "../../layout/store/layoutStore";
import dummyDataAI from "../../../shared/data/dummyDataAI.json";

export function useCVAnalyser() {
  const [loading, setLoading] = useState(false);

  const handleAnalyse = async ({ text, canSubmit }) => {
    if (!canSubmit) return;
    setLoading(true);

    try {
      // Dev-only shortcut: type "demo" as the pasted text to load the
      // curated dummy dataset directly, skipping the backend entirely.
      if (text?.trim().toLowerCase() === "demo") {
        setCVData(dummyDataAI);
        setMode("analyse");
        return;
      }

      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Analysis failed" }));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();

      setCVData(data);
      setMode("analyse");
    } catch (error) {
      console.error("Analysis failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { handleAnalyse, loading };
}
