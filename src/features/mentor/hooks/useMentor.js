import { useState, useCallback } from "react";
import { mentorStore } from "../store/mentorStore";
import { useTTS } from "./useTTS";
import { useSTT } from "./useSTT";

export function useMentor(context) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const {
    sessions,
    activeSessionId,
    newSession,
    switchSession,
    deleteSession,
    renameSession,
    addMessage,
  } = mentorStore();

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  const { speak, stop: stopTTS, speaking } = useTTS();

  // ----------------------------
  // TTS TOGGLE
  // ----------------------------
  const toggleTTS = useCallback(() => {
    setTtsEnabled((prev) => {
      if (prev) stopTTS();
      return !prev;
    });
  }, [stopTTS]);

  // ----------------------------
  // CORE SEND
  // ----------------------------
  const sendMessage = useCallback(
    async (overrideText) => {
      const text = typeof overrideText === "string" ? overrideText : input;
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setInput("");

      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        ts: Date.now(),
      };

      addMessage(activeSessionId, userMessage);
      setIsTyping(true);

      try {
        const history = [...(activeSession.messages ?? []), userMessage].map(
          (m) => ({ role: m.role, content: m.content }),
        );

        const res = await fetch("/api/mentor/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.ok) throw new Error("Chat request failed");

        const { reply } = await res.json();

        // When TTS is on: kick off audio immediately, show text only when it starts playing
        // When TTS is off: show text straight away
        if (ttsEnabled && reply) {
          await speak(reply);
        }

        addMessage(activeSessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          ts: Date.now(),
        });
      } catch (err) {
        console.error("Chat error:", err);

        addMessage(activeSessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          ts: Date.now(),
        });
      } finally {
        setIsTyping(false);
      }
    },
    [
      input,
      isTyping,
      activeSessionId,
      activeSession,
      addMessage,
      ttsEnabled,
      speak,
    ],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  // ----------------------------
  // STT — populates input, user sends manually
  // ----------------------------
  const stt = useSTT({
    onTranscript: (transcript) => {
      setInput(transcript);
    },
  });

  // ----------------------------
  // RENAME LOGIC
  // ----------------------------
  const startRename = (s) => {
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const commitRename = () => {
    if (editingTitle.trim()) {
      renameSession(editingId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleRenameKey = (e) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setEditingId(null);
  };

  // ----------------------------
  // RETURN
  // ----------------------------
  return {
    sessionsData: {
      sessions,
      activeSession,
      isTyping,
    },

    sidebarActions: {
      newSession,
      switchSession,
      deleteSession,
    },

    renameState: {
      editingId,
      editingTitle,
      setEditingTitle,
      startRename,
      commitRename,
      handleRenameKey,
    },

    chatActions: {
      input,
      setInput,
      sendMessage,
      handleKeyDown,
      stt,
    },

    ttsState: {
      ttsEnabled,
      toggleTTS,
      speaking,
    },
  };
}
