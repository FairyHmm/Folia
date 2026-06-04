import { useState, useEffect } from "react";

export function useUpload() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringDropzone, setIsHoveringDropzone] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleDrop = (files) => {
    if (files?.[0]) {
      setFile(files[0]);
      setText("");
    }
    setIsDragging(false);
    setIsHoveringDropzone(false);
  };

  const clearFile = () => setFile(null);

  useEffect(() => {
    const handleWindowDragOver = (e) => e.preventDefault();

    const handleWindowDragEnter = (e) => {
      e.preventDefault();
      if (e.dataTransfer?.types?.includes("Files")) {
        setIsDragging(true);
      }
    };

    const handleWindowDragLeave = (e) => {
      e.preventDefault();
      if (
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsDragging(false);
        setIsHoveringDropzone(false);
      }
    };

    const handleWindowDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      setIsHoveringDropzone(false);
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  const hasText = text.trim().length > 0;
  const canSubmit = !!file || hasText;
  const activeSection =
    file || isDragging ? "drop" : isFocused || hasText ? "paste" : "idle";

  const dropHeight =
    activeSection === "drop" ? 200 : activeSection === "paste" ? 0 : 100;
  const pasteHeight = 200 - dropHeight;

  return {
    file,
    text,
    setText,
    canSubmit,
    clearFile,
    isDragging,
    isHoveringDropzone,
    setIsHoveringDropzone,
    setIsFocused,
    dropHeight,
    pasteHeight,
    handleDrop,
  };
}
