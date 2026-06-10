import { useState, useCallback } from "react";
import { mentorStore } from "../store/mentorStore";
import { useTTS } from "./useTTS";
import { useSTT } from "./useSTT";

export function useMentor() {
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

  const toggleTTS = useCallback(() => {
    setTtsEnabled((prev) => {
      if (prev) stopTTS();
      return !prev;
    });
  }, [stopTTS]);

  const sendMessage = useCallback(
    async (overrideText, overrideSessionId) => {
      const text = overrideText ?? input;
      const trimmed = text.trim();
      const sessionId = overrideSessionId ?? activeSessionId;
      const session = sessions.find((s) => s.id === sessionId);

      if (!trimmed || isTyping) return;

      setInput("");

      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        ts: Date.now(),
      };

      addMessage(sessionId, userMessage);
      setIsTyping(true);

      try {
        const history = [...(session.messages ?? []), userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/mentor/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.ok) throw new Error("Chat request failed");

        const { reply } = await res.json();

        if (ttsEnabled && reply) await speak(reply);

        addMessage(sessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          ts: Date.now(),
        });
      } catch {
        addMessage(sessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          ts: Date.now(),
        });
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, activeSessionId, sessions, addMessage, ttsEnabled, speak],
  );

  // Start a session with a pre-added assistant message
  const startSession = useCallback(() => {
    const prefillMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Greetings. We are having an interview today. What is your name, and what is the position you are aiming for?",
      ts: Date.now(),
    };

    const id = newSession(prefillMessage);
    switchSession(id);
  }, [newSession, switchSession]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const stt = useSTT({
    onTranscript: (transcript) => setInput(transcript),
  });

  const startRename = (s) => {
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const commitRename = () => {
    if (editingTitle.trim()) renameSession(editingId, editingTitle.trim());
    setEditingId(null);
  };

  const handleRenameKey = (e) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setEditingId(null);
  };

  return {
    sessionsData: { sessions, activeSession, isTyping },

    sidebarActions: {
      startSession,
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

    ttsState: { ttsEnabled, toggleTTS, speaking },
  };
}
