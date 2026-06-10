import { useRef, useState, useCallback } from "react";

// Picks a mimeType MediaRecorder actually supports in this browser
function getSupportedMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export function useSTT({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startSTT = useCallback(() => {
    if (listening) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mimeType = getSupportedMimeType();
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          // Stop all mic tracks immediately
          stream.getTracks().forEach((t) => t.stop());

          const blob = new Blob(chunksRef.current, {
            type: mimeType || "audio/webm",
          });
          chunksRef.current = [];

          setTranscribing(true);

          try {
            // Convert blob to base64
            const arrayBuffer = await blob.arrayBuffer();
            const base64 = btoa(
              String.fromCharCode(...new Uint8Array(arrayBuffer)),
            );

            const res = await fetch("/api/mentor/stt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audio: base64,
                mimeType: blob.type,
              }),
            });

            if (!res.ok) throw new Error("STT request failed");

            const { transcript } = await res.json();
            if (transcript?.trim()) {
              onTranscript(transcript.trim());
            }
          } catch (err) {
            console.error("STT error:", err);
          } finally {
            setTranscribing(false);
          }
        };

        recorder.start();
        setListening(true);
      })
      .catch((err) => {
        console.error("Mic access denied:", err);
      });
  }, [listening, onTranscript]);

  const stopSTT = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    setListening(false);
  }, []);

  return { listening, transcribing, startSTT, stopSTT };
}
