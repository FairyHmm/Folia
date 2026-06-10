import { useRef, useState, useCallback } from "react";

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);
  const activeUrlRef = useRef(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
    setSpeaking(false);
  }, []);

  // Returns a promise that resolves when audio finishes playing (or on error/skip)
  const speak = useCallback(
    (text) => {
      if (!text) return Promise.resolve();

      stop();

      return new Promise(async (resolve) => {
        try {
          setSpeaking(true);

          const res = await fetch("/api/mentor/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });

          if (!res.ok) throw new Error("TTS request failed");

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          activeUrlRef.current = url;

          const audio = new Audio(url);
          audioRef.current = audio;

          audio.onended = () => {
            if (activeUrlRef.current === url) {
              URL.revokeObjectURL(url);
              activeUrlRef.current = null;
            }
            setSpeaking(false);
            resolve();
          };

          audio.onerror = (e) => {
            console.error("Audio playback error:", e);
            if (activeUrlRef.current === url) {
              URL.revokeObjectURL(url);
              activeUrlRef.current = null;
            }
            setSpeaking(false);
            resolve(); // resolve anyway so chat isn't blocked
          };

          await audio.play();
        } catch (err) {
          console.error("TTS Frontend Error:", err);
          setSpeaking(false);
          resolve(); // resolve anyway so chat isn't blocked
        }
      });
    },
    [stop],
  );

  return { speak, stop, speaking };
}
