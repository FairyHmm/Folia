import { useState } from "react";
import extractTextFromFile from "../utils/fileExtractor";

export function useFileExtractor(onSubmit) {
  const [loading, setLoading] = useState(false);

  const handleAnalyse = async ({ file, text = "", canSubmit }) => {
    if (!canSubmit) return;
    setLoading(true);

    try {
      let rawText = file ? await extractTextFromFile(file, file.type) : text;

      const cleanText = rawText
        .replace(/[ \t]+/g, " ") // Collapses duplicate space and tabs
        .replace(/\n+/g, "\n") // Collapses duplicate newlines
        .replace(/\s*\n\s*/g, "\n") // Cleans trailing spaces
        .trim();

      console.log("================ Extracted Text Start ================");
      console.log(cleanText || "");
      console.log("================= Extracted Text End =================");

      await onSubmit?.({ text: cleanText });
    } catch (error) {
      console.error("Submission layout failure:", error);
    } finally {
      setLoading(false);
    }
  };

  return { handleAnalyse, loading };
}
